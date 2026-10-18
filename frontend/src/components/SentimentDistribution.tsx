import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { DashboardStats } from '../types';

const COLORS = {
  positive: '#10b981',
  neutral: '#f59e0b',
  negative: '#ef4444',
};

export function SentimentDistribution({ stats }: DashboardStatsProps) {
  const data = [
    { name: 'Positive', value: stats.positivePercent, color: COLORS.positive },
    { name: 'Neutral', value: stats.neutralPercent, color: COLORS.neutral },
    { name: 'Negative', value: stats.negativePercent, color: COLORS.negative },
  ].filter(d => d.value > 0);

  if (data.length === 0 || stats.totalReviews === 0) {
    return (
      <div className="bg-[var(--rs-card)] rounded-xl p-6 border border-[var(--rs-border)] theme-transition">
        <h3 className="text-lg font-semibold text-[var(--rs-text)] mb-4">Sentiment Distribution</h3>
        <div className="h-64 flex items-center justify-center text-[var(--rs-text-muted)]">
          No data available yet
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--rs-card)] rounded-xl p-6 border border-[var(--rs-border)] theme-transition">
      <h3 className="text-lg font-semibold text-[var(--rs-text)] mb-4">Sentiment Distribution</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            animationDuration={800}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--rs-card)',
              border: '1px solid var(--rs-border)',
              borderRadius: '8px',
              color: 'var(--rs-text)',
            }}
            formatter={(value: number) => [`${value}%`, 'Percentage']}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span style={{ color: 'var(--rs-text-secondary)' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

interface DashboardStatsProps {
  stats: DashboardStats;
}
