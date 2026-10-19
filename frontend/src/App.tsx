import { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { TopNav } from './components/TopNav';
import { DashboardOverview } from './components/DashboardOverview';
import { SentimentDistribution } from './components/SentimentDistribution';
import { RecentReviews } from './components/RecentReviews';
import { AnalyzeReview } from './pages/AnalyzeReview';
import { BatchAnalysis } from './pages/BatchAnalysis';
import { Insights } from './pages/Insights';
import { History } from './pages/History';
import { useReviews } from './hooks/useReviews';
import { NavPage } from './types';

function App() {
  const [currentPage, setCurrentPage] = useState<NavPage>('dashboard');
  const { reviews, isLoading, error, isSampleData, addReview, analyzeBatchReviews, analyzeCSVFile, clearSampleData, getStats } = useReviews();

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <div className="space-y-6 sm:space-y-8">
            <DashboardOverview stats={getStats()} onNavigate={setCurrentPage} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <SentimentDistribution stats={getStats()} />
              <RecentReviews
                reviews={reviews}
                onNavigate={setCurrentPage}
                isSampleData={isSampleData}
                onClearSample={clearSampleData}
              />
            </div>
          </div>
        );
      case 'analyze':
        return <AnalyzeReview onAnalyze={addReview} isLoading={isLoading} error={error} />;
      case 'batch':
        return <BatchAnalysis onAnalyzeBatch={analyzeBatchReviews} onAnalyzeCSV={analyzeCSVFile} isLoading={isLoading} error={error} />;
      case 'insights':
        return <Insights reviews={reviews} isSampleData={isSampleData} />;
      case 'history':
        return <History reviews={reviews} isSampleData={isSampleData} onClearReviews={clearSampleData} />;
      default:
        return null;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[var(--rs-bg)] text-[var(--rs-text)] transition-colors duration-300">
        <TopNav currentPage={currentPage} onNavigate={setCurrentPage} />
        <main className="min-h-screen transition-all duration-300">
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 overflow-x-hidden">
            {renderPage()}
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
