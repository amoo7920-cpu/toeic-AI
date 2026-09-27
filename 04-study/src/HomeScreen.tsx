import { useAuth } from "@toeic/auth";
import { GRADE_XP_THRESHOLDS } from "@toeic/shared/parts";

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - new Date().setHours(0, 0, 0, 0);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Phase 4에서 XP/스트릭/퀘스트 실데이터 연동 예정. 지금은 profile.exam_date 기반 D-day만 표시.
export function HomeScreen() {
  const { profile } = useAuth();
  const dday = daysUntil(profile?.exam_date ?? null);
  const currentLevel = GRADE_XP_THRESHOLDS[0];

  return (
    <div className="flex flex-col gap-4 px-4 py-6">
      <div className="rounded-2xl bg-blue-600 p-5 text-white">
        <p className="text-sm opacity-80">시험까지</p>
        <p className="text-3xl font-bold">{dday !== null ? `D-${dday}` : "시험일 미설정"}</p>
      </div>

      <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-gray-900 dark:text-white">{currentLevel.title}</span>
          <span className="text-gray-500 dark:text-gray-400">0 XP</span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
          <div className="h-2 w-0 rounded-full bg-blue-600" />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
        <p className="font-semibold text-gray-900 dark:text-white">오늘의 퀘스트</p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Phase 4에서 연동 예정</p>
      </div>

      <button className="h-14 rounded-2xl bg-gray-900 text-base font-bold text-white dark:bg-white dark:text-gray-900">
        데일리 5 시작
      </button>
    </div>
  );
}
