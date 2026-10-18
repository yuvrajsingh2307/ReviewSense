"""
Train a genuine three-class TF-IDF + Logistic Regression sentiment classifier
on the cardiffnlp/tweet_eval sentiment dataset (negative / neutral / positive).
Saves the model and vectorizer to disk for use by the FastAPI backend.
"""

import os
import sys

# Ensure backend directory is on path so we can import preprocess_text
sys.path.insert(0, os.path.dirname(__file__))

import joblib
import numpy as np
from datasets import load_dataset
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    classification_report, confusion_matrix
)

from main import preprocess_text

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'sentiment_model.joblib')
VECTORIZER_PATH = os.path.join(os.path.dirname(__file__), 'tfidf_vectorizer.joblib')

# Dataset label names from cardiffnlp/tweet_eval: ['negative', 'neutral', 'positive']
DATASET_LABEL_MAP = {
    'negative': 'Negative',
    'neutral': 'Neutral',
    'positive': 'Positive',
}


def load_dataset_texts():
    """Load labeled reviews from cardiffnlp/tweet_eval sentiment dataset."""
    print("Loading cardiffnlp/tweet_eval sentiment dataset...")
    ds = load_dataset("cardiffnlp/tweet_eval", "sentiment")

    train_texts = ds["train"]["text"]
    train_labels = ds["train"]["label"]
    test_texts = ds["test"]["text"]
    test_labels = ds["test"]["label"]

    # Convert integer labels to string names
    label_names = ds["train"].features["label"].names
    train_labels_str = [label_names[l] for l in train_labels]
    test_labels_str = [label_names[l] for l in test_labels]

    return train_texts, train_labels_str, test_texts, test_labels_str


def main():
    train_texts, train_labels, test_texts, test_labels = load_dataset_texts()

    print(f"Train: {len(train_texts)}, Test: {len(test_texts)}")
    print(f"Label names: {sorted(set(train_labels))}")

    # Show distribution
    from collections import Counter
    train_dist = Counter(train_labels)
    test_dist = Counter(test_labels)
    print("Train distribution:", dict(sorted(train_dist.items())))
    print("Test distribution:", dict(sorted(test_dist.items())))

    print("Preprocessing texts (negation-aware + stemming)...")
    X_train = [preprocess_text(t) for t in train_texts]
    X_test = [preprocess_text(t) for t in test_texts]

    y_train = train_labels
    y_test = test_labels

    print("Vectorizing with TF-IDF...")
    vectorizer = TfidfVectorizer(max_features=10000, ngram_range=(1, 2))
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    print("Training Logistic Regression (3-class, multinomial)...")
    model = LogisticRegression(
        max_iter=2000,
        random_state=42,
        solver="lbfgs",
        class_weight="balanced",
    )
    model.fit(X_train_vec, y_train)

    print("Evaluating on held-out test set...")
    y_pred = model.predict(X_test_vec)
    y_proba = model.predict_proba(X_test_vec)

    acc = accuracy_score(y_test, y_pred)

    # Per-class metrics
    labels_sorted = sorted(set(y_test))
    prec = precision_score(y_test, y_pred, labels=labels_sorted, average=None, zero_division=0)
    rec = recall_score(y_test, y_pred, labels=labels_sorted, average=None, zero_division=0)
    f1 = f1_score(y_test, y_pred, labels=labels_sorted, average=None, zero_division=0)

    print("\n" + "=" * 60)
    print("TEST SET RESULTS (3-class)")
    print("=" * 60)
    print(f"Accuracy : {acc:.4f}")
    print()
    print(f"{'Class':<12} {'Precision':>10} {'Recall':>8} {'F1-Score':>10} {'Support':>8}")
    print("-" * 60)
    for i, label in enumerate(labels_sorted):
        support = (np.array(y_test) == label).sum()
        print(f"{label:<12} {prec[i]:>10.4f} {rec[i]:>8.4f} {f1[i]:>10.4f} {support:>8}")
    print("=" * 60)

    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, zero_division=0))

    print("\nConfusion Matrix (rows=true, cols=pred):")
    print("Labels:", labels_sorted)
    cm = confusion_matrix(y_test, y_pred, labels=labels_sorted)
    print("      " + "  ".join(f"{l[:4]:>4}" for l in labels_sorted))
    for i, row in enumerate(cm):
        print(f"{labels_sorted[i][:4]:>4} " + "  ".join(f"{v:>4}" for v in row))

    print(f"\nSaving model to {MODEL_PATH}")
    joblib.dump(model, MODEL_PATH)
    print(f"Saving vectorizer to {VECTORIZER_PATH}")
    joblib.dump(vectorizer, VECTORIZER_PATH)
    print("Done.")


if __name__ == "__main__":
    main()
