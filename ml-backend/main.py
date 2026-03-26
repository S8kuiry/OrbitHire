from fastapi import FastAPI, HTTPException, UploadFile, File, Form
import pdfplumber
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from matcher import compute_orbit_score
from federated import store_signal, aggregate_weights, get_threshold
from dotenv import load_dotenv
from contextlib import asynccontextmanager
import asyncio
import io

load_dotenv()

# ── Auto-aggregation background task ─────────────────────────
async def auto_aggregate():
    """
    Runs FedAvg every 6 hours automatically.
    No manual intervention needed ever.
    """
    while True:
        await asyncio.sleep(6 * 60 * 60)  # 6 hours
        print("⚙️  Running scheduled federated aggregation...")
        result = aggregate_weights()
        print(f"✅ Aggregation done: {result}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Runs on server boot
    print("🚀 OrbitHire ML Backend starting...")
    print("⚙️  Starting auto-aggregation task (every 6 hours)...")
    asyncio.create_task(auto_aggregate())
    print("✅ Ready!")
    yield
    # Runs on server shutdown
    print("👋 Shutting down...")

# ── App init ──────────────────────────────────────────────────
app = FastAPI(
    title="OrbitHire ML Backend",
    description="Orbit Score™ matching + Federated Learning",
    version="1.0.0",
    lifespan=lifespan
)

# Allow Next.js to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*"  # add your Vercel URL later
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Request/Response Models ───────────────────────────────────

class ScoreRequest(BaseModel):
    cv_text: str
    jd_text: str
    job_category: str

class ScoreResponse(BaseModel):
    orbit_score: float
    threshold: float
    is_above_threshold: bool

class FeedbackSignal(BaseModel):
    application_id: str
    job_category: str
    orbit_score: float
    outcome: str  # "ACCEPTED" or "REJECTED"

# ── Routes ────────────────────────────────────────────────────

@app.get("/")
def root():
    return {
        "status": "OrbitHire ML Backend is running 🚀",
        "version": "1.0.0"
    }

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/score", response_model=ScoreResponse)
async def score_cv(request: ScoreRequest):
    """
    Computes Orbit Score™ for a CV against a Job Description.
    Also returns the learned threshold for this category
    so the frontend knows if the score is above average.
    """
     # Debug — see exactly what we received
    print(f"cv_text length: {len(request.cv_text)}")
    print(f"jd_text length: {len(request.jd_text)}")
    print(f"cv_text preview: {request.cv_text[:100]}")
    if not request.cv_text.strip() or not request.jd_text.strip():
        raise HTTPException(
            status_code=400,
            detail="cv_text and jd_text are required"
        )

    # Compute semantic similarity score
    score = compute_orbit_score(
        cv_text=request.cv_text,
        jd_text=request.jd_text,
        job_category=request.job_category
    )

    # Get learned threshold for this category
    threshold = get_threshold(request.job_category)

    return ScoreResponse(
        orbit_score=score,
        threshold=threshold,
        is_above_threshold=score >= threshold
    )

@app.post("/feedback")
async def record_feedback(signal: FeedbackSignal):
    """
    Records a recruiter accept/reject signal.
    This is the training data for federated learning.
    Stored permanently in Neon DB.
    """
    if signal.outcome not in ["ACCEPTED", "REJECTED"]:
        raise HTTPException(
            status_code=400,
            detail="outcome must be ACCEPTED or REJECTED"
        )

    store_signal(
        application_id=signal.application_id,
        job_category=signal.job_category,
        orbit_score=signal.orbit_score,
        outcome=signal.outcome
    )

    return {
        "status": "Signal recorded ✅",
        "category": signal.job_category,
        "outcome": signal.outcome
    }

@app.post("/aggregate")
async def trigger_aggregation():
    """
    Manually triggers federated weight aggregation.
    Normally runs automatically every 6 hours.
    """
    result = aggregate_weights()
    return {
        "status": "Aggregation complete ✅",
        "weights": result
    }

@app.get("/weights")
async def get_weights():
    """
    Returns current learned thresholds per category.
    Useful for debugging and monitoring model progress.
    """
    try:
        from federated import get_db_connection
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT "jobCategory", "threshold", "sampleCount", "updatedAt"
            FROM "GlobalWeights"
            ORDER BY "sampleCount" DESC
        """)
        rows = cur.fetchall()
        cur.close()
        conn.close()

        return {
            "weights": [
                {
                    "category": row[0],
                    "threshold": row[1],
                    "sample_count": row[2],
                    "last_updated": str(row[3])
                }
                for row in rows
            ]
        }
    except Exception as e:
        return {"error": str(e)}



@app.post("/score-from-pdf")
async def score_from_pdf(
    cv: UploadFile = File(...),
    jd_text: str = Form(...),
    job_category: str = Form(...)
):
    try:
        # Read file into memory
        pdf_bytes = await cv.read()
        
        cv_text = ""
        # Using pdfplumber to extract text
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    cv_text += page_text + "\n"

        # Check if we actually got text (prevents 400 errors downstream)
        if not cv_text.strip():
            print("❌ Extraction failed: PDF might be a scanned image.")
            raise HTTPException(
                status_code=400, 
                detail="Could not extract text. Please ensure the PDF is not a scanned image."
            )

        print(f"✅ Extracted {len(cv_text)} characters from CV")

        # Compute semantic similarity using your existing matcher.py logic
        score = compute_orbit_score(
            cv_text=cv_text,
            jd_text=jd_text,
            job_category=job_category
        )

        threshold = get_threshold(job_category)

        return {
            "orbit_score": score,
            "threshold": threshold,
            "is_above_threshold": score >= threshold,
            "cv_text_preview": cv_text[:200] # Useful for debugging
        }

    except Exception as e:
        print(f"❌ Orbit Score Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Server Error: {str(e)}")