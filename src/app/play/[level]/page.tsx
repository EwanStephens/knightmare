import ChessBoard from '@/components/ChessBoard';

interface PlayLevelPageProps {
  params: { level: string };
}

export default function PlayLevelPage({ params }: PlayLevelPageProps) {
  const level = parseInt(params.level, 10);
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">Level {level}</h1>
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <ChessBoard initialLevel={level}/>
      </div>
    </main>
  );
} 