'use client';

import Link from 'next/link';

export default function TopBar() {
  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-white dark:bg-gray-900 shadow dark:shadow-gray-800 flex items-center justify-between px-6 py-3">
      <div className="text-2xl font-bold tracking-wide dark:text-white">Knightmare</div>
      <div className="flex items-center gap-4">
        <Link href="/" aria-label="Home">
          <span className="material-symbols-outlined text-gray-700 dark:text-gray-300" style={{ fontSize: '28px' }}>
            home
          </span>
        </Link>
      </div>
    </div>
  );
} 