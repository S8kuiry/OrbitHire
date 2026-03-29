from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def compute_orbit_score(cv_text: str, jd_text: str, job_category: str) -> float:
    vectorizer = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2),
        max_features=10000
    )

    tfidf = vectorizer.fit_transform([cv_text, jd_text])
    similarity = cosine_similarity(tfidf[0], tfidf[1])[0][0]
    score = round(float((similarity + 1) / 2 * 100), 2)

    return score