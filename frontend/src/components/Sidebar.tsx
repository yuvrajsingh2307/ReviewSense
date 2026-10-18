import React from 'react';
import { Home, Search, Layers, Lightbulb, Menu, X, History } from 'lucide-react';
import { NavPage } from '../types';
import { clsx } from 'clsx';

interface SidebarProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ currentPage, onNavigate, isOpen, onClose }: SidebarProps) {
  const [collapsed, setCollapsed] = React.useState(false);

  const handleNav = (page: NavPage) => {
    onNavigate(page);
    if (isOpen) onClose();
  };

  const navItems: { page: NavPage; label: string; icon: React.ElementType }[] = [
    { page: 'dashboard', label: 'Overview', icon: Home },
    { page: 'analyze', label: 'Analyze', icon: Search },
    { page: 'batch', label: 'Batch Analysis', icon: Layers },
    { page: 'insights', label: 'Insights', icon: Lightbulb },
    { page: 'history', label: 'History', icon: History },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={clsx(
          'fixed top-0 left-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50 transition-all duration-300 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          {!collapsed && <h1 className="text-xl font-bold text-gray-900 dark:text-white">ReviewSense</h1>}
          <div className="flex gap-2">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 lg:block hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map(({ page, label, icon: Icon }) => (
            <button
              key={page}
              onClick={() => handleNav(page)}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}
