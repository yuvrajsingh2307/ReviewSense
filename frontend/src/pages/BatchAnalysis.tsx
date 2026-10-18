import { useState, useCallback, useMemo } from 'react';
import { Upload, FileText, Loader2, AlertCircle, CheckCircle, XCircle, Minus, Search, Download } from 'lucide-react';
import { BatchResult, SentimentResult } from '../types';
import { clsx } from 'clsx';
import { getSentimentColor, getSentimentBgColor } from '../utils/sampleData';

interface BatchAnalysisProps {
  onAnalyzeBatch: (reviews: string[]) => Promise<BatchResult>;
  onAnalyzeCSV: (file: File) => Promise<BatchResult>;
  isLoading: boolean;
  error: string | null;
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

type SentimentFilter = 'all' | 'Positive' | 'Neutral' | 'Negative';

export function BatchAnalysis({ onAnalyzeBatch, onAnalyzeCSV, isLoading, error }: BatchAnalysisProps) {
  const [mode, setMode] = useState<'paste' | 'upload'>('paste');
  const [pastedReviews, setPastedReviews] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [result, setResult] = useState<BatchResult | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState<SentimentFilter>('all');

  const filteredResults = useMemo(() => {
    if (!result) return [] as SentimentResult[];
    return result.results.filter((r) => {
      const matchesSearch = r.review.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSentiment = sentimentFilter === 'all' || r.sentiment === sentimentFilter;
      return matchesSearch && matchesSentiment;
    });
  }, [result, searchQuery, sentimentFilter]);

  const handlePasteAnalyze = async () => {
    const reviews = pastedReviews.split('\n').map(r => r.trim()).filter(r => r.length > 0);
    if (reviews.length === 0) {
      setLocalError('Please enter at least one review.');
      return;
    }
    setLocalError(null);
    try {
      const res = await onAnalyzeBatch(reviews);
      setResult(res);
      setSearchQuery('');
      setSentimentFilter('all');
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Analysis failed');
    }
  };

  const handleCSVAnalyze = async () => {
    if (!csvFile) {
      setLocalError('Please select a CSV file.');
      return;
    }
    setLocalError(null);
    try {
      const res = await onAnalyzeCSV(csvFile);
      setResult(res);
      setSearchQuery('');
      setSentimentFilter('all');
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'CSV analysis failed');
    }
  };

