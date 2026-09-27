import { NavLink } from "react-router-dom";
import { useAuth } from "@toeic/auth";

const BASE_TABS = [
  { to: "/", label: "홈", icon: "🏠" },
  { to: "/exam", label: "출제", icon: "🎤" },
  { to: "/answers", label: "모범답안", icon: "📘" },
  { to: "/settings", label: "설정", icon: "⚙️" },
];

export function BottomTabs() {
  const { profile } = useAuth();
  const tabs =
    profile?.role === "admin" ? [...BASE_TABS, { to: "/admin", label: "관리자", icon: "🛠" }] : BASE_TABS;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-gray-200 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-gray-950/95">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === "/"}
          className={({ isActive }) =>
            `flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs ${
              isActive ? "text-blue-600" : "text-gray-400 dark:text-gray-500"
            }`
          }
        >
          <span className="text-lg">{tab.icon}</span>
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
