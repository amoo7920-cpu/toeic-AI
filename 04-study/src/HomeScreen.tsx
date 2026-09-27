import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useSupabase } from "@toeic/auth";
import { GRADE_XP_THRESHOLDS, getLevelProgress, BADGES } from "@toeic/shared/parts";
import { useStudyData } from "./lib/useStudyData";
import { ReportScreen } from "./ReportScreen";

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - new Date().setHours(0, 0, 0, 0);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// 8-1/8-2/8-3: XP·레벨·스트릭·데일리 퀘스트·배지를 실데이터로 보여준다.
export function HomeScreen() {
  const { profile } = useAuth();
  const supabase = useSupabase();
  const navigate = useNavigate();
  const [showReport, setShowReport] = useState(false);
  const { data, loading } = useStudyData(supabase, profile?.id);

  if (showReport) return <ReportScreen onBack={() => setShowReport(false)} />;

  const dday = daysUntil(profile?.exam_date ?? null);
  const { current, next, progress } = getLevelProgress(data.xp);
  const nextXpNeeded = next ? next.xp - data.xp : 0;

  const weakestChapter = data.chapterAverages.length
    ? data.chapterAverages.reduce((min, c) => (c.avg < min.avg ? c : min)).chapterId
    : null;

  const quests = [
    {
      label: "오늘 문제 5개 풀기",
      done: data.todayAttemptsCount >= 5,
      progress: `${Math.min(data.todayAttemptsCount, 5)}/5`,
    },
    {
      label: "복습 문제 다 풀기",
      done: data.reviewDueCount === 0,
      progress: data.reviewDueCount === 0 ? "완료" : `${data.reviewDueCount}개 남음`,
    },
    {
      label: weakestChapter ? `Ch${weakestChapter} 약점 챕터 연습` : "챕터 연습 시작하기",
      done: false,
      progress: "",
    },
  ];

  return (
    <div className="flex flex-col gap-4 px-4 py-6">
      <div className="rounded-2xl bg-blue-600 p-5 text-white">
        <p className="text-sm opacity-80">시험까지</p>
        <p className="text-3xl font-bold">{dday !== null ? `D-${dday}` : "시험일 미설정"}</p>
      </div>

      <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-gray-900 dark:text-white">{current.title}</span>
          <span className="text-gray-500 dark:text-gray-400">{data.xp} XP</span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
          <div
            className="h-2 rounded-full bg-blue-600 transition-all"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        {next && (
          <p className="mt-1 text-xs text-gray-400">
            다음 등급({GRADE_XP_THRESHOLDS.find((g) => g.grade === next.grade)?.title})까지 {nextXpNeeded} XP
          </p>
        )}
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          🔥 스트릭 {data.streak}일 (최고 {data.bestStreak}일)
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
        <p className="font-semibold text-gray-900 dark:text-white">오늘의 퀘스트</p>
        <div className="mt-2 flex flex-col gap-2">
          {quests.map((q) => (
            <div key={q.label} className="flex items-center justify-between text-sm">
              <span className={q.done ? "text-gray-400 line-through" : "text-gray-700 dark:text-gray-300"}>
                {q.done ? "✓ " : "○ "}
                {q.label}
              </span>
              {q.progress && <span className="text-xs text-gray-400">{q.progress}</span>}
            </div>
          ))}
        </div>
      </div>

      {data.badgeCodes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {data.badgeCodes.map((code) => {
            const badge = BADGES[code];
            if (!badge) return null;
            return (
              <span
                key={code}
                title={badge.desc}
                className="rounded-full bg-yellow-50 px-3 py-1.5 text-sm dark:bg-yellow-950"
              >
                {badge.emoji} {badge.label}
              </span>
            );
          })}
        </div>
      )}

      <button
        onClick={() => navigate("/exam?mode=daily5")}
        className="h-14 rounded-2xl bg-gray-900 text-base font-bold text-white dark:bg-white dark:text-gray-900"
      >
        데일리 5 시작
      </button>

      <button
        onClick={() => setShowReport(true)}
        className="h-11 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-200"
      >
        주간 리포트 보기
      </button>

      {loading && <p className="text-center text-xs text-gray-400">불러오는 중…</p>}
    </div>
  );
}
