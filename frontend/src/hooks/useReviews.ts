import { useState, useEffect, useCallback } from 'react';
import { StoredReview, DashboardStats } from '../types';
import { SAMPLE_REVIEWS, generateId, formatDate } from '../utils/sampleData';
import { analyzeReview, analyzeBatch, analyzeCSV } from '../services/api';

const STORAGE_KEY = 'reviewsense_reviews';

export function useReviews() {
  const [reviews, setReviews] = useState<StoredReview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSampleData, setIsSampleData] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setReviews(JSON.parse(stored));
      } catch {
        loadSampleData();
      }
    } else {
      loadSampleData();
    }
  }, []);

  useEffect(() => {
    if (reviews.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
    }
  }, [reviews]);

  const loadSampleData = useCallback(() => {
    const sampleReviews: StoredReview[] = SAMPLE_REVIEWS.map((r, i) => ({
      ...r,
      id: `sample-${i}`,
      date: formatDate(),
      processed_text: r.review.toLowerCase().replace(/[^\w\s]/g, '').split(' ').filter(w => w.length > 2).slice(0, 5).join(' '),
    }));
    setReviews(sampleReviews);
    setIsSampleData(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleReviews));
  }, []);

  const clearSampleData = useCallback(() => {
    setReviews([]);
    setIsSampleData(false);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const addReview = useCallback(async (reviewText: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeReview(reviewText);
      const newReview: StoredReview = {
        ...result,
        id: generateId(),
        date: formatDate(),
      };
      setReviews(prev => [newReview, ...prev]);
      return newReview;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to analyze review';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const analyzeBatchReviews = useCallback(async (reviewTexts: string[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeBatch(reviewTexts);
      const newReviews: StoredReview[] = result.results.map(r => ({
        ...r,
        id: generateId(),
        date: formatDate(),
      }));
      setReviews(prev => [...newReviews, ...prev]);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to analyze reviews';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const analyzeCSVFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeCSV(file);
      const newReviews: StoredReview[] = result.results.map(r => ({
        ...r,
        id: generateId(),
        date: formatDate(),
      }));
      setReviews(prev => [...newReviews, ...prev]);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to analyze CSV';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getStats = useCallback((): DashboardStats => {
    if (reviews.length === 0) {
      return { totalReviews: 0, positivePercent: 0, neutralPercent: 0, negativePercent: 0 };
    }
    const positive = reviews.filter(r => r.sentiment === 'Positive').length;
    const neutral = reviews.filter(r => r.sentiment === 'Neutral').length;
    const negative = reviews.filter(r => r.sentiment === 'Negative').length;
    return {
      totalReviews: reviews.length,
      positivePercent: Math.round((positive / reviews.length) * 1000) / 10,
      neutralPercent: Math.round((neutral / reviews.length) * 1000) / 10,
      negativePercent: Math.round((negative / reviews.length) * 1000) / 10,
    };
  }, [reviews]);

  return {
    reviews,
    isLoading,
    error,
    isSampleData,
    addReview,
    analyzeBatchReviews,
    analyzeCSVFile,
    clearSampleData,
    loadSampleData,
    getStats,
  };
}
