from sklearn.metrics.pairwise import cosine_similarity
import numpy as np


# Load model once when server starts
# all-MiniLM-L6-v2 is fast, lightweight and very accurate
_model = None

def get_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        print("Loading sentence transformer model...")
        _model = SentenceTransformer("all-MiniLM-L6-v2")
        print("Model loaded ✅")
    return _model

def compute_orbit_score(cv_text: str, jd_text: str, job_category: str) -> float:
    """
    Computes semantic similarity between CV and Job Description.
    
    How it works:
    1. Convert both texts into vectors (embeddings)
       - These vectors capture MEANING not just keywords
       - "built ML models" and "developed machine learning solutions" 
         will have similar vectors
    2. Compute cosine similarity between vectors
       - Returns value between -1 and 1
    3. Convert to 0-100 score
    """
    model = get_model()

    # Step 1 — Encode both texts into vectors
    embeddings = model.encode([cv_text, jd_text])
    
    cv_embedding = embeddings[0]   # vector for CV
    jd_embedding = embeddings[1]   # vector for JD
    
    # Step 2 — Compute cosine similarity
    # reshape needed because cosine_similarity expects 2D arrays
    similarity = cosine_similarity(
        cv_embedding.reshape(1, -1),
        jd_embedding.reshape(1, -1)
    )[0][0]
    
    # Step 3 — Convert to 0-100 scale
    # cosine similarity ranges from -1 to 1
    # we map it to 0-100
    score = float((similarity + 1) / 2 * 100)
    
    # Round to 2 decimal places
    score = round(score, 2)
    
    return score