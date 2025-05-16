'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function TopBar() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    // Check if dark mode is preferred by the system
    if (window.matchMedia) {
      const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setIsDarkMode(darkModeMediaQuery.matches);
      
      // Listen for changes in the color scheme preference
      const handleChange = (e: MediaQueryListEvent) => {
        setIsDarkMode(e.matches);
      };
      
      darkModeMediaQuery.addEventListener('change', handleChange);
      return () => darkModeMediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-white dark:bg-gray-900 shadow dark:shadow-gray-800 flex items-center justify-between px-6 py-3">
      <div className="text-2xl font-bold tracking-wide">Knightmare</div>
      <div className="flex items-center gap-4">
        <div className="text-gray-700 dark:text-gray-300 flex items-center">
          <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
            {isDarkMode ? 'light_mode' : 'dark_mode'}
          </span>
        </div>
        <Link href="/" aria-label="Home">
          <span className="material-symbols-outlined text-gray-700 dark:text-gray-300" style={{ fontSize: '28px' }}>
            home
          </span>
        </Link>
      </div>
    </div>
  );
} 