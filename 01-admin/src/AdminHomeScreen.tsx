import { useState } from "react";
import { GenerateQuestionsScreen } from "./GenerateQuestionsScreen";

const TABS = [
  { key: "generate", label: "문제 추가" },
  { key: "manage", label: "문제 관리" },
  { key: "users", label: "사용자 관리" },
  { key: "jobs", label: "생성 이력" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function Placeholder({ label }: { label: string }) {
  return (
    <div className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">
      {label} 화면은 다음 단계에서 구현합니다.
    </div>
  );
}

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
      {tab === "manage" && <Placeholder label="문제 관리" />}
      {tab === "users" && <Placeholder label="사용자 관리" />}
      {tab === "jobs" && <Placeholder label="생성 이력" />}
    </div>
  );
}
