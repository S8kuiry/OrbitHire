# 🌌 OrbitHire

> AI-powered hiring platform that matches candidates to jobs semantically — not just by keywords.

## What Makes OrbitHire Different

Most job platforms match CVs using keyword search. OrbitHire uses **sentence transformers** to understand the *meaning* behind CVs and job descriptions — so a candidate who "built scalable web applications" matches a role requiring "full-stack development experience" even without identical keywords.

On top of that, OrbitHire implements a **federated learning loop** — every recruiter accept/reject decision trains the global matching model without any raw candidate data leaving the platform. The more it's used, the smarter it gets. Automatically.

And when a candidate is rejected? Instead of silence, they receive **personalized AI feedback** explaining exactly what skills were missing and how to improve — powered by Gemini.

## Core Features

- **Orbit Score™** — semantic CV-to-JD matching using `sentence-transformers/all-MiniLM-L6-v2`
- **Federated Learning** — FedAvg algorithm learns per-category hiring thresholds from recruiter decisions, stored in PostgreSQL, never loses progress on restart
- **Smart Rejection Feedback** — Gemini reads the actual CV + JD and generates specific, actionable feedback
- **Dual Dashboard** — separate recruiter and fresher experiences with Claude-style sidebar UI
- **Real-time Notifications** — freshers notified on application status, recruiters notified on new applications
- **CV Storage** — PDFs uploaded and stored on Cloudinary, viewable anytime by recruiter

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TailwindCSS, shadcn/ui |
| Auth | Clerk (Google OAuth) |
| Database | PostgreSQL on Neon.tech |
| ORM | Prisma |
| File Storage | Cloudinary |
| ML Backend | FastAPI, Python |
| NLP Matching | sentence-transformers |
| Federated Learning | Custom FedAvg implementation |
| AI Feedback | Google Gemini 1.5 Flash |
| Frontend Deploy | Vercel |
| ML Deploy | Render |

## Architecture
```
Fresher applies with PDF CV
        ↓
Next.js extracts CV → sends to FastAPI
        ↓
sentence-transformers computes Orbit Score™
        ↓
Recruiter accepts/rejects → signal stored
        ↓
FedAvg runs every 6h → model improves globally
        ↓
Rejected candidates receive personalized AI feedback
```

## Local Setup
```bash
# Clone
git clone https://github.com/yourusername/orbithire

# Frontend
cd client
npm install
npm run dev

# ML Backend
cd ml-backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Environment Variables
```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Database
DATABASE_URL=
DIRECT_URL=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# AI
GEMINI_API_KEY=

# ML Backend
ML_BACKEND_URL=http://localhost:8000
```

## What's Next

- [ ] Recruiter ↔ Fresher messaging system
- [ ] Resume improvement suggestions
- [ ] Job expiry automation
- [ ] Mobile app

---

Built by Subharthy — 3rd year BTech CSE
```

---

And yes — the **messaging feature** is a great addition. When you're ready we'll build it. It's the last major feature and will make OrbitHire feel like a complete product.

The architecture will be:
```
Recruiter accepts candidate
        ↓
A conversation thread opens between them
        ↓
Both can send messages
        ↓
Real-time or polling based
