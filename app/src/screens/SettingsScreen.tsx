import { useState } from "react";
import { useAuth, useSupabase } from "@toeic/auth";

export function SettingsScreen() {
  const { profile, signOut, refreshProfile } = useAuth();
  const supabase = useSupabase();
  const [examDate, setExamDate] = useState(profile?.exam_date ?? "");
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    await supabase
      .from("profiles")
      .update({ exam_date: examDate || null, display_name: displayName || null })
      .eq("id", profile.id);
    await refreshProfile();
    setSaving(false);
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">설정</h1>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold text-gray-700 dark:text-gray-300">표시 이름</span>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="h-11 rounded-xl border border-gray-300 px-3 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold text-gray-700 dark:text-gray-300">시험일</span>
        <input
          type="date"
          value={examDate ?? ""}
          onChange={(e) => setExamDate(e.target.value)}
          className="h-11 rounded-xl border border-gray-300 px-3 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      </label>

      <button
        onClick={handleSave}
        disabled={saving}
        className="h-12 rounded-xl bg-blue-600 text-base font-semibold text-white disabled:opacity-50"
      >
        {saving ? "저장 중…" : "저장"}
      </button>

      <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-800">
        <button
          onClick={() => signOut()}
          className="h-12 w-full rounded-xl border border-gray-300 text-base font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-200"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}
