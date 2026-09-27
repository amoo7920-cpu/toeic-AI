import { useAuth, useSupabase } from "@toeic/auth";
import { CHAPTERS } from "@toeic/shared/parts";
import { useStudyData } from "./lib/useStudyData";

function computeExamPlan(examDate: string | null | undefined) {
  if (!examDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exam = new Date(examDate);
  exam.setHours(0, 0, 0, 0);
  const totalDays = Math.max(1, Math.round((exam.getTime() - today.getTime()) / 86400000));
  const stage1 = Math.max(1, Math.round(totalDays * 0.4));
  const stage2 = Math.max(1, Math.round(totalDays * 0.4));
  const stage3 = Math.max(0, totalDays - stage1 - stage2);
  return [
    { label: "1단계", days: stage1, desc: "템플릿 암기 + 챕터 연습 · 뼈대 체화" },
    { label: "2단계", days: stage2, desc: "약점 유형 집중 + 주 2회 모의고사 · 실전 감각" },
    { label: "3단계", days: stage3, desc: "매일 모의고사 1회 + 복습 · 컨디션 유지" },
  ];
}

// 8-4 주간 리포트 + 시험 전 역산 플랜
export function ReportScreen({ onBack }: { onBack: () => void }) {
  const supabase = useSupabase();
  const { profile } = useAuth();
  const { data, loading } = useStudyData(supabase, profile?.id);
  const plan = computeExamPlan(profile?.exam_date);

  const maxAvg = Math.max(1, ...data.chapterAverages.map((c) => c.avg));

  return (
    <div className="flex flex-col gap-4 px-4 py-6">
      <button onClick={onBack} className="self-start text-sm text-gray-500 dark:text-gray-400">
        ‹ 뒤로
      </button>
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">주간 리포트</h1>

      <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
        <p className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">챕터별 평균 자기채점</p>
        {loading && <p className="text-sm text-gray-400">불러오는 중…</p>}
        {!loading && data.chapterAverages.length === 0 && (
          <p className="text-sm text-gray-400">아직 기록이 없어요.</p>
        )}
        <div className="flex flex-col gap-2">
          {CHAPTERS.map((c) => {
            const entry = data.chapterAverages.find((a) => a.chapterId === c.id);
            const pct = entry ? (entry.avg / maxAvg) * 100 : 0;
            return (
              <div key={c.id} className="flex items-center gap-2">
                <span className="w-10 shrink-0 text-xs text-gray-500 dark:text-gray-400">
                  Ch{c.id}
                </span>
                <div className="h-3 flex-1 rounded-full bg-gray-100 dark:bg-gray-800">
                  <div
                    className="h-3 rounded-full bg-blue-600"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right text-xs text-gray-500 dark:text-gray-400">
                  {entry ? entry.avg.toFixed(1) : "-"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">이번 주 학습</p>
        <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
          오늘 {data.todayAttemptsCount}문제
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          평균 {data.todayAvgScore?.toFixed(1) ?? "-"}점 · 스트릭 {data.streak}일(최고 {data.bestStreak}일)
        </p>
      </div>

      {plan && (
        <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
          <p className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
            시험 전 역산 플랜 (오늘 기준)
          </p>
          <div className="flex flex-col gap-3">
            {plan.map((stage) => (
              <div key={stage.label} className="rounded-xl bg-gray-50 p-3 dark:bg-gray-900">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {stage.label} · 약 {stage.days}일
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stage.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {!plan && (
        <p className="text-sm text-gray-400">설정에서 시험일을 등록하면 역산 플랜을 볼 수 있어요.</p>
      )}
    </div>
  );
}
