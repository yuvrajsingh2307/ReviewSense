import { CheckCircle, Minus, XCircle, Sparkles } from 'lucide-react';
import { SentimentResult } from '../types';
import { clsx } from 'clsx';
import { getSentimentColor } from '../utils/sampleData';

interface AnalysisResultProps {
  result: SentimentResult;
}

function SentimentMeter({ score, sentiment }: { score: number; sentiment: string }) {
  const getPosition = () => {
    if (sentiment === 'Positive') return `${50 + (score * 50)}%`;
    if (sentiment === 'Negative') return `${50 - (score * 50)}%`;
    return '50%';
  };

  const color = getSentimentColor(sentiment);

  return (
    <div className="relative h-4 bg-[var(--rs-card-hover)] rounded-full overflow-hidden mt-4 theme-transition">
      <div className="absolute left-0 w-1/2 h-full flex items-center justify-center">
        <span className="text-xs text-red-400">Negative</span>
      </div>
      <div className="absolute right-0 w-1/2 h-full flex items-center justify-center">
        <span className="text-xs text-emerald-400">Positive</span>
      </div>
      <div
        className={clsx('absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-lg transition-all duration-500', color.replace('text-', 'bg-'))}
        style={{ left: `calc(${getPosition()} - 8px)` }}
      />
    </div>
  );
}

export function AnalysisResult({ result }: AnalysisResultProps) {
  const Icon = result.sentiment === 'Positive' ? CheckCircle
    : result.sentiment === 'Negative' ? XCircle
    : Minus;

  const sentimentColor = getSentimentColor(result.sentiment);

  const probEntries = result.class_probabilities
    ? Object.entries(result.class_probabilities)
    : [];

  return (
    <div className="bg-[var(--rs-card)] rounded-xl border border-[var(--rs-border)] animate-fade-in theme-transition">
      <div className="p-6 border-b border-[var(--rs-border)]">
        <div className="flex items-center gap-3">
          <div className={clsx('p-3 rounded-xl bg-gradient-to-br', sentimentColor.replace('text-', 'from-').replace('-400', '-500') + '/20')}>
            <Icon className={clsx('w-8 h-8', sentimentColor)} />
          </div>
          <div>
            <p className="text-sm text-[var(--rs-text-muted)]">Sentiment</p>
            <p className={clsx('text-2xl font-bold uppercase tracking-wide', sentimentColor)}>
              {result.sentiment}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-sm text-[var(--rs-text-muted)]">Sentiment Score</span>
            <span className={clsx('text-4xl font-bold font-mono', sentimentColor)}>
              {result.score.toFixed(2)}
            </span>
          </div>
          <SentimentMeter score={result.score} sentiment={result.sentiment} />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--rs-border)]">
          <div>
            <p className="text-xs text-[var(--rs-text-muted)] uppercase tracking-wider mb-1">TextBlob Polarity</p>
            <p className={clsx('font-mono text-lg font-semibold', sentimentColor)}>
              {result.polarity.toFixed(3)}
            </p>
            <p className="text-xs text-[var(--rs-text-muted)] mt-1">
              {result.polarity > 0 ? 'Positive direction' : result.polarity < 0 ? 'Negative direction' : 'Neutral'}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--rs-text-muted)] uppercase tracking-wider mb-1">Analysis Method</p>
            <p className="font-mono text-lg font-semibold text-[var(--rs-text)]">
              {result.method === 'ml' ? 'ML (TF-IDF + LR)' : 'TextBlob (Fallback)'}
            </p>
            <p className="text-xs text-[var(--rs-text-muted)] mt-1">Method used for prediction</p>
          </div>
        </div>

        {result.method === 'ml' && probEntries.length > 0 && (
          <div className="pt-4 border-t border-[var(--rs-border)]">
            <p className="text-xs text-[var(--rs-text-muted)] uppercase tracking-wider mb-3">Class Probabilities (ML)</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {probEntries.map(([cls, prob]) => (
                <div key={cls} className="p-3 rounded-lg border border-[var(--rs-border)] bg-[var(--rs-muted-bg)]/30 theme-transition">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[var(--rs-text-secondary)]">{cls}</span>
                    <span className={clsx('text-sm font-mono font-semibold', getSentimentColor(cls))}>{(prob * 100).toFixed(1)}%</span>
                  </div>
                  <div className="mt-2 h-1.5 bg-[var(--rs-card-hover)] rounded-full overflow-hidden">
                    <div
                      className={clsx('h-full', cls === 'Positive' ? 'bg-emerald-500' : cls === 'Negative' ? 'bg-red-500' : 'bg-amber-500')}
                      style={{ width: `${prob * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-[var(--rs-text-muted)] mt-2">Note: These are model class probabilities, distinct from TextBlob polarity above.</p>
          </div>
        )}

        <div className="pt-4 border-t border-[var(--rs-border)]">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[var(--rs-accent)]" />
            <span className="text-sm font-medium text-[var(--rs-text)]">Analysis Details</span>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-xs text-[var(--rs-text-muted)] mb-1">Original Review</p>
              <p className="text-sm text-[var(--rs-text)] bg-[var(--rs-muted-bg)] rounded-lg p-3">
                "{result.review}"
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--rs-text-muted)] mb-1">Processed Text</p>
              <p className="text-sm text-[var(--rs-text-muted)] bg-[var(--rs-muted-bg)]/50 rounded-lg p-3 font-mono">
                {result.processed_text || 'No tokens after preprocessing'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
