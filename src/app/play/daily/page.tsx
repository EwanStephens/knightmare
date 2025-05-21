"use client";

import { useEffect, useState } from "react";
import { getDailyPuzzlesForDate, DailyPuzzles } from "@/utils/calendar";
import { loadPuzzleById } from "@/utils/puzzleUtils";
import ChessBoard from "@/components/ChessBoard";
import CompletionModal from "@/components/CompletionModal";
import { getDailyPuzzleProgress, setDailyPuzzleProgress, DailyPuzzleProgress } from "@/utils/gameState";

const getTodayString = () => {
  const today = new Date();
  return today.toISOString().slice(0, 10);
};

const PUZZLE_ORDER: Array<"short" | "medium" | "long"> = ["short", "medium", "long"];

type PuzzleType = "short" | "medium" | "long";

export default function DailyPuzzlePage() {
  const [date, setDate] = useState<string>(getTodayString());
  const [puzzles, setPuzzles] = useState<DailyPuzzles | null>(null);
  const [currentType, setCurrentType] = useState<PuzzleType>("short");
  const [levelData, setLevelData] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [progress, setProgress] = useState<DailyPuzzleProgress>({});

  useEffect(() => {
    const today = getTodayString();
    setDate(today);
    const daily = getDailyPuzzlesForDate(today);
    setPuzzles(daily);
    setProgress(getDailyPuzzleProgress(today));
    setCurrentType(
      (PUZZLE_ORDER.find((type) => !getDailyPuzzleProgress(today)[type]) as PuzzleType) || "short"
    );
  }, []);

  useEffect(() => {
    if (puzzles && puzzles[currentType]) {
      loadPuzzleById(puzzles[currentType]).then(setLevelData);
    }
  }, [puzzles, currentType]);

  const handleComplete = () => {
    const newProgress = { ...progress, [currentType]: true };
    setDailyPuzzleProgress(date, newProgress);
    setProgress(newProgress);
    setShowModal(true);
  };

  const handleNext = () => {
    setShowModal(false);
    const nextIdx = PUZZLE_ORDER.indexOf(currentType) + 1;
    if (nextIdx < PUZZLE_ORDER.length) {
      setCurrentType(PUZZLE_ORDER[nextIdx]);
    }
  };

  if (!puzzles) {
    return <div className="min-h-screen flex items-center justify-center">No daily puzzles found for today.</div>;
  }

  if (!levelData) {
    return <div className="min-h-screen flex items-center justify-center">Loading puzzle...</div>;
  }

  const isLast = currentType === "long";
  const congratsMessage = isLast
    ? "Congratulations! You completed all the daily puzzles! See you tomorrow."
    : levelData.congratsMessage;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800">
      <h1 className="text-2xl font-bold mb-4 dark:text-white">Daily Puzzle ({currentType.charAt(0).toUpperCase() + currentType.slice(1)})</h1>
      <div className="bg-white dark:bg-gray-700 p-8 rounded-lg shadow-lg">
        <ChessBoard
          key={currentType}
          initialLevel={undefined}
          tutorialMode={false}
          tutorialLevel={levelData}
          onLevelComplete={handleComplete}
        />
      </div>
      <CompletionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        congratsMessage={congratsMessage}
        targetWord={levelData.targetWord}
        currentLevel={0}
        nextPath={isLast ? undefined : undefined}
        isTutorial={false}
      />
      {!isLast && showModal && (
        <button onClick={handleNext} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mt-4">Next</button>
      )}
    </main>
  );
} 