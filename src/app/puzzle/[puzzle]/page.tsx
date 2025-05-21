"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getDateForPuzzleId } from "@/utils/calendar";

export default function PlayPuzzlePage() {
  const router = useRouter();
  const params = useParams();
  const puzzleId = params.puzzle as string;
  const [checked, setChecked] = useState(false);
  const [isToday, setIsToday] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const puzzleDate = getDateForPuzzleId(puzzleId);
    if (puzzleDate === today) {
      router.replace("/play/daily");
    } else {
      setIsToday(false);
      setChecked(true);
    }
  }, [puzzleId, router]);

  if (!checked) {
    return <div className="min-h-screen flex items-center justify-center">Checking puzzle...</div>;
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800">
      <h1 className="text-3xl font-bold mb-4 dark:text-white">Whoa there!</h1>
      <div className="bg-white dark:bg-gray-700 p-8 rounded-lg shadow-lg flex flex-col gap-4 items-center">
        <p className="text-lg text-gray-700 dark:text-gray-200">This puzzle isn't available yet. Be patient, young grasshopper! 🦗</p>
        <p className="text-gray-500 dark:text-gray-400">Come back on the right day to play this daily puzzle.</p>
      </div>
    </main>
  );
} 