import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--rs-card)] border border-[var(--rs-border)] text-[var(--rs-text)] hover:bg-[var(--rs-card-hover)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--rs-accent)] focus:ring-offset-2 focus:ring-offset-[var(--rs-bg)]"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-[var(--rs-accent)]" />
      ) : (
        <Moon className="w-5 h-5 text-[var(--rs-text-secondary)]" />
      )}
      <span className="text-xs font-medium text-[var(--rs-text-secondary)]">
        {isDark ? 'Light' : 'Dark'}
      </span>
    </button>
  );
}
