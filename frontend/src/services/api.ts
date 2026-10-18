import { SentimentResult, BatchResult } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
    throw new Error(error.detail || `HTTP error ${response.status}`);
  }
  return response.json();
}

export async function analyzeReview(review: string): Promise<SentimentResult> {
  const response = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ review }),
  });
  return handleResponse<SentimentResult>(response);
}

export async function analyzeBatch(reviews: string[]): Promise<BatchResult> {
  const response = await fetch(`${API_BASE}/analyze-batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reviews }),
  });
  return handleResponse<BatchResult>(response);
}

export async function analyzeCSV(file: File): Promise<BatchResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/analyze-csv`, {
    method: 'POST',
    body: formData,
  });
  return handleResponse<BatchResult>(response);
}

export async function checkHealth(): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE}/health`);
  return handleResponse(response);
}
