import json
import os
import numpy as np
from datetime import datetime
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    return psycopg2.connect(os.getenv("DATABASE_URL"))

def store_signal(application_id: str, job_category: str, orbit_score: float, outcome: str):
    """
    Stores recruiter signal permanently in Neon DB.
    Never lost even if server restarts.
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            INSERT INTO "FederatedUpdate" 
            ("id", "jobCategory", "weightDelta", "contributorCount", "createdAt")
            VALUES (
                gen_random_uuid()::text,
                %s,
                %s::jsonb,
                1,
                NOW()
            )
        """, (
            job_category,
            json.dumps({
                "application_id": application_id,
                "orbit_score": orbit_score,
                "outcome": outcome,
                "timestamp": datetime.now().isoformat()
            })
        ))

        conn.commit()
        cur.close()
        conn.close()
        print(f"✅ Signal stored: {job_category} | score={orbit_score} | outcome={outcome}")

    except Exception as e:
        print(f"❌ DB error storing signal: {e}")

def aggregate_weights():
    """
    FedAvg — reads ALL historical signals from DB.
    Saves learned thresholds BACK to DB.
    Completely stateless — server can restart anytime.
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Fetch all signals
        cur.execute("""
            SELECT "jobCategory", "weightDelta"
            FROM "FederatedUpdate"
            ORDER BY "createdAt" ASC
        """)
        rows = cur.fetchall()

        if not rows:
            cur.close()
            conn.close()
            return {"message": "No signals yet — keep using the platform!"}

        # Group by category
        category_data: dict = {}
        for job_category, weight_delta in rows:
            if job_category not in category_data:
                category_data[job_category] = {"accepted": [], "rejected": []}

            delta = weight_delta if isinstance(weight_delta, dict) else json.loads(weight_delta)
            score = delta.get("orbit_score", 0)
            outcome = delta.get("outcome", "")

            if outcome == "ACCEPTED":
                category_data[job_category]["accepted"].append(score)
            elif outcome == "REJECTED":
                category_data[job_category]["rejected"].append(score)

        # FedAvg — compute thresholds
        learned_thresholds = {}
        for category, data in category_data.items():
            accepted = data["accepted"]
            rejected = data["rejected"]
            total = len(accepted) + len(rejected)

            if accepted and rejected:
                avg_accepted = np.mean(accepted)
                avg_rejected = np.mean(rejected)
                threshold = (avg_accepted + avg_rejected) / 2
                learned_thresholds[category] = (round(float(threshold), 2), total)
            elif accepted:
                learned_thresholds[category] = (round(float(np.mean(accepted)), 2), total)

        # Save weights to DB — upsert per category
        for category, (threshold, count) in learned_thresholds.items():
            cur.execute("""
                INSERT INTO "GlobalWeights" ("id", "jobCategory", "threshold", "sampleCount", "updatedAt")
                VALUES (gen_random_uuid()::text, %s, %s, %s, NOW())
                ON CONFLICT ("jobCategory")
                DO UPDATE SET 
                    "threshold" = ("GlobalWeights"."threshold" * 0.4 + EXCLUDED."threshold" * 0.6),
                    "sampleCount" = EXCLUDED."sampleCount",
                    "updatedAt" = NOW()
            """, (category, threshold, count))

        conn.commit()
        cur.close()
        conn.close()

        print(f"✅ Weights aggregated and saved to DB")
        return learned_thresholds

    except Exception as e:
        print(f"❌ Aggregation error: {e}")
        return {"error": str(e)}

def get_threshold(job_category: str) -> float:
    """
    Reads learned threshold from DB.
    Falls back to 50.0 if no data yet.
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT "threshold" FROM "GlobalWeights"
            WHERE "jobCategory" = %s
        """, (job_category,))

        row = cur.fetchone()
        cur.close()
        conn.close()

        if row:
            return float(row[0])
        return 50.0

    except Exception as e:
        print(f"❌ Error fetching threshold: {e}")
