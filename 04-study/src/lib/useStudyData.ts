import { useCallback, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface ChapterAverage {
  chapterId: number;
  avg: number;
  count: number;
}

export interface StudyData {
  xp: number;
  streak: number;
  bestStreak: number;
  reviewDueCount: number;
  todayAttemptsCount: number;
  todayAvgScore: number | null;
  badgeCodes: string[];
  chapterAverages: ChapterAverage[];
}

const EMPTY: StudyData = {
  xp: 0,
  streak: 0,
  bestStreak: 0,
  reviewDueCount: 0,
  todayAttemptsCount: 0,
  todayAvgScore: null,
  badgeCodes: [],
  chapterAverages: [],
};

// 홈 화면(8-1/8-2)과 주간 리포트(8-4)에 필요한 데이터를 한 번에 모아온다.
export function useStudyData(supabase: SupabaseClient, userId: string | undefined) {
  const [data, setData] = useState<StudyData>(EMPTY);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayDate = todayStart.toISOString().slice(0, 10);

    const [statsRes, reviewRes, todayRes, badgesRes, allAttemptsRes] = await Promise.all([
      supabase.from("user_stats").select("xp, streak, best_streak").eq("user_id", userId).single(),
      supabase
        .from("review_schedule")
        .select("question_id", { count: "exact", head: true })
        .eq("user_id", userId)
        .lte("due_date", todayDate),
      supabase
        .from("attempts")
        .select("total_score")
        .eq("user_id", userId)
        .gte("created_at", todayStart.toISOString()),
      supabase.from("user_badges").select("badge_code").eq("user_id", userId),
      supabase
        .from("attempts")
        .select("total_score, questions!inner(question_sets!inner(chapter_id))")
        .eq("user_id", userId),
    ]);

    const stats = statsRes.data as { xp: number; streak: number; best_streak: number } | null;
    const todayScores = (todayRes.data ?? []).map((r: { total_score: number | null }) => r.total_score ?? 0);
    const todayAvg = todayScores.length
      ? todayScores.reduce((a, b) => a + b, 0) / todayScores.length
      : null;

    const byChapter = new Map<number, { sum: number; count: number }>();
    for (const row of (allAttemptsRes.data ?? []) as unknown as {
      total_score: number | null;
      questions: { question_sets: { chapter_id: number } };
    }[]) {
      const chapterId = row.questions?.question_sets?.chapter_id;
      if (!chapterId || row.total_score == null) continue;
      const entry = byChapter.get(chapterId) ?? { sum: 0, count: 0 };
      entry.sum += row.total_score;
      entry.count += 1;
      byChapter.set(chapterId, entry);
    }
    const chapterAverages: ChapterAverage[] = Array.from(byChapter.entries())
      .map(([chapterId, { sum, count }]) => ({ chapterId, avg: sum / count, count }))
      .sort((a, b) => a.chapterId - b.chapterId);

    setData({
      xp: stats?.xp ?? 0,
      streak: stats?.streak ?? 0,
      bestStreak: stats?.best_streak ?? 0,
      reviewDueCount: reviewRes.count ?? 0,
      todayAttemptsCount: todayScores.length,
      todayAvgScore: todayAvg,
      badgeCodes: (badgesRes.data ?? []).map((b: { badge_code: string }) => b.badge_code),
      chapterAverages,
    });
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, refresh };
}
