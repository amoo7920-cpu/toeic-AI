import { useEffect, useState } from "react";
import { useSupabase } from "@toeic/auth";

interface UserRow {
  id: string;
  email: string;
  display_name: string | null;
  role: "admin" | "user";
  status: "pending" | "active" | "blocked";
  created_at: string;
}

export function UserManageScreen() {
  const supabase = useSupabase();
  const [users, setUsers] = useState<UserRow[] | null>(null);

  async function load() {
    const { data } = await supabase
      .from("profiles")
      .select("id, email, display_name, role, status, created_at")
      .order("created_at", { ascending: false });
    setUsers((data as UserRow[]) ?? []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function setStatus(id: string, status: UserRow["status"]) {
    await supabase.from("profiles").update({ status }).eq("id", id);
    load();
  }

  async function setRole(id: string, role: UserRow["role"]) {
    if (role === "admin" && !confirm("이 사용자를 관리자로 지정할까요?")) return;
    await supabase.from("profiles").update({ role }).eq("id", id);
    load();
  }

  if (users === null) return <p className="px-4 py-6 text-gray-400">불러오는 중…</p>;

  const pending = users.filter((u) => u.status === "pending");
  const others = users.filter((u) => u.status !== "pending");

  return (
    <div className="flex flex-col gap-6 px-4 py-6">
      <div>
        <h2 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">
          승인 대기 {pending.length > 0 && `(${pending.length})`}
        </h2>
        {pending.length === 0 && <p className="text-sm text-gray-400">대기 중인 가입 요청이 없어요.</p>}
        <div className="flex flex-col gap-2">
          {pending.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between rounded-2xl border border-gray-200 p-3 dark:border-gray-800"
            >
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {u.display_name ?? u.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{u.email}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setStatus(u.id, "active")}
                  className="rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white"
                >
                  승인
                </button>
                <button
                  onClick={() => setStatus(u.id, "blocked")}
                  className="rounded-full border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 dark:border-red-900"
                >
                  거절
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">전체 사용자</h2>
        <div className="flex flex-col gap-2">
          {others.map((u) => (
            <div
              key={u.id}
              className="flex flex-col gap-2 rounded-2xl border border-gray-200 p-3 dark:border-gray-800"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {u.display_name ?? u.email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{u.email}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    u.status === "active"
                      ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                      : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
                  }`}
                >
                  {u.status === "active" ? "활성" : "차단됨"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setRole(u.id, u.role === "admin" ? "user" : "admin")}
                  className="rounded-full border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-300"
                >
                  {u.role === "admin" ? "관리자 → 일반" : "일반 → 관리자"}
                </button>
                <button
                  onClick={() => setStatus(u.id, u.status === "active" ? "blocked" : "active")}
                  className="rounded-full border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-300"
                >
                  {u.status === "active" ? "차단" : "차단 해제"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
