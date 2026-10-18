import React from 'react';
import { Menu, X, Brain, LayoutDashboard, Search, Layers, Lightbulb, History } from 'lucide-react';
import { NavPage } from '../types';
import { clsx } from 'clsx';
import { ThemeToggle } from './ThemeToggle';

interface TopNavProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
}

export function TopNav({ currentPage, onNavigate }: TopNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleNav = (page: NavPage) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  const navItems: { page: NavPage; label: string; icon: React.ElementType }[] = [
    { page: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { page: 'analyze', label: 'Analyze', icon: Search },
    { page: 'batch', label: 'Batch Analysis', icon: Layers },
    { page: 'insights', label: 'Insights', icon: Lightbulb },
    { page: 'history', label: 'History', icon: History },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Top navigation bar */}
      <header
        className="sticky top-0 z-30 border-b border-[var(--rs-border)] bg-[var(--rs-card)]/95 backdrop-blur-sm theme-transition"
      >
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--rs-accent)] to-[var(--rs-accent-hover)] flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--rs-text)] tracking-tight">ReviewSense</h1>
              <p className="text-xs text-[var(--rs-text-muted)]">Sentiment Analytics</p>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map(({ page, label, icon: Icon }) => (
              <button
                key={page}
                onClick={() => handleNav(page)}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 theme-transition',
                  currentPage === page
                    ? 'text-[var(--rs-accent)] bg-[var(--rs-accent-light)]/50 border border-[var(--rs-accent)]/20'
                    : 'text-[var(--rs-text-muted)] hover:text-[var(--rs-text)] hover:bg-[var(--rs-card-hover)]'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
            <ThemeToggle />
          </nav>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg text-[var(--rs-text)] hover:bg-[var(--rs-card-hover)] transition-colors theme-transition"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex flex-col theme-transition">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--rs-border)] bg-[var(--rs-card)]">
              <div className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-[var(--rs-accent)]" />
                <span className="font-bold text-[var(--rs-text)] text-lg">ReviewSense</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg text-[var(--rs-text)] hover:bg-[var(--rs-card-hover)] transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-6 py-4 space-y-2 overflow-y-auto">
              {navItems.map(({ page, label, icon: Icon }) => (
                <button
                  key={page}
                  onClick={() => handleNav(page)}
                  className={clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors duration-200 theme-transition',
                    currentPage === page
                      ? 'text-[var(--rs-accent)] bg-[var(--rs-accent-light)]/50 border-r-2 border-[var(--rs-accent)]'
                      : 'text-[var(--rs-text-muted)] hover:text-[var(--rs-text)] hover:bg-[var(--rs-card-hover)]'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </nav>
            <div className="p-6 border-t border-[var(--rs-border)] bg-[var(--rs-card)]">
              <ThemeToggle />
            </div>
          </div>
        )}
      </header>
    </>
  );
}
