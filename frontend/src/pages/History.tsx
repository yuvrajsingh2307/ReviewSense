import { useState } from 'react';
import { StoredReview } from '../types';
import { getSentimentColor, getSentimentBgColor } from '../utils/sampleData';
import { CheckCircle, Minus, XCircle, Search, Calendar, Trash2, AlertTriangle, Clock } from 'lucide-react';
import { clsx } from 'clsx';

interface HistoryProps {
  reviews: StoredReview[];
  isSampleData: boolean;
  onClearReviews: () => void;
}

type SortOrder = 'desc' | 'asc';
type SentimentFilter = 'all' | 'Positive' | 'Neutral' | 'Negative';

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

export function History({ reviews, isSampleData, onClearReviews }: HistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState<SentimentFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filteredReviews = reviews
    .filter((review) => {
      const matchesSearch = review.review.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSentiment = sentimentFilter === 'all' || review.sentiment === sentimentFilter;
      return matchesSearch && matchesSentiment;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'desc' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
    });

  const handleClear = () => {
    onClearReviews();
    setShowClearConfirm(false);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-[var(--rs-text)] tracking-tight">Review History</h1>
        <p className="text-[var(--rs-text-muted)]">View, search, and filter all analyzed reviews.</p>
      </div>

      {isSampleData && (
        <div className="px-5 py-3 bg-[var(--rs-accent-light)] border border-[var(--rs-accent)]/30 rounded-lg text-sm">
          <p className="text-[var(--rs-accent)]">
            Displaying sample data.
            <button onClick={() => setShowClearConfirm(true)} className="underline hover:no-underline ml-1">
              Clear sample data
            </button>
          </p>
        </div>
      )}

      <div className="bg-[var(--rs-card)] rounded-xl border border-[var(--rs-border)] p-6 theme-transition">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--rs-text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reviews..."
              className="w-full pl-10 pr-4 py-2 bg-[var(--rs-muted-bg)] border border-[var(--rs-border)] rounded-lg text-[var(--rs-text)] placeholder-[var(--rs-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--rs-accent)] focus:border-transparent transition-all duration-200 theme-transition"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={sentimentFilter}
              onChange={(e) => setSentimentFilter(e.target.value as SentimentFilter)}
              className="px-4 py-2 bg-[var(--rs-muted-bg)] border border-[var(--rs-border)] rounded-lg text-[var(--rs-text)] focus:outline-none focus:ring-2 focus:ring-[var(--rs-accent)] focus:border-transparent transition-all duration-200 theme-transition"
            >
              <option value="all">All Sentiments</option>
              <option value="Positive">Positive</option>
              <option value="Neutral">Neutral</option>
              <option value="Negative">Negative</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--rs-muted-bg)] border border-[var(--rs-border)] rounded-lg text-[var(--rs-text)] hover:bg-[var(--rs-card-hover)] transition-colors duration-200 theme-transition"
            >
              <Calendar className="w-4 h-4" />
              Date {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
            </button>
            {!isSampleData && reviews.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors duration-200 theme-transition"
              >
                <Trash2 className="w-4 h-4" />
                Clear History
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="bg-[var(--rs-card)] rounded-xl border border-[var(--rs-border)] p-12 text-center theme-transition">
            <p className="text-[var(--rs-text-muted)] text-lg">No reviews found.</p>
            <p className="text-sm text-[var(--rs-text-muted)] mt-1">
              {searchQuery || sentimentFilter !== 'all' ? 'Try adjusting your search or filters.' : 'Analyze your first review to see it here.'}
            </p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-[var(--rs-card)] rounded-xl border border-[var(--rs-border)] p-5 hover:bg-[var(--rs-card-hover)] transition-colors duration-200 theme-transition"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <SentimentBadge sentiment={review.sentiment} />
                    <span className={clsx('text-xs font-mono font-medium', getSentimentColor(review.sentiment))}>{review.score.toFixed(2)}</span>
                    {review.polarity !== undefined && (
                      <span className="text-xs text-[var(--rs-text-muted)]">Pol: {review.polarity.toFixed(3)}</span>
                    )}
                    {review.method && (
                      <span className="text-xs px-2 py-0.5 rounded bg-[var(--rs-muted-bg)] text-[var(--rs-text-muted)] border border-[var(--rs-border)]">{review.method}</span>
                    )}
                  </div>
                  <p className="text-[var(--rs-text)] leading-relaxed whitespace-pre-wrap">{review.review}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--rs-text-muted)] md:flex-col md:items-end md:gap-1">
                  <span>{review.date}</span>
                  <Clock className="w-3 h-3" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[var(--rs-card)] rounded-xl border border-[var(--rs-border)] p-6 max-w-md mx-4 theme-transition">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-semibold text-[var(--rs-text)]">Clear Review History</h3>
            </div>
            <p className="text-[var(--rs-text-muted)] mb-6">This will permanently delete all analyzed reviews. This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowClearConfirm(false)} className="px-4 py-2 text-[var(--rs-text-muted)] hover:text-[var(--rs-text)] hover:bg-[var(--rs-card-hover)] rounded-lg transition-colors duration-200 theme-transition">Cancel</button>
              <button onClick={handleClear} className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors duration-200 theme-transition">Clear History</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
