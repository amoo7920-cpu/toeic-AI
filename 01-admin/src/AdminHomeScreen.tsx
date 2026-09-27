import { useState } from "react";
import { GenerateQuestionsScreen } from "./GenerateQuestionsScreen";
import { QuestionManageScreen } from "./QuestionManageScreen";
import { UserManageScreen } from "./UserManageScreen";
import { GenerationJobsScreen } from "./GenerationJobsScreen";

const TABS = [
  { key: "generate", label: "문제 추가" },
  { key: "manage", label: "문제 관리" },
  { key: "users", label: "사용자 관리" },
  { key: "jobs", label: "생성 이력" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function AdminHomeScreen() {
  const [tab, setTab] = useState<TabKey>("generate");

  return (
    <div className="flex flex-col">
      <div className="flex gap-1 overflow-x-auto border-b border-gray-200 px-2 dark:border-gray-800">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`whitespace-nowrap px-3 py-3 text-sm font-semibold ${
              tab === t.key
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "generate" && <GenerateQuestionsScreen />}
      {tab === "manage" && <QuestionManageScreen />}
      {tab === "users" && <UserManageScreen />}
      {tab === "jobs" && <GenerationJobsScreen />}
    </div>
  );
}
