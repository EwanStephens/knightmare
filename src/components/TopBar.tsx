'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function TopBar() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    // Check if dark mode is enabled when component mounts
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    setIsDarkMode(newMode);
  };

  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-white dark:bg-gray-900 shadow dark:shadow-gray-800 flex items-center justify-between px-6 py-3">
      <div className="text-2xl font-bold tracking-wide dark:text-white">Knightmare</div>
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleDarkMode} 
          className="text-gray-700 dark:text-gray-300 focus:outline-none"
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
            {isDarkMode ? 'light_mode' : 'dark_mode'}
          </span>
        </button>
        <Link href="/" aria-label="Home">
          <span className="material-symbols-outlined text-gray-700 dark:text-gray-300" style={{ fontSize: '28px' }}>
            home
          </span>
        </Link>
      </div>
    </div>
  );
} 