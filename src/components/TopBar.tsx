'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

export default function TopBar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-white dark:bg-jet-light shadow dark:shadow-gray-800 flex items-center justify-between px-6">
      <div className="text-2xl font-bold tracking-wide dark:text-white">SpellCheck</div>
      <div className="flex items-center">
        {/* Question mark icon with dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className={`px-3 h-14 flex items-center transition-colors ${
              isDropdownOpen 
                ? 'bg-gray-100 dark:bg-jet-lighter' 
                : 'hover:bg-gray-100 dark:hover:bg-jet-lighter'
            }`}
            aria-label="Help menu"
          >
            <span className="material-symbols-outlined text-gray-700 dark:text-gray-300" style={{ fontSize: '28px' }}>
              question_mark
            </span>
          </button>
          
          {/* Dropdown menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full w-40 bg-white dark:bg-jet-light border border-gray-200 dark:border-gray-600 shadow-lg py-1 z-60">
              <Link 
                href="/tutorial"
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setIsDropdownOpen(false)}
              >
                Tutorial
              </Link>
            </div>
          )}
        </div>

        <Link href="/" aria-label="Home">
          <div className="px-3 h-14 flex items-center hover:bg-gray-100 dark:hover:bg-jet-lighter transition-colors">
            <span className="material-symbols-outlined text-gray-700 dark:text-gray-300" style={{ fontSize: '28px' }}>
              home
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
} 