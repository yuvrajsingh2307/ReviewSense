"""
ReviewSense Backend - FastAPI NLP Sentiment Analysis Service
Simplified version without heavy dependencies
"""

from fastapi import FastAPI, HTTPException, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from typing import Optional, List
import re
import string
from textblob import TextBlob
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer, PorterStemmer
from nltk.tokenize import word_tokenize
import json
import os
import joblib
import sys
import traceback

# Ensure NLTK resources are available in production
nltk_data_dir = os.path.join(os.path.dirname(__file__), 'nltk_data')
if os.path.exists(nltk_data_dir):
    nltk.data.path.insert(0, nltk_data_dir)
else:
    os.makedirs(nltk_data_dir, exist_ok=True)
    nltk.data.path.insert(0, nltk_data_dir)

try:
    nltk.download('punkt', quiet=True, download_dir=nltk_data_dir)
    nltk.download('stopwords', quiet=True, download_dir=nltk_data_dir)
    nltk.download('wordnet', quiet=True, download_dir=nltk_data_dir)
    nltk.download('punkt_tab', quiet=True, download_dir=nltk_data_dir)
except Exception:
    pass

app = FastAPI(
    title="ReviewSense API",
    description="NLP-Based Product Review Sentiment Analyzer",
    version="1.0.0"
)

# Configure CORS - allow local dev and production frontend
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "https://reviewsense-frontend-2795.onrender.com",
]

frontend_url = os.environ.get("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url.strip())

render_url = os.environ.get("RENDER_EXTERNAL_URL")
if render_url:
    allowed_origins.append(render_url.strip())

render_frontend = os.environ.get("RENDER_FRONTEND_URL")
if render_frontend:
    allowed_origins.append(render_frontend.strip())

# Also allow if frontend URL might be in different format
for origin in list(allowed_origins):
    if origin.startswith('https://') and 'onrender' in origin:
        pass  # keep as is

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=400,
        content={"detail": str(exc)},
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    print("UNHANDLED EXCEPTION:", exc, file=sys.stderr)
    traceback.print_exc(file=sys.stderr)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )

lemmatizer = WordNetLemmatizer()
stemmer = PorterStemmer()

NEGATION_WORDS = {'not', 'never', 'no', 'nor', 'none', 'neither'}

_full_stop_words = set(stopwords.words('english'))
stop_words = _full_stop_words - NEGATION_WORDS

def preprocess_text(text: str) -> str:
    """NLP Preprocessing Pipeline with negation preservation and stemming"""
    text = text.lower()
    text = re.sub(r'http\S+|www\S+', '', text)
    text = re.sub(r'@\w+|#\w+', '', text)
    text = text.translate(str.maketrans('', '', string.punctuation))
    tokens = word_tokenize(text)
    tokens = [t for t in tokens if t not in stop_words and len(t) > 2]
    tokens = [lemmatizer.lemmatize(t) for t in tokens]
    tokens = [stemmer.stem(t) for t in tokens]
    return ' '.join(tokens)

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'sentiment_model.joblib')
VECTORIZER_PATH = os.path.join(os.path.dirname(__file__), 'tfidf_vectorizer.joblib')

ml_model = None
tfidf_vectorizer = None

