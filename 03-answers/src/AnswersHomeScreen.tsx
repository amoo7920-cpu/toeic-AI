import { CHAPTERS } from "@toeic/shared/parts";

// Phase 2에서 구현: 챕터별 템플릿 뼈대 보기 · 빈칸 퀴즈 · TTS · 표현 저장
export function AnswersHomeScreen() {
  return (
    <div className="flex flex-col gap-3 px-4 py-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">모범답안</h1>
      {CHAPTERS.map((c) => (
        <button
          key={c.id}
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
