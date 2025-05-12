import Link from 'next/link';

export default function TopBar() {
  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-white shadow flex items-center justify-between px-6 py-3">
      <div className="text-2xl font-bold tracking-wide">Knightmare</div>
      <Link href="/" aria-label="Home">
        <span className="material-symbols-outlined text-3xl text-gray-700">home</span>
      </Link>
    </div>
  );
} 