  const handleExportCSV = useCallback(() => {
    if (!result || result.results.length === 0) return;
    const headers = ['review', 'sentiment', 'score', 'polarity', 'method'];
    const rows = [headers.join(',')];
    for (const r of result.results) {
      const esc = (val: any) => {
        const s = String(val ?? '').replace(/"/g, '""');
        return s.includes(',') || s.includes('\n') || s.includes('"') ? `"${s}"` : s;
      };
      rows.push([esc(r.review), esc(r.sentiment), esc(r.score), esc(r.polarity), esc(r.method)].join(','));
    }
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `review-sense-batch-results-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [result]);

  const handleClearResults = () => {
    setResult(null);
    setSearchQuery('');
    setSentimentFilter('all');
  };

  const displayError = localError || error;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-[var(--rs-text)] tracking-tight">Batch Analysis</h1>
        <p className="text-[var(--rs-text-muted)]">Analyze multiple reviews at once from text input or CSV file.</p>
      </div>

      <div className="bg-[var(--rs-card)] rounded-xl border border-[var(--rs-border)] p-6 theme-transition">
        <div className="flex gap-3 mb-6 bg-[var(--rs-muted-bg)] p-1.5 rounded-lg border border-[var(--rs-border)]">
          <button
            onClick={() => setMode('paste')}
            className={clsx(
              'flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200',
              mode === 'paste'
                ? 'bg-[var(--rs-accent)] text-white shadow-sm'
                : 'text-[var(--rs-text-muted)] hover:text-[var(--rs-text)] hover:bg-[var(--rs-card-hover)]'
            )}
          >
            Paste Reviews
          </button>
          <button
            onClick={() => setMode('upload')}
            className={clsx(
              'flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200',
              mode === 'upload'
                ? 'bg-[var(--rs-accent)] text-white shadow-sm'
                : 'text-[var(--rs-text-muted)] hover:text-[var(--rs-text)] hover:bg-[var(--rs-card-hover)]'
            )}
          >
            Upload CSV
          </button>
        </div>

        {mode === 'paste' && (
          <div className="space-y-4">
            <div>
              <label className="block mb-2.5">
                <span className="text-sm font-semibold text-[var(--rs-text-secondary)]">Enter reviews (one per line)</span>
              </label>
              <textarea
                value={pastedReviews}
                onChange={(e) => setPastedReviews(e.target.value)}
                placeholder="Great product!&#10;Not worth the price.&#10;Average quality, okay overall."
                className="w-full h-56 p-4 bg-[var(--rs-muted-bg)] border border-[var(--rs-border)] rounded-lg text-[var(--rs-text)] placeholder-[var(--rs-text-muted)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--rs-accent)] focus:border-transparent transition-all duration-200 theme-transition disabled:opacity-50"
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handlePasteAnalyze}
              disabled={isLoading || !pastedReviews.trim()}
              className="w-full px-6 py-2.5 bg-[var(--rs-accent)] text-white font-semibold rounded-lg hover:bg-[var(--rs-accent-hover)] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-[var(--rs-accent)]/20 theme-transition flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              Analyze {pastedReviews.split('\n').filter(r => r.trim()).length} Reviews
            </button>
          </div>
        )}

        {mode === 'upload' && (
          <div className="space-y-4">
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files[0]) {
                  setCsvFile(e.dataTransfer.files[0]);
                }
              }}
              className={clsx(
                'border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200',
                isDragging
                  ? 'border-[var(--rs-accent)] bg-[var(--rs-accent-light)]/20'
                  : 'border-[var(--rs-border)] hover:border-[var(--rs-accent)]/50 hover:bg-[var(--rs-muted-bg)]/30'
              )}
            >
              <Upload className="w-10 h-10 mx-auto mb-4 text-[var(--rs-text-muted)]" />
              <p className="text-lg font-medium text-[var(--rs-text)] mb-2">
                {csvFile ? csvFile.name : 'Upload CSV file'}
              </p>
              <p className="text-sm text-[var(--rs-text-muted)] mb-4">
                {csvFile ? `${(csvFile.size / 1024).toFixed(1)} KB` : 'Drag and drop or click to browse'}
              </p>
              <label className="inline-block px-5 py-2 bg-[var(--rs-muted-bg)] text-[var(--rs-text)] font-medium rounded-lg hover:bg-[var(--rs-card-hover)] cursor-pointer transition-colors duration-200 border border-[var(--rs-border)] theme-transition">
                Choose File
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>
            <button
              onClick={handleCSVAnalyze}
              disabled={isLoading || !csvFile}
              className="w-full px-6 py-2.5 bg-[var(--rs-accent)] text-white font-semibold rounded-lg hover:bg-[var(--rs-accent-hover)] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-[var(--rs-accent)]/20 theme-transition flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              Analyze CSV
            </button>
          </div>
        )}
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
          <p className="text-lg font-medium text-[var(--rs-text)]">Analyzing reviews...</p>
          <p className="text-sm text-[var(--rs-text-muted)] mt-1">Processing batch with NLP engine</p>
        </div>
      )}

      {result && !isLoading && (
        <div className="space-y-6 animate-slide-up">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-[var(--rs-card)] rounded-xl border border-[var(--rs-border)] p-5 text-center theme-transition">
              <p className="text-2xl font-bold text-[var(--rs-text)]">{result.total}</p>
              <p className="text-xs text-[var(--rs-text-muted)] uppercase tracking-wider">Total Reviews</p>
            </div>
            <div className="bg-[var(--rs-card)] rounded-xl border border-[var(--rs-border)] p-5 text-center theme-transition">
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{result.positive_count}</p>
              <p className="text-xs text-[var(--rs-text-muted)] uppercase tracking-wider">Positive</p>
            </div>
            <div className="bg-[var(--rs-card)] rounded-xl border border-[var(--rs-border)] p-5 text-center theme-transition">
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{result.neutral_count}</p>
              <p className="text-xs text-[var(--rs-text-muted)] uppercase tracking-wider">Neutral</p>
            </div>
            <div className="bg-[var(--rs-card)] rounded-xl border border-[var(--rs-border)] p-5 text-center theme-transition">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{result.negative_count}</p>
              <p className="text-xs text-[var(--rs-text-muted)] uppercase tracking-wider">Negative</p>
            </div>
          </div>

          <div className="bg-[var(--rs-card)] rounded-xl border border-[var(--rs-border)] p-6 theme-transition">
            <div className="flex flex-col gap-4 mb-4 md:flex-row md:items-center md:justify-between">
              <h3 className="text-lg font-semibold text-[var(--rs-text)] flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Results
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--rs-text-muted)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search results..."
                    className="pl-10 pr-4 py-2 bg-[var(--rs-muted-bg)] border border-[var(--rs-border)] rounded-lg text-[var(--rs-text)] placeholder-[var(--rs-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--rs-accent)] focus:border-transparent transition-all duration-200 theme-transition"
                  />
                </div>
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
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--rs-muted-bg)] border border-[var(--rs-border)] rounded-lg text-[var(--rs-text)] hover:bg-[var(--rs-card-hover)] transition-colors duration-200 theme-transition"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
                <button
                  onClick={handleClearResults}
                  className="flex items-center gap-2 px-4 py-2 text-[var(--rs-text-muted)] hover:text-[var(--rs-text)] hover:bg-[var(--rs-card-hover)] rounded-lg transition-colors duration-200 theme-transition"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="text-xs text-[var(--rs-text-muted)] mb-4">
              Showing {filteredResults.length} of {result.results.length} results
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-[var(--rs-text-muted)] border-b border-[var(--rs-border)]">
                    <th className="pb-3 pr-4 font-medium text-[var(--rs-text)]">Review</th>
                    <th className="pb-3 pr-4 font-medium text-[var(--rs-text)]">Sentiment</th>
                    <th className="pb-3 pr-4 font-medium text-[var(--rs-text)]">Score</th>
                    <th className="pb-3 pr-4 font-medium text-[var(--rs-text)]">Polarity</th>
                    <th className="pb-3 pr-4 font-medium text-[var(--rs-text)]">Method</th>
                    <th className="pb-3 font-medium text-[var(--rs-text)]">Class Probs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--rs-border)]">
                  {filteredResults.map((r, i) => (
                    <tr key={i} className="hover:bg-[var(--rs-card-hover)] transition-colors duration-200 theme-transition">
                      <td className="py-3 pr-4 text-sm text-[var(--rs-text)] max-w-[220px] truncate" title={r.review}>{r.review}</td>
                      <td className="py-3 pr-4"><SentimentBadge sentiment={r.sentiment} /></td>
                      <td className={clsx('py-3 pr-4 font-mono text-sm', getSentimentColor(r.sentiment))}>{r.score.toFixed(3)}</td>
                      <td className="py-3 pr-4 font-mono text-sm text-[var(--rs-text)]">{r.polarity?.toFixed(3) ?? '-'}</td>
                      <td className="py-3 pr-4 text-xs text-[var(--rs-text-muted)]">{r.method || '-'}</td>
                      <td className="py-3 font-mono text-xs text-[var(--rs-text-muted)] max-w-[160px] truncate">
                        {r.class_probabilities ? Object.entries(r.class_probabilities).map(([k,v]) => `${k}:${(v*100).toFixed(1)}%`).join(' | ') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
