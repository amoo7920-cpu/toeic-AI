import { useState } from "react";
import { CHAPTERS, type ChapterId } from "@toeic/shared/parts";
import { ChapterAnswersScreen } from "./ChapterAnswersScreen";

export function AnswersHomeScreen() {
  const [chapterId, setChapterId] = useState<ChapterId | null>(null);

  if (chapterId !== null) {
    return <ChapterAnswersScreen chapterId={chapterId} onBack={() => setChapterId(null)} />;
  }

  return (
    <div className="flex flex-col gap-3 px-4 py-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">모범답안</h1>
      {CHAPTERS.map((c) => (
        <button
          key={c.id}
          onClick={() => setChapterId(c.id)}
          className="flex items-center justify-between rounded-2xl border border-gray-200 p-4 text-left active:bg-gray-50 dark:border-gray-800 dark:active:bg-gray-900"
        >
          <div>
            <span className="font-semibold text-gray-900 dark:text-white">
              Ch{c.id}. {c.name}
            </span>
            <p className="text-sm text-gray-500 dark:text-gray-400">템플릿 뼈대 + 빈칸 퀴즈</p>
          </div>
          <span className="text-gray-400">›</span>
        </button>
      ))}
    </div>
  );
}
