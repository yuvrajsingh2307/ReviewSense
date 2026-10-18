import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { StoredReview } from '../types';

interface SentimentTrendProps {
  reviews: StoredReview[];
}

function generateTrendData(reviews: StoredReview[]) {
  if (reviews.length === 0) return [];

  const sortedReviews = [...reviews].reverse().slice(-10);
  
  return sortedReviews.map((review, index) => ({
    name: `#${index + 1}`,
    positive: review.sentiment === 'Positive' ? review.score : 0,
    neutral: review.sentiment === 'Neutral' ? review.score : 0,
    negative: review.sentiment === 'Negative' ? review.score : 0,
  }));
}

export function SentimentTrend({ reviews }: SentimentTrendProps) {
  const data = generateTrendData(reviews);

  if (data.length === 0) {
    return (
      <div className="bg-[var(--rs-card)] rounded-xl p-6 border border-[var(--rs-border)] theme-transition">
        <h3 className="text-lg font-semibold text-[var(--rs-text)] mb-4">Sentiment Trend</h3>
        <div className="h-64 flex items-center justify-center text-[var(--rs-text-muted)]">
          Analyze reviews to see trends
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--rs-card)] rounded-xl p-6 border border-[var(--rs-border)] theme-transition">
      <h3 className="text-lg font-semibold text-[var(--rs-text)] mb-4">Sentiment Trend</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--rs-border)" />
          <XAxis dataKey="name" stroke="var(--rs-text-muted)" fontSize={12} />
          <YAxis stroke="var(--rs-text-muted)" fontSize={12} domain={[0, 1]} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--rs-card)',
              border: '1px solid var(--rs-border)',
              borderRadius: '8px',
              color: 'var(--rs-text)',
            }}
          />
          <Legend />
          <Line type="monotone" dataKey="positive" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} name="Positive" />
          <Line type="monotone" dataKey="neutral" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} name="Neutral" />
          <Line type="monotone" dataKey="negative" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444' }} name="Negative" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
