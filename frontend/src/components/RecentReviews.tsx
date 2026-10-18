import { CheckCircle, Minus, XCircle, Clock } from 'lucide-react';
import { StoredReview, NavPage } from '../types';
import { clsx } from 'clsx';
import { getSentimentColor, getSentimentBgColor } from '../utils/sampleData';

interface RecentReviewsProps {
  reviews: StoredReview[];
  onNavigate: (page: NavPage) => void;
  isSampleData: boolean;
  onClearSample: () => void;
}

function SentimentBadge({ sentiment }: { sentiment: string }) {
  const icon = { Positive: CheckCircle, Neutral: Minus, Negative: XCircle }[sentiment] || Minus;
  const Icon = icon;
  const color = getSentimentColor(sentiment);
  const bgColor = getSentimentBgColor(sentiment);

  return (
    <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border', bgColor, color)}>
      <Icon className="w-3 h-3" />
      {sentiment}
    </span>
  );
}

function ReviewItem({ review }: { review: StoredReview }) {
  const color = getSentimentColor(review.sentiment);

  return (
    <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-[var(--rs-border)] bg-[var(--rs-card)] hover:bg-[var(--rs-card-hover)] transition-colors duration-200 theme-transition group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <SentimentBadge sentiment={review.sentiment} />
          <span className={clsx('text-xs font-mono font-medium', color)}>
            {review.score.toFixed(2)}
          </span>
        </div>
        <p className="text-sm text-[var(--rs-text)] leading-relaxed truncate md:truncate-none">
          "{review.review}"
        </p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="text-xs text-[var(--rs-text-muted)]">{review.date}</span>
        <Clock className="w-3 h-3 text-[var(--rs-text-muted)]" />
      </div>
    </div>
  );
}

export function RecentReviews({ reviews, onNavigate, isSampleData, onClearSample }: RecentReviewsProps) {
  const displayedReviews = reviews.slice(0, 8);

  return (
    <div className="bg-[var(--rs-card)] rounded-xl border border-[var(--rs-border)] theme-transition">
      <div className="p-5 border-b border-[var(--rs-border)] flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[var(--rs-text)]">Recent Reviews</h3>
          <p className="text-xs text-[var(--rs-text-muted)]">Latest analyzed customer feedback</p>
        </div>
        <button
          onClick={() => onNavigate('history')}
          className="text-xs font-medium text-[var(--rs-accent)] hover:text-[var(--rs-accent-hover)] transition-colors"
        >
          View all
        </button>
      </div>

      {isSampleData && (
        <div className="px-5 py-3 bg-[var(--rs-accent-light)] border border-[var(--rs-accent)]/30">
          <p className="text-xs text-[var(--rs-accent)]">
            Displaying sample data.
            <button onClick={onClearSample} className="underline hover:no-underline ml-1">
              Clear sample data
            </button>
            &nbsp;to start fresh.
          </p>
        </div>
      )}

      <div className="divide-y divide-[var(--rs-border)]">
        {displayedReviews.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-[var(--rs-text-muted)] text-sm">No reviews analyzed yet.</p>
            <p className="text-xs text-[var(--rs-text-muted)] mt-1">Analyze your first review to see the feed.</p>
          </div>
        ) : (
          displayedReviews.map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))
        )}
      </div>
    </div>
  );
}
