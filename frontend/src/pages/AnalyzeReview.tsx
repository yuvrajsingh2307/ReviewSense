import { useState } from 'react';
import { Send, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { AnalysisResult } from '../components/AnalysisResult';
import { SentimentResult } from '../types';

interface AnalyzeReviewProps {
  onAnalyze: (review: string) => Promise<SentimentResult>;
  isLoading: boolean;
  error: string | null;
}

export function AnalyzeReview({ onAnalyze, isLoading, error }: AnalyzeReviewProps) {
  const [review, setReview] = useState('');
  const [result, setResult] = useState<SentimentResult | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!review.trim()) {
      setLocalError('Please enter a review to analyze.');
      return;
    }
    if (review.trim().length < 3) {
      setLocalError('Review must be at least 3 characters long.');
      return;
    }
    setLocalError(null);
    try {
      const res = await onAnalyze(review);
      setResult(res);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Analysis failed');
    }
  };

  const handleClear = () => {
    setReview('');
    setResult(null);
    setLocalError(null);
  };

  const displayError = localError || error;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-[var(--rs-text)] tracking-tight">Analyze a Review</h1>
        <p className="text-[var(--rs-text-muted)]">Enter a customer review to get instant sentiment analysis.</p>
      </div>

      <div className="bg-[var(--rs-card)] rounded-xl border border-[var(--rs-border)] p-6 theme-transition">
        <label className="block mb-2.5">
          <span className="text-sm font-semibold text-[var(--rs-text-secondary)]">Customer Review</span>
        </label>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Paste a customer review here..."
          className="w-full h-56 p-4 bg-[var(--rs-muted-bg)] border border-[var(--rs-border)] rounded-lg text-[var(--rs-text)] placeholder-[var(--rs-text-muted)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--rs-accent)] focus:border-transparent transition-all duration-200 theme-transition disabled:opacity-50"
          disabled={isLoading}
          aria-label="Review text"
        />
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-[var(--rs-text-muted)]">{review.length} characters</span>
          <div className="flex gap-3">
            <button
              onClick={handleClear}
              disabled={isLoading || !review}
              className="px-4 py-2 text-[var(--rs-text-muted)] hover:text-[var(--rs-text)] hover:bg-[var(--rs-card-hover)] rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed theme-transition"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
            <button
              onClick={handleAnalyze}
              disabled={isLoading || !review.trim()}
              className="px-6 py-2 bg-[var(--rs-accent)] text-white font-semibold rounded-lg hover:bg-[var(--rs-accent-hover)] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-[var(--rs-accent)]/20 theme-transition flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Analyze Sentiment
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {displayError && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl theme-transition">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
          <p className="text-[var(--rs-text)] text-sm">{displayError}</p>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-12 h-12 text-[var(--rs-accent)] animate-spin mb-4" />
          <p className="text-lg font-medium text-[var(--rs-text)]">Analyzing review...</p>
          <p className="text-sm text-[var(--rs-text-muted)] mt-1">Processing with NLP engine</p>
        </div>
      )}

      {result && !isLoading && (
        <div className="animate-slide-up">
          <AnalysisResult result={result} />
        </div>
      )}
    </div>
  );
}
