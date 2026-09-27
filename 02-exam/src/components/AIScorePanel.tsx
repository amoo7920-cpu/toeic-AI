import { useState } from "react";
import { useSupabase } from "@toeic/auth";

interface AIFeedback {
  partScore: number;
  estimatedGrade: string;
  corrections: { original: string; corrected: string }[];
  expressionsToUse: string[];
}

// Phase 5: 전사문을 score-answer Edge Function에 보내 Claude 채점을 받는다.
export function AIScorePanel({ questionId, transcript }: { questionId: string; transcript: string }) {
  const supabase = useSupabase();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<AIFeedback | null>(null);

  async function handleScore() {
    setLoading(true);
    setError(null);
    const { data, error: fnError } = await supabase.functions.invoke("score-answer", {
      body: { questionId, transcript },
    });
    setLoading(false);
    if (fnError || data?.error) {
      setError(fnError?.message ?? data?.error ?? "채점에 실패했습니다");
      return;
    }
    setFeedback(data.feedback as AIFeedback);
  }

  if (!transcript) {
    return (
      <p className="text-sm text-gray-400">
        전사된 답변이 없어요 (이 브라우저는 실시간 음성 인식을 지원하지 않거나, 마이크 소리가 인식되지 않았어요).
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <details className="rounded-xl border border-gray-200 p-3 text-sm dark:border-gray-800">
        <summary className="cursor-pointer font-semibold text-gray-700 dark:text-gray-300">
          인식된 내 답변(전사)
        </summary>
        <p className="mt-2 text-gray-600 dark:text-gray-400">{transcript}</p>
      </details>

      {!feedback && (
        <button
          onClick={handleScore}
          disabled={loading}
          className="h-11 rounded-xl bg-gray-900 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-gray-900"
        >
          {loading ? "AI 채점 중…" : "AI 채점 받기"}
        </button>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {feedback && (
        <div className="flex flex-col gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900 dark:text-white">AI 채점 결과</span>
            <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">
              {feedback.partScore}/5 · {feedback.estimatedGrade}
            </span>
          </div>
          {feedback.corrections.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">고칠 문장</p>
              <ul className="mt-1 flex flex-col gap-2">
                {feedback.corrections.map((c, i) => (
                  <li key={i} className="text-sm">
                    <span className="text-red-500 line-through">{c.original}</span>
                    <br />
                    <span className="text-green-600 dark:text-green-400">→ {c.corrected}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {feedback.expressionsToUse.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">다음에 써볼 표현</p>
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                {feedback.expressionsToUse.join(" · ")}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
