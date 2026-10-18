import { CheckCircle, XCircle, TrendingUp, Sparkles, Info } from 'lucide-react';
import { StoredReview } from '../types';

interface InsightsProps {
  reviews: StoredReview[];
  isSampleData: boolean;
}

function generateSummary(reviews: StoredReview[]): string {
  if (reviews.length === 0) {
    return "No reviews have been analyzed yet. Start by analyzing some customer reviews to generate insights.";
  }

  const positive = reviews.filter(r => r.sentiment === 'Positive').length;
  const neutral = reviews.filter(r => r.sentiment === 'Neutral').length;
  const negative = reviews.filter(r => r.sentiment === 'Negative').length;
  const total = reviews.length;

  const positivePercent = Math.round((positive / total) * 100);
  const negativePercent = Math.round((negative / total) * 100);
  const avgScore = reviews.reduce((sum, r) => sum + r.score, 0) / total;

  let summary = "";

  if (positivePercent >= 60) {
    summary = `Most customers appear satisfied with the product. With ${positivePercent}% positive sentiment, `;
    summary += positivePercent >= 80 ? "the overwhelming majority of reviews express satisfaction." : "positive reviews dominate the analyzed dataset.";
  } else if (negativePercent >= 40) {
    summary = `A significant portion of customers have expressed dissatisfaction. With ${negativePercent}% negative sentiment, `;
    summary += "there are notable concerns that need attention.";
  } else if (neutral >= total * 0.5) {
    summary = `The reviews show a mixed or neutral sentiment. Many customers appear to have neither strong positive nor negative opinions.`;
  } else {
    summary = `The sentiment is fairly balanced across positive and negative reviews. `;
  }

  if (negativePercent > 10) {
    const topNegativeReview = reviews.filter(r => r.sentiment === 'Negative').sort((a, b) => a.score - b.score)[0];
    if (topNegativeReview) {
      summary += ` Negative reviews highlight issues such as: "${topNegativeReview.review.substring(0, 50)}..."`;
    }
  }

  summary += ` The average sentiment score is ${avgScore.toFixed(2)}, indicating an overall ${avgScore > 0.5 ? 'positive' : avgScore > 0 ? 'mildly positive' : avgScore > -0.1 ? 'neutral' : 'negative'} tone.`;

  return summary;
}

