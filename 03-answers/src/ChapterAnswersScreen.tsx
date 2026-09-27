import { useEffect, useState } from "react";
import { useAuth, useSupabase } from "@toeic/auth";
import { getChapter, type ChapterId } from "@toeic/shared/parts";
import { RenderedAnswer } from "./components/RenderedAnswer";

interface AnswerRow {
  id: string;
  no: number;
  prompt: string;
  model_answer: { templateId: string; slots: Record<string, string>; rendered: string };
  key_expressions: string[];
}

function speak(text: string, rate: number) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  utter.rate = rate;
  window.speechSynthesis.speak(utter);
}

export function ChapterAnswersScreen({
  chapterId,
  onBack,
}: {
  chapterId: ChapterId;
  onBack: () => void;
}) {
  const supabase = useSupabase();
  const { profile } = useAuth();
  const chapter = getChapter(chapterId);
  const [rows, setRows] = useState<AnswerRow[] | null>(null);
  const [quizMode, setQuizMode] = useState(false);
  const [savedExpressions, setSavedExpressions] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("questions")
      .select("id, no, prompt, model_answer, key_expressions, question_sets!inner(chapter_id, status)")
      .eq("question_sets.chapter_id", chapterId)
      .eq("question_sets.status", "published")
      .order("no")
      .then(({ data }) => {
        if (!cancelled) setRows((data as unknown as AnswerRow[]) ?? []);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId]);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from("saved_expressions")
      .select("expression")
      .eq("user_id", profile.id)
      .then(({ data }) => {
        setSavedExpressions(new Set((data ?? []).map((r: { expression: string }) => r.expression)));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  async function saveExpression(expression: string, questionId: string) {
    if (!profile) return;
    const { error } = await supabase
      .from("saved_expressions")
      .insert({ user_id: profile.id, expression, source_question_id: questionId });
    if (!error) setSavedExpressions((s) => new Set(s).add(expression));
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-6">
      <button onClick={onBack} className="self-start text-sm text-gray-500 dark:text-gray-400">
        ‹ 뒤로
      </button>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Ch{chapter.id}. {chapter.name}
        </h1>
        <button
          onClick={() => setQuizMode((v) => !v)}
          className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${
            quizMode
              ? "border-blue-600 bg-blue-600 text-white"
              : "border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-300"
          }`}
        >
          빈칸 퀴즈 {quizMode ? "끄기" : "켜기"}
        </button>
      </div>

      {rows === null && <p className="text-gray-400">불러오는 중…</p>}
      {rows?.length === 0 && (
        <p className="text-gray-400">아직 공개된 문제가 없어요. 관리자가 문제를 추가하면 여기에 표시됩니다.</p>
      )}

      {rows?.map((row) => (
        <div key={row.id} className="flex flex-col gap-3 rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Q{row.no}</span>
            <div className="flex gap-2">
              <button
                onClick={() => speak(row.model_answer.rendered, 1.0)}
                className="rounded-full border border-gray-300 px-2.5 py-1 text-xs font-semibold text-gray-600 dark:border-gray-700 dark:text-gray-300"
              >
                ▶ 1.0x
              </button>
              <button
                onClick={() => speak(row.model_answer.rendered, 0.9)}
                className="rounded-full border border-gray-300 px-2.5 py-1 text-xs font-semibold text-gray-600 dark:border-gray-700 dark:text-gray-300"
              >
                ▶ 0.9x
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400">{row.prompt}</p>

          <RenderedAnswer
            rendered={row.model_answer.rendered}
            slots={row.model_answer.slots}
            quizMode={quizMode}
          />

          {row.key_expressions?.length > 0 && (
            <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
              {row.key_expressions.map((expr) => {
                const saved = savedExpressions.has(expr);
                return (
                  <button
                    key={expr}
                    onClick={() => !saved && saveExpression(expr, row.id)}
                    disabled={saved}
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${
                      saved
                        ? "border-green-500 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400"
                        : "border-gray-300 text-gray-600 dark:border-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {saved ? "✓ " : "+ "}
                    {expr}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
