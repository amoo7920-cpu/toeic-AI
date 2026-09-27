import { useEffect, useState } from "react";
import { useSupabase } from "@toeic/auth";

interface JobRow {
  id: string;
  chapter_id: number;
  difficulty: string | null;
  auto_publish: boolean;
  status: "running" | "success" | "failed";
  error: string | null;
  created_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  running: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  success: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  failed: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
};
const STATUS_LABELS: Record<string, string> = { running: "진행 중", success: "성공", failed: "실패" };

export function GenerationJobsScreen() {
  const supabase = useSupabase();
  const [jobs, setJobs] = useState<JobRow[] | null>(null);
  const [retrying, setRetrying] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase
      .from("generation_jobs")
      .select("id, chapter_id, difficulty, auto_publish, status, error, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    setJobs((data as JobRow[]) ?? []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function retry(job: JobRow) {
    setRetrying(job.id);
    await supabase.functions.invoke("generate-question-set", {
      body: {
        chapterId: job.chapter_id,
        difficulty: job.difficulty ?? undefined,
        autoPublish: job.auto_publish,
      },
    });
    setRetrying(null);
    load();
  }

  if (jobs === null) return <p className="px-4 py-6 text-gray-400">불러오는 중…</p>;

  return (
    <div className="flex flex-col gap-3 px-4 py-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">생성 이력</h1>
      {jobs.length === 0 && <p className="text-gray-400">생성 이력이 없어요.</p>}
      {jobs.map((job) => (
        <div key={job.id} className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-gray-900 dark:text-white">
              Ch{job.chapter_id} · {job.difficulty ?? "자동배분"}
            </p>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[job.status]}`}>
              {STATUS_LABELS[job.status]}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {new Date(job.created_at).toLocaleString()}
          </p>
          {job.error && <p className="mt-2 text-sm text-red-500">{job.error}</p>}
          {job.status === "failed" && (
            <button
              onClick={() => retry(job)}
              disabled={retrying === job.id}
              className="mt-3 rounded-full border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
            >
              {retrying === job.id ? "재시도 중…" : "재시도"}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
