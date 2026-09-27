import { useEffect, useState } from "react";
import { useSupabase } from "@toeic/auth";
import { CHAPTERS } from "@toeic/shared/parts";

interface AnswerTemplateRow {
  id: string;
  label: string;
  slot_keys: string[];
}

interface SetRow {
  id: string;
  topic_key: string;
  difficulty: string;
  status: "draft" | "published" | "archived";
  created_at: string;
  questions: { count: number }[];
}

interface QuestionRow {
  id: string;
  no: number;
  prompt: string;
  model_answer: { rendered: string; templateId: string };
  key_expressions: string[];
}

const STATUS_FILTERS = ["all", "draft", "published", "archived"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

export function QuestionManageScreen() {
  const supabase = useSupabase();
  const [chapterId, setChapterId] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sets, setSets] = useState<SetRow[] | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<QuestionRow[] | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [templates, setTemplates] = useState<AnswerTemplateRow[]>([]);

  async function loadSets() {
    let query = supabase
      .from("question_sets")
      .select("id, topic_key, difficulty, status, created_at, questions(count)")
      .eq("chapter_id", chapterId)
      .order("created_at", { ascending: false });
    if (statusFilter !== "all") query = query.eq("status", statusFilter);
    const { data } = await query;
    setSets((data as unknown as SetRow[]) ?? []);
  }

  useEffect(() => {
    setExpanded(null);
    loadSets();
    supabase
      .from("answer_templates")
      .select("id, label, slot_keys")
      .eq("chapter_id", chapterId)
      .then(({ data }) => setTemplates((data as AnswerTemplateRow[]) ?? []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId, statusFilter]);

  async function toggleExpand(setId: string) {
    if (expanded === setId) {
      setExpanded(null);
      return;
    }
    setExpanded(setId);
    const { data } = await supabase
      .from("questions")
      .select("id, no, prompt, model_answer, key_expressions")
      .eq("set_id", setId)
      .order("no");
    setExpandedQuestions((data as unknown as QuestionRow[]) ?? []);
  }

  async function updateStatus(setId: string, status: "draft" | "published" | "archived") {
    const payload: Record<string, unknown> = { status };
    if (status === "published") payload.published_at = new Date().toISOString();
    await supabase.from("question_sets").update(payload).eq("id", setId);
    loadSets();
  }

  async function deleteSet(setId: string) {
    if (!confirm("이 문제 세트를 완전히 삭제할까요? 되돌릴 수 없습니다.")) return;
    await supabase.from("question_sets").delete().eq("id", setId);
    setExpanded(null);
    loadSets();
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">문제 관리</h1>
        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="rounded-full border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-200"
        >
          {showAddForm ? "닫기" : "+ 직접 추가"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {CHAPTERS.map((c) => (
          <button
            key={c.id}
            onClick={() => setChapterId(c.id)}
            className={`rounded-full border px-3 py-1.5 text-sm ${
              chapterId === c.id
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-300"
            }`}
          >
            Ch{c.id}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full border px-3 py-1 text-xs ${
              statusFilter === s
                ? "border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900"
                : "border-gray-300 text-gray-500 dark:border-gray-700 dark:text-gray-400"
            }`}
          >
            {s === "all" ? "전체" : s === "draft" ? "초안" : s === "published" ? "공개" : "보관"}
          </button>
        ))}
      </div>

      {showAddForm && (
        <ManualAddForm
          chapterId={chapterId}
          templates={templates}
          onDone={() => {
            setShowAddForm(false);
            loadSets();
          }}
        />
      )}

      {sets === null && <p className="text-gray-400">불러오는 중…</p>}
      {sets?.length === 0 && <p className="text-gray-400">해당 조건의 문제 세트가 없어요.</p>}

      {sets?.map((set) => (
        <div key={set.id} className="rounded-2xl border border-gray-200 dark:border-gray-800">
          <button
            onClick={() => toggleExpand(set.id)}
            className="flex w-full items-center justify-between p-4 text-left"
          >
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{set.topic_key}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {set.difficulty} · 문항 {set.questions?.[0]?.count ?? 0}개 ·{" "}
                {new Date(set.created_at).toLocaleDateString()}
              </p>
            </div>
            <StatusBadge status={set.status} />
          </button>

          {expanded === set.id && (
            <div className="flex flex-col gap-3 border-t border-gray-100 p-4 dark:border-gray-800">
              {expandedQuestions?.map((q) => (
                <div key={q.id} className="rounded-xl bg-gray-50 p-3 text-sm dark:bg-gray-900">
                  <p className="font-semibold text-gray-700 dark:text-gray-300">Q{q.no}: {q.prompt}</p>
                  <p className="mt-1 text-gray-600 dark:text-gray-400">{q.model_answer?.rendered}</p>
                </div>
              ))}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => updateStatus(set.id, "published")}
                  disabled={set.status === "published"}
                  className="rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
                >
                  공개
                </button>
                <button
                  onClick={() => updateStatus(set.id, "draft")}
                  disabled={set.status === "draft"}
                  className="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 disabled:opacity-40 dark:border-gray-700 dark:text-gray-300"
                >
                  초안으로
                </button>
                <button
                  onClick={() => updateStatus(set.id, "archived")}
                  disabled={set.status === "archived"}
                  className="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 disabled:opacity-40 dark:border-gray-700 dark:text-gray-300"
                >
                  보관
                </button>
                <button
                  onClick={() => deleteSet(set.id)}
                  className="rounded-full border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 dark:border-red-900"
                >
                  삭제
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
    published: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
    archived: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
  };
  const labels: Record<string, string> = { draft: "초안", published: "공개", archived: "보관" };
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

// 5-6 직접 입력: 문항 1개를 빠르게 추가하는 간이 폼(뼈대 자동 조립 없이 렌더링 결과를 직접 입력).
function ManualAddForm({
  chapterId,
  templates,
  onDone,
}: {
  chapterId: number;
  templates: AnswerTemplateRow[];
  onDone: () => void;
}) {
  const supabase = useSupabase();
  const [topicKey, setTopicKey] = useState("");
  const [difficulty, setDifficulty] = useState<"IH" | "AL" | "AM">("AL");
  const [no, setNo] = useState(1);
  const [prompt, setPrompt] = useState("");
  const [prepSec, setPrepSec] = useState(45);
  const [responseSec, setResponseSec] = useState(30);
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? "");
  const [rendered, setRendered] = useState("");
  const [keyExpressions, setKeyExpressions] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!topicKey || !prompt || !rendered) {
      setError("주제 키, 문제, 모범답안은 필수예요.");
      return;
    }
    setSaving(true);
    setError(null);
    const { data: set, error: setError_ } = await supabase
      .from("question_sets")
      .insert({
        chapter_id: chapterId,
        difficulty,
        topic_key: topicKey,
        content_hash: `manual:${topicKey}:${Date.now()}`,
        stimulus: { text: null, infoTable: null, scenario: null },
        status: "draft",
        source: "manual",
      })
      .select()
      .single();
    if (setError_ || !set) {
      setError(setError_?.message ?? "세트 생성에 실패했어요");
      setSaving(false);
      return;
    }
    const { error: qError } = await supabase.from("questions").insert({
      set_id: set.id,
      no,
      prompt,
      prep_sec: prepSec,
      response_sec: responseSec,
      model_answer: { templateId, slots: {}, rendered, wordCount: rendered.split(/\s+/).length },
      key_expressions: keyExpressions
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });
    setSaving(false);
    if (qError) {
      setError(qError.message);
      return;
    }
    onDone();
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        문항 1개 직접 추가 (초안으로 저장됩니다)
      </p>
      <input
        placeholder="주제 키 (예: ch1:my-topic)"
        value={topicKey}
        onChange={(e) => setTopicKey(e.target.value)}
        className="h-10 rounded-xl border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
      />
      <div className="flex gap-2">
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as "IH" | "AL" | "AM")}
          className="h-10 flex-1 rounded-xl border border-gray-300 px-2 text-sm dark:border-gray-700 dark:bg-gray-900"
        >
          <option value="IH">IH</option>
          <option value="AL">AL</option>
          <option value="AM">AM</option>
        </select>
        <input
          type="number"
          min={1}
          max={11}
          value={no}
          onChange={(e) => setNo(Number(e.target.value))}
          className="h-10 w-20 rounded-xl border border-gray-300 px-2 text-sm dark:border-gray-700 dark:bg-gray-900"
        />
        <select
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value)}
          className="h-10 flex-1 rounded-xl border border-gray-300 px-2 text-sm dark:border-gray-700 dark:bg-gray-900"
        >
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.id}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <label className="flex flex-1 items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          준비(초)
          <input
            type="number"
            value={prepSec}
            onChange={(e) => setPrepSec(Number(e.target.value))}
            className="h-9 w-full rounded-xl border border-gray-300 px-2 text-sm dark:border-gray-700 dark:bg-gray-900"
          />
        </label>
        <label className="flex flex-1 items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          답변(초)
          <input
            type="number"
            value={responseSec}
            onChange={(e) => setResponseSec(Number(e.target.value))}
            className="h-9 w-full rounded-xl border border-gray-300 px-2 text-sm dark:border-gray-700 dark:bg-gray-900"
          />
        </label>
      </div>
      <textarea
        placeholder="문제(영어)"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={2}
        className="rounded-xl border border-gray-300 p-3 text-sm dark:border-gray-700 dark:bg-gray-900"
      />
      <textarea
        placeholder="모범답안 전체 텍스트(영어)"
        value={rendered}
        onChange={(e) => setRendered(e.target.value)}
        rows={4}
        className="rounded-xl border border-gray-300 p-3 text-sm dark:border-gray-700 dark:bg-gray-900"
      />
      <input
        placeholder="핵심 표현 (쉼표로 구분)"
        value={keyExpressions}
        onChange={(e) => setKeyExpressions(e.target.value)}
        className="h-10 rounded-xl border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        onClick={handleSubmit}
        disabled={saving}
        className="h-11 rounded-xl bg-gray-900 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-gray-900"
      >
        {saving ? "저장 중…" : "저장"}
      </button>
    </div>
  );
}
