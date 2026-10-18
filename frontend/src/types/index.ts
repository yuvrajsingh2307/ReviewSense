export interface SentimentResult {
  review: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  score: number;
  polarity: number;
  processed_text: string;
  method?: 'ml' | 'textblob';
  class_probabilities?: Record<string, number>;
}

export interface BatchResult {
  results: SentimentResult[];
  total: number;
  positive_count: number;
  neutral_count: number;
  negative_count: number;
  average_score: number;
  sentiment_distribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export interface StoredReview extends SentimentResult {
  id: string;
  date: string;
}

export interface DashboardStats {
  totalReviews: number;
  positivePercent: number;
  neutralPercent: number;
  negativePercent: number;
}

export type NavPage = 'dashboard' | 'analyze' | 'batch' | 'insights' | 'history';
