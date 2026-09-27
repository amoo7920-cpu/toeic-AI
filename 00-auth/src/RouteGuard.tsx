import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

const PUBLIC_PATHS = ["/login", "/signup"];
const STATUS_ONLY_PATH: Record<"pending" | "blocked", string> = {
  pending: "/pending",
  blocked: "/blocked",
};

// 3-3 라우팅 가드: 화면 접근 제한은 편의용이고, 실제 보안은 DB RLS가 담당한다.
// 각 상태마다 "그 상태에서만 볼 수 있는 경로"를 정의하고, 그 경로일 때는 children(Routes)이
// 실제로 렌더링되도록 통과시켜야 한다 — 그렇지 않으면 Navigate만 반복되고 화면이 그려지지 않는다.
export function RouteGuard({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const location = useLocation();
  const isPublicPath = PUBLIC_PATHS.includes(location.pathname);

  if (status === "loading") {
    return <div className="flex h-dvh items-center justify-center text-gray-400">불러오는 중…</div>;
  }

  if (status === "active") {
    const isStatusOnlyPath = Object.values(STATUS_ONLY_PATH).includes(location.pathname);
    if (isPublicPath || isStatusOnlyPath) return <Navigate to="/" replace />;
    return <>{children}</>;
  }

  if (status === "signed-out") {
    return isPublicPath ? <>{children}</> : <Navigate to="/login" replace />;
  }

  // pending / blocked
  const allowedPath = STATUS_ONLY_PATH[status];
  return location.pathname === allowedPath ? <>{children}</> : <Navigate to={allowedPath} replace />;
}

export function AdminGuard({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  if (profile?.role !== "admin") return <Navigate to="/" replace />;
  return <>{children}</>;
}