export function Insights({ reviews, isSampleData }: InsightsProps) {
  const avgScore = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.score, 0) / reviews.length : 0;

  const positive = reviews.filter(r => r.sentiment === 'Positive').length;
  const neutral = reviews.filter(r => r.sentiment === 'Neutral').length;
  const negative = reviews.filter(r => r.sentiment === 'Negative').length;

  if (reviews.length === 0) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[var(--rs-text)] tracking-tight">Customer Insights</h1>
          <p className="text-[var(--rs-text-muted)]">Analytics and trends from analyzed reviews.</p>
        </div>
        <div className="bg-[var(--rs-card)] rounded-xl border border-[var(--rs-border)] p-12 text-center theme-transition">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--rs-muted-bg)]/50 flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-[var(--rs-text-muted)]" />
          </div>
          <p className="text-[var(--rs-text-muted)] text-lg">No reviews analyzed yet.</p>
          <p className="text-sm text-[var(--rs-text-muted)] mt-1">Analyze your first review to see customer insights.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-[var(--rs-text)] tracking-tight">Customer Insights</h1>
        <p className="text-[var(--rs-text-muted)]">Analytics and trends from analyzed reviews.</p>
      </div>

      {isSampleData && (
        <div className="px-5 py-3 bg-[var(--rs-accent-light)] border border-[var(--rs-accent)]/30 rounded-lg text-sm">
          <p className="text-[var(--rs-accent)]">
            Displaying insights from sample data. Clear sample data to analyze your own reviews.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[var(--rs-card)] rounded-xl border border-[var(--rs-border)] p-5 theme-transition">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-semibold text-[var(--rs-text-muted)] uppercase tracking-wider">Positive</span>
          </div>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{Math.round((positive / reviews.length) * 100)}%</p>
        </div>
        <div className="bg-[var(--rs-card)] rounded-xl border border-[var(--rs-border)] p-5 theme-transition">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-5 h-5 text-amber-600 dark:text-amber-400">—</span>
            <span className="text-xs font-semibold text-[var(--rs-text-muted)] uppercase tracking-wider">Neutral</span>
          </div>
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{Math.round((neutral / reviews.length) * 100)}%</p>
        </div>
        <div className="bg-[var(--rs-card)] rounded-xl border border-[var(--rs-border)] p-5 theme-transition">
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="text-xs font-semibold text-[var(--rs-text-muted)] uppercase tracking-wider">Negative</span>
          </div>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">{Math.round((negative / reviews.length) * 100)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--rs-card)] rounded-xl border border-[var(--rs-border)] p-6 theme-transition">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-[var(--rs-accent)]" />
            <h3 className="text-lg font-semibold text-[var(--rs-text)]">Average Sentiment Score</h3>
          </div>
          <p className="text-4xl font-bold font-mono text-[var(--rs-text)]">{avgScore.toFixed(2)}</p>
          <p className="text-sm text-[var(--rs-text-muted)] mt-1">Out of 1.0</p>
        </div>

        <div className="bg-[var(--rs-card)] rounded-xl border border-[var(--rs-border)] p-6 theme-transition">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-[var(--rs-accent)]" />
            <h3 className="text-lg font-semibold text-[var(--rs-text)]">Customer Summary</h3>
          </div>
          <p className="text-sm text-[var(--rs-text)] leading-relaxed">{generateSummary(reviews)}</p>
        </div>
      </div>

      <div className="bg-[var(--rs-card)] rounded-xl border border-[var(--rs-border)] p-6 theme-transition">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-[var(--rs-accent)]" />
          <h3 className="text-lg font-semibold text-[var(--rs-text)]">About the Model</h3>
        </div>
        <div className="space-y-3 text-sm text-[var(--rs-text)]">
          <p><strong>Dataset:</strong> cardiffnlp/tweet_eval sentiment dataset (3-class: Negative, Neutral, Positive).</p>
          <p><strong>Model Type:</strong> TF-IDF + Logistic Regression (multinomial, max_iter=2000, class_weight="balanced", ngram_range (1,2), max_features=10000), with NLTK preprocessing (negation-aware tokenization, stopword removal excluding negations, lemmatization, stemming). TextBlob is used as a fallback when ML model is unavailable.</p>
          <p><strong>Training Note:</strong> The model was trained on <strong>tweet data</strong>, not product reviews. Applying it to product reviews is a domain transfer; performance on product reviews may differ from the reported tweet-based metrics.</p>
          <p className="font-medium mt-4">Verified Metrics (from existing training report on held-out test set):</p>
          <div className="overflow-x-auto">
            <table className="w-full mt-2">
              <thead>
                <tr className="text-left text-xs text-[var(--rs-text-muted)] border-b border-[var(--rs-border)]">
                  <th className="pb-2 pr-4">Metric</th>
                  <th className="pb-2 pr-4">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--rs-border)]">
                <tr><td className="py-2 pr-4">Held-out Accuracy</td><td className="py-2 pr-4 font-mono">58.78%</td></tr>
              </tbody>
            </table>
          </div>
          <p className="font-medium mt-4">Per-class Metrics (verified):</p>
          <div className="overflow-x-auto">
            <table className="w-full mt-2">
              <thead>
                <tr className="text-left text-xs text-[var(--rs-text-muted)] border-b border-[var(--rs-border)]">
                  <th className="pb-2 pr-4">Class</th>
                  <th className="pb-2 pr-4">Precision</th>
                  <th className="pb-2 pr-4">Recall</th>
                  <th className="pb-2 pr-4">F1-Score</th>
                  <th className="pb-2 pr-4">Support</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--rs-border)]">
                <tr><td className="py-2 pr-4">Negative</td><td className="py-2 pr-4 font-mono">0.5594</td><td className="py-2 pr-4 font-mono">0.6326</td><td className="py-2 pr-4 font-mono">0.5938</td><td className="py-2 pr-4 font-mono">323</td></tr>
                <tr><td className="py-2 pr-4">Neutral</td><td className="py-2 pr-4 font-mono">0.5943</td><td className="py-2 pr-4 font-mono">0.5911</td><td className="py-2 pr-4 font-mono">0.5927</td><td className="py-2 pr-4 font-mono">572</td></tr>
                <tr><td className="py-2 pr-4">Positive</td><td className="py-2 pr-4 font-mono">0.5985</td><td className="py-2 pr-4 font-mono">0.5551</td><td className="py-2 pr-4 font-mono">0.5760</td><td className="py-2 pr-4 font-mono">417</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[var(--rs-text-muted)] mt-2">These metrics are from the existing model training on tweet data; they are not recomputed here.</p>
        </div>
      </div>
    </div>
  );
}
