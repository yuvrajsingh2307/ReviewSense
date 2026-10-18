# Render Deployment Instructions for ReviewSense

## Prerequisites
- Deployed model files must be present: backend/sentiment_model.joblib and backend/tfidf_vectorizer.joblib
- Frontend build will use VITE_API_URL for the backend API

## Backend (FastAPI) on Render

Service type: Web Service
Build Command: pip install -r backend/requirements.txt
Start Command: cd backend && python main.py

Environment variables (recommended):
- PORT: (Render sets automatically, but app reads from env)
- FRONTEND_URL: https://your-frontend-domain.onrender.com
- RENDER_EXTERNAL_URL: https://your-backend-domain.onrender.com (optional)

Notes:
- App binds to 0.0.0.0 and reads PORT from environment
- CORS allows localhost dev and any FRONTEND_URL/RENDER_EXTERNAL_URL provided
- NLTK resources download to backend/nltk_data on first run
- Model files loaded from backend directory using relative paths

## Frontend (React + Vite) on Render

Service type: Static Site
Build Command: cd frontend && npm install && npm run build
Publish Directory: frontend/dist

Environment variables:
- VITE_API_URL: https://your-backend-domain.onrender.com/api (required for production)

Notes:
- API base URL falls back to http://localhost:8000/api in development
- .env.example provided for reference
