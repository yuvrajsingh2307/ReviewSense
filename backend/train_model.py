"""
Train a TF-IDF + Logistic Regression sentiment classifier on the NLTK
movie_reviews corpus. Saves the model and vectorizer to disk for use
by the FastAPI backend.
"""

import os
import sys

# Ensure backend directory is on path so we can import preprocess_text
sys.path.insert(0, os.path.dirname(__file__))

import joblib
import nltk
from nltk.corpus import movie_reviews
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report

from main import preprocess_text

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'sentiment_model.joblib')
VECTORIZER_PATH = os.path.join(os.path.dirname(__file__), 'tfidf_vectorizer.joblib')

nltk.download('movie_reviews', quiet=True)


def load_dataset():
    """Load labeled reviews from NLTK movie_reviews corpus."""
    fileids = movie_reviews.fileids()
    texts = []
    labels = []
    for fid in fileids:
        texts.append(movie_reviews.raw(fid))
        label = 'pos' if fid.startswith('pos/') else 'neg'
        labels.append(label)
    return texts, labels


def main():
    print("Loading NLTK movie_reviews dataset...")
    texts, labels = load_dataset()
    print(f"Total reviews: {len(texts)}")
    print(f"Positive: {labels.count('pos')}, Negative: {labels.count('neg')}")

    print("Preprocessing texts (negation-aware + stemming)...")
    processed_texts = [preprocess_text(t) for t in texts]

    print("Splitting into train/test (80/20, stratified)...")
    X_train, X_test, y_train, y_test = train_test_split(
        processed_texts, labels,
        test_size=0.2,
        random_state=42,
        stratify=labels
    )
    print(f"Train: {len(X_train)}, Test: {len(X_test)}")

    print("Vectorizing with TF-IDF...")
    vectorizer = TfidfVectorizer(max_features=10000, ngram_range=(1, 2))
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    print("Training Logistic Regression...")
    model = LogisticRegression(max_iter=1000, random_state=42)
    model.fit(X_train_vec, y_train)

    print("Evaluating on held-out test set...")
    y_pred = model.predict(X_test_vec)

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, pos_label='pos')
    rec = recall_score(y_test, y_pred, pos_label='pos')
    f1 = f1_score(y_test, y_pred, pos_label='pos')

    print("\n" + "=" * 50)
    print("TEST SET RESULTS")
    print("=" * 50)
    print(f"Accuracy : {acc:.4f}")
    print(f"Precision: {prec:.4f}")
    print(f"Recall   : {rec:.4f}")
    print(f"F1-Score : {f1:.4f}")
    print("=" * 50)
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))

    print(f"\nSaving model to {MODEL_PATH}")
    joblib.dump(model, MODEL_PATH)
    print(f"Saving vectorizer to {VECTORIZER_PATH}")
    joblib.dump(vectorizer, VECTORIZER_PATH)
    print("Done.")


if __name__ == "__main__":
    main()
