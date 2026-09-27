import { useEffect, useState } from "react";
import { useAuth, useSupabase } from "@toeic/auth";
import { fetchExamQuestions, type ExamMode, type ExamQuestion } from "./lib/fetchExamQuestions";
import { saveAttempt, flushOutbox } from "./lib/saveAttempt";
import { QuestionRunner, type QuestionResult } from "./QuestionRunner";

export function ExamSession({
  mode,
  chapterId,
  onExit,
}: {
  mode: ExamMode;
  chapterId?: number;
  onExit: () => void;
}) {
  const supabase = useSupabase();
  const { profile } = useAuth();
  const [questions, setQuestions] = useState<ExamQuestion[] | null>(null);
  const [index, setIndex] = useState(0);
  const [scores, setScores] = useState<number[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchExamQuestions(supabase, mode, chapterId).then((qs) => {
      if (!cancelled) setQuestions(qs);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, chapterId]);

  useEffect(() => {
    if (!profile) return;
    flushOutbox(supabase, profile.id);
    const onOnline = () => flushOutbox(supabase, profile.id);
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  async function handleSubmit(current: ExamQuestion, result: QuestionResult) {
    if (profile) {
      await saveAttempt(supabase, {
        userId: profile.id,
        questionId: current.id,
        mode,
        selfScore: result.selfScore,
        totalScore: result.totalScore,
        durationSec: result.durationSec,
      });
      await supabase.rpc("schedule_review", { p_question_id: current.id, p_score: result.totalScore });
      await supabase.rpc("award_xp", { p_amount: 15 });
    }
    setScores((s) => [...s, result.totalScore]);
    setIndex((i) => i + 1);
  }

  if (questions === null) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">문제를 불러오는 중…</div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 px-4 py-16 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          지금은 풀 수 있는 문제가 없어요. 나중에 다시 시도해주세요.
        </p>
        <button
          onClick={onExit}
          className="h-11 rounded-xl bg-gray-900 px-5 text-sm font-semibold text-white dark:bg-white dark:text-gray-900"
        >
          돌아가기
        </button>
      </div>
    );
  }

  if (index >= questions.length) {
    const avg = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : "-";
    return (
      <div className="flex flex-col items-center gap-4 px-4 py-16 text-center">
        <span className="text-4xl">🎉</span>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">완료했습니다!</h2>
        <p className="text-gray-500 dark:text-gray-400">
          {questions.length}문제 · 평균 자기채점 {avg}점
        </p>
        <button
          onClick={onExit}
          className="h-11 rounded-xl bg-gray-900 px-5 text-sm font-semibold text-white dark:bg-white dark:text-gray-900"
        >
          홈으로
        </button>
      </div>
    );
  }

  const current = questions[index];

  return (
    <QuestionRunner
      key={current.id}
      question={current}
      index={index}
      total={questions.length}
      onSubmit={(result) => handleSubmit(current, result)}
    />
  );
}
