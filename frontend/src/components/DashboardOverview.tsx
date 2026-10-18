import { FileText } from 'lucide-react';
import { clsx } from 'clsx';
import { DashboardStats, NavPage } from '../types';

interface MetricCardProps {
  label: string;
  value: string;
  isPrimary?: boolean;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
}

function MetricCard({ label, value, isPrimary = false, trend, trendLabel }: MetricCardProps) {
  return (
    <div
      className={clsx(
        'rounded-xl p-5 border border-[var(--rs-border)] theme-transition',
        isPrimary
          ? 'bg-[var(--rs-card)] shadow-sm'
          : 'bg-[var(--rs-muted-bg)]/50 border-[var(--rs-border)]/30'
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <p className="text-sm font-medium text-[var(--rs-text-secondary)]">{label}</p>
        {trend && trendLabel && (
          <span className={clsx(
            'text-xs font-medium px-2 py-0.5 rounded border',
            trend === 'up' && 'border-emerald-200 text-emerald-600 bg-emerald-50',
            trend === 'down' && 'border-red-200 text-red-600 bg-red-50',
            trend === 'neutral' && 'border-[var(--rs-border)] text-[var(--rs-text-muted)]'
          )}>
            {trendLabel}
          </span>
        )}
      </div>
      <p className={clsx('text-2xl font-bold tracking-tight', isPrimary ? 'text-[var(--rs-text)]' : 'text-[var(--rs-text-secondary)]')}>
        {value}
      </p>
    </div>
  );
}

interface DashboardOverviewProps {
  stats: DashboardStats;
  onNavigate: (page: NavPage) => void;
}

export function DashboardOverview({ stats, onNavigate }: DashboardOverviewProps) {
  const total = stats.totalReviews;

  return (
    <div className="space-y-8">
      {/* Editorial header */}
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--rs-text)] tracking-tight">
          Understand your customers.
        </h1>
        <p className="text-lg text-[var(--rs-text-muted)] max-w-2xl">
          Turn customer reviews into clear sentiment insights. See what&rsquo;s working,
          what&rsquo;s not, and where to focus next.
        </p>
        <button
          onClick={() => onNavigate('analyze')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--rs-accent)] text-white font-semibold rounded-lg hover:bg-[var(--rs-accent-hover)] transition-colors duration-200 shadow-sm shadow-[var(--rs-accent)]/20"
        >
          Analyze Reviews <FileText className="w-4 h-4" />
        </button>
      </div>

      {/* Metrics section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Reviews" value={total.toLocaleString()} isPrimary />
        <MetricCard label="Positive" value={`${stats.positivePercent}%`} trend="up" trendLabel="Growing" />
        <MetricCard label="Neutral" value={`${stats.neutralPercent}%`} trend="neutral" trendLabel="Stable" />
        <MetricCard label="Negative" value={`${stats.negativePercent}%`} trend="down" trendLabel="Attention" />
      </div>

      {/* Empty state when no reviews */}
      {total === 0 && (
        <div className="bg-[var(--rs-card)] rounded-xl border border-[var(--rs-border)] p-12 text-center theme-transition">
          <p className="text-[var(--rs-text-muted)] text-lg">No reviews analyzed yet.</p>
          <p className="text-sm text-[var(--rs-text-muted)] mt-1">Analyze your first review to see customer insights.</p>
        </div>
      )}
    </div>
  );
}
