import { SentimentResult } from '../types';

export const SAMPLE_REVIEWS: Omit<SentimentResult, 'processed_text'>[] = [
  { review: "Absolutely loved this product! The quality exceeded my expectations.", sentiment: "Positive", score: 0.95, polarity: 0.95 },
  { review: "Great value for money. Works perfectly and arrived on time.", sentiment: "Positive", score: 0.88, polarity: 0.88 },
  { review: "The product is okay, nothing particularly impressive but does the job.", sentiment: "Neutral", score: 0.1, polarity: 0.1 },
  { review: "Very disappointed. The product stopped working after two days.", sentiment: "Negative", score: 0.85, polarity: -0.85 },
  { review: "Amazing quality! Will definitely buy again from this brand.", sentiment: "Positive", score: 0.92, polarity: 0.92 },
  { review: "Terrible experience. The product was not as described at all.", sentiment: "Negative", score: 0.9, polarity: -0.9 },
  { review: "Average product. Some features work well, others are lacking.", sentiment: "Neutral", score: 0.05, polarity: 0.05 },
  { review: "Fantastic purchase! The build quality is exceptional.", sentiment: "Positive", score: 0.94, polarity: 0.94 },
  { review: "Not worth the price. There are better alternatives available.", sentiment: "Negative", score: 0.65, polarity: -0.65 },
  { review: "Pretty good overall. Would recommend to friends.", sentiment: "Positive", score: 0.72, polarity: 0.72 },
  { review: "It's fine. Does what it's supposed to do without any issues.", sentiment: "Neutral", score: 0.08, polarity: 0.08 },
  { review: "Extremely happy with this purchase. Five stars!", sentiment: "Positive", score: 0.97, polarity: 0.97 },
  { review: "Waste of money. The product broke on the first use.", sentiment: "Negative", score: 0.92, polarity: -0.92 },
  { review: "The quality is decent for the price point.", sentiment: "Neutral", score: 0.12, polarity: 0.12 },
  { review: "Love it! Best purchase I've made this year.", sentiment: "Positive", score: 0.96, polarity: 0.96 },
  { review: "The product feels cheap and flimsy. Expected better.", sentiment: "Negative", score: 0.78, polarity: -0.78 },
  { review: "Reasonable product but customer service could be better.", sentiment: "Neutral", score: 0.15, polarity: 0.15 },
  { review: "Perfect! Exactly what I needed. Very satisfied.", sentiment: "Positive", score: 0.93, polarity: 0.93 },
  { review: "Product arrived damaged. Very unhappy with this experience.", sentiment: "Negative", score: 0.88, polarity: -0.88 },
  { review: "Good product overall, but shipping was slower than expected.", sentiment: "Neutral", score: 0.18, polarity: 0.18 },
];

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getSentimentColor(sentiment: string): string {
  switch (sentiment) {
    case 'Positive': return 'text-emerald-400';
    case 'Negative': return 'text-red-400';
    default: return 'text-amber-400';
  }
}

export function getSentimentBgColor(sentiment: string): string {
  switch (sentiment) {
    case 'Positive': return 'bg-emerald-500/10 border-emerald-500/30';
    case 'Negative': return 'bg-red-500/10 border-red-500/30';
    default: return 'bg-amber-500/10 border-amber-500/30';
  }
}
