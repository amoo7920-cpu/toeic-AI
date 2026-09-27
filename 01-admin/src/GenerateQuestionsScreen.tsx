import { useEffect, useState } from "react";
import { useSupabase } from "@toeic/auth";
import { CHAPTERS } from "@toeic/shared/parts";

interface ChapterStat {
  chapter_id: number;
  code: string;
  name: string;
  published: number;
  draft: number;
  archived: number;
}

interface JobProgress {
  chapterId: number;
  status: "pending" | "running" | "success" | "failed";
  message?: string;
}

// 5-3 관리자 콘솔 "문제 추가" 화면: 챕터 선택 → 난이도 → 공개 방식 → Edge Function 순차 호출(최대 동시 2개)
export function GenerateQuestionsScreen() {
  const supabase = useSupabase();
  const [stats, setStats] = useState<ChapterStat[]>([]);
  const [selectedChapters, setSelectedChapters] = useState<number[]>([1]);
  const [difficulty, setDifficulty] = useState<"auto" | "IH" | "AL" | "AM">("auto");
  const [publishMode, setPublishMode] = useState<"now" | "review">("review");
  const [jobs, setJobs] = useState<JobProgress[]>([]);
  const [running, setRunning] = useState(false);

  async function loadStats() {
    const { data } = await supabase.from("v_chapter_stats").select("*").order("chapter_id");
    if (data) setStats(data as ChapterStat[]);
  }

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleChapter(id: number) {
    setSelectedChapters((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  async function handleGenerate() {
    if (selectedChapters.length === 0 || running) return;
    setRunning(true);
    const initialJobs: JobProgress[] = selectedChapters.map((chapterId) => ({
      chapterId,
      status: "pending",
    }));
    setJobs(initialJobs);

    const queue = [...selectedChapters];
    const CONCURRENCY = 2;

    async function runOne(chapterId: number) {
      setJobs((prev) => prev.map((j) => (j.chapterId === chapterId ? { ...j, status: "running" } : j)));
      const { data, error } = await supabase.functions.invoke("generate-question-set", {
        body: {
          chapterId,
          difficulty: difficulty === "auto" ? undefined : difficulty,
          autoPublish: publishMode === "now",
        },
      });
      setJobs((prev) =>
        prev.map((j) =>
          j.chapterId === chapterId
            ? {
                ...j,
                status: error || data?.error ? "failed" : "success",
                message: error?.message ?? data?.error ?? data?.topicKey,
              }
            : j
        )
      );
    }

    async function worker() {
      while (queue.length > 0) {
        const chapterId = queue.shift();
        if (chapterId === undefined) return;
        await runOne(chapterId);
      }
    }

    await Promise.all(Array.from({ length: CONCURRENCY }, worker));
    await loadStats();
    setRunning(false);
  }

  const done = jobs.filter((j) => j.status === "success" || j.status === "failed").length;

  return (
    <div className="flex flex-col gap-4 px-4 py-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">문제 추가</h1>

      <div className="grid grid-cols-5 gap-2">
        {stats.map((s) => (
          <div key={s.chapter_id} className="rounded-xl border border-gray-200 p-2 text-center text-xs dark:border-gray-800">
            <p className="font-semibold text-gray-900 dark:text-white">{s.code}</p>
            <p className="text-gray-500 dark:text-gray-400">{s.published}</p>
          </div>
        ))}
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">챕터</p>
        <div className="flex flex-wrap gap-2">
          {CHAPTERS.map((c) => (
            <button
              key={c.id}
              onClick={() => toggleChapter(c.id)}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                selectedChapters.includes(c.id)
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-300"
              }`}
            >
              Ch{c.id}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">난이도</p>
        <div className="flex gap-2">
          {(["auto", "IH", "AL", "AM"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                difficulty === d
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-300"
              }`}
            >
              {d === "auto" ? "자동배분" : d}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">공개</p>
        <div className="flex gap-2">
          <button
            onClick={() => setPublishMode("now")}
            className={`rounded-full border px-3 py-1.5 text-sm ${
              publishMode === "now"
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-300"
            }`}
          >
            바로 공개
          </button>
          <button
            onClick={() => setPublishMode("review")}
            className={`rounded-full border px-3 py-1.5 text-sm ${
              publishMode === "review"
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-300"
            }`}
          >
            검토 후 공개
          </button>
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={running || selectedChapters.length === 0}
        className="h-12 rounded-xl bg-gray-900 text-base font-bold text-white disabled:opacity-50 dark:bg-white dark:text-gray-900"
      >
        {running ? "생성 중…" : "문제 추가"}
      </button>

      {jobs.length > 0 && (
        <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
            진행 {done} / {jobs.length}
          </p>
          <ul className="flex flex-col gap-1 text-sm">
            {jobs.map((j) => (
              <li key={j.chapterId} className="flex items-center gap-2">
                <span>
                  {j.status === "success" ? "✓" : j.status === "failed" ? "✗" : j.status === "running" ? "⟳" : "…"}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">Ch{j.chapterId}</span>
                {j.message && <span className="truncate text-gray-500 dark:text-gray-400">{j.message}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