def load_ml_model():
    global ml_model, tfidf_vectorizer
    try:
        if os.path.exists(MODEL_PATH) and os.path.exists(VECTORIZER_PATH):
            ml_model = joblib.load(MODEL_PATH)
            tfidf_vectorizer = joblib.load(VECTORIZER_PATH)
            return True
        return False
    except Exception as e:
        print(f"Error loading model: {e}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        ml_model = None
        tfidf_vectorizer = None
        return False

LABEL_MAP = {
    "negative": "Negative",
    "neutral": "Neutral",
    "positive": "Positive",
}

def analyze_sentiment_ml(text: str) -> dict:
    """Analyze sentiment using trained ML classifier (3-class: Negative/Neutral/Positive)"""
    global ml_model, tfidf_vectorizer
    if ml_model is None or tfidf_vectorizer is None:
        return None
    try:
        processed = preprocess_text(text)
        if not processed.strip():
            processed = text
        X = tfidf_vectorizer.transform([processed])
        prediction = ml_model.predict(X)[0]
        proba = ml_model.predict_proba(X)[0]
        classes = ml_model.classes_
        class_probabilities = {}
        for cls, prob in zip(classes, proba):
            class_probabilities[LABEL_MAP.get(cls, cls)] = round(float(prob), 4)
        sentiment = LABEL_MAP.get(prediction, prediction)
        confidence = float(max(proba))
        return {
            "sentiment": sentiment,
            "score": confidence,
            "method": "ml",
            "class_probabilities": class_probabilities,
            "processed_text": processed,
        }
    except Exception as e:
        print(f"ML prediction error: {e}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        return None

def analyze_sentiment_textblob(text: str) -> dict:
    """Analyze sentiment using TextBlob baseline (fallback)"""
    try:
        polarity = TextBlob(text).sentiment.polarity
        if polarity > 0.05:
            sentiment = "Positive"
        elif polarity < -0.05:
            sentiment = "Negative"
        else:
            sentiment = "Neutral"
        processed = preprocess_text(text) or text
        return {
            "sentiment": sentiment,
            "score": round(abs(polarity), 2),
            "method": "textblob",
            "polarity": round(polarity, 2),
            "class_probabilities": None,
            "processed_text": processed,
        }
    except Exception as e:
        print(f"TextBlob error: {e}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        return {
            "sentiment": "Neutral",
            "score": 0.5,
            "method": "textblob",
            "polarity": 0.0,
            "class_probabilities": None,
            "processed_text": text,
        }

def analyze_sentiment(text: str) -> dict:
    """Analyze sentiment using trained ML classifier, with TextBlob fallback.
    Never labels model class probability as polarity. Returns dict with
    sentiment, score, method, polarity (TextBlob only), class_probabilities (ML only),
    and processed_text.
    """
    result = analyze_sentiment_ml(text)
    if result is not None:
        try:
            tb_polarity = TextBlob(text).sentiment.polarity
            result["polarity"] = round(tb_polarity, 2)
        except Exception:
            result["polarity"] = 0.0
        return result
    return analyze_sentiment_textblob(text)

@app.on_event("startup")
def startup_load_model():
    try:
        load_ml_model()
        if ml_model is not None:
            print("ML sentiment model loaded successfully", file=sys.stderr)
        else:
            print("ML sentiment model not found; using TextBlob baseline only", file=sys.stderr)
    except Exception as e:
        print(f"Startup error loading model: {e}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "ReviewSense API", "version": "1.0.0"}

@app.post("/api/analyze")
async def analyze_review(request: dict):
    try:
        review = request.get("review", "")
        if not review.strip():
            raise HTTPException(status_code=400, detail="Review text cannot be empty")
        if len(review.strip()) < 3:
            raise HTTPException(status_code=400, detail="Review text is too short")
        processed = preprocess_text(review)
        result = analyze_sentiment(processed if processed else review)
        return {
            "review": review,
            "sentiment": result["sentiment"],
            "score": result["score"],
            "polarity": result.get("polarity"),
            "method": result["method"],
            "class_probabilities": result.get("class_probabilities"),
            "processed_text": result["processed_text"],
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in analyze_review: {e}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/api/analyze-batch")
async def analyze_batch(request: dict):
    try:
        reviews = request.get("reviews", [])
        if not reviews:
            raise HTTPException(status_code=400, detail="No reviews provided")
        results = []
        positive_count = 0
        neutral_count = 0
        negative_count = 0
        total_score = 0
        for review in reviews:
            if not str(review).strip():
                continue
            processed = preprocess_text(str(review))
            result = analyze_sentiment(processed if processed else str(review))
            score = result["score"]
            results.append({
                "review": str(review),
                "sentiment": result["sentiment"],
                "score": score,
                "polarity": result.get("polarity"),
                "method": result["method"],
                "class_probabilities": result.get("class_probabilities"),
                "processed_text": result["processed_text"],
            })
            total_score += score
            if result["sentiment"] == "Positive":
                positive_count += 1
            elif result["sentiment"] == "Neutral":
                neutral_count += 1
            else:
                negative_count += 1
        total = len(results)
        avg_score = round(total_score / total, 2) if total > 0 else 0
        return {
            "results": results,
            "total": total,
            "positive_count": positive_count,
            "neutral_count": neutral_count,
            "negative_count": negative_count,
            "average_score": avg_score,
            "sentiment_distribution": {
                "positive": round(positive_count / total * 100, 1) if total > 0 else 0,
                "neutral": round(neutral_count / total * 100, 1) if total > 0 else 0,
                "negative": round(negative_count / total * 100, 1) if total > 0 else 0,
            },
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in analyze_batch: {e}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/api/analyze-csv")
async def analyze_csv(file: bytes = File(None)):
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
    try:
        import io
        import csv
        content = file.decode('utf-8')
        reader = csv.DictReader(io.StringIO(content))
        df = list(reader)
        if not df:
            raise HTTPException(status_code=400, detail="CSV file is empty")
        review_col = None
        for col in ['review', 'text', 'content', 'feedback', 'comment']:
            if col in df[0]:
                review_col = col
                break
        if not review_col:
            raise HTTPException(status_code=400, detail="CSV must contain a 'review', 'text', 'content', 'feedback', or 'comment' column")
        reviews = [row[review_col] for row in df if row.get(review_col)]
        request_data = {"reviews": reviews}
        return await analyze_batch(request_data)
    except HTTPException:
        raise
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="File must be UTF-8 encoded")
    except Exception as e:
        print(f"Error in analyze_csv: {e}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        raise HTTPException(status_code=500, detail="Internal server error")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
