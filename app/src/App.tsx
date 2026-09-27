import { Routes, Route } from "react-router-dom";
import {
  SupabaseProvider,
  AuthProvider,
  RouteGuard,
  AdminGuard,
  LoginScreen,
  SignupScreen,
  PendingScreen,
  BlockedScreen,
} from "@toeic/auth";
import { HomeScreen } from "@toeic/study";
import { ExamHomeScreen } from "@toeic/exam";
import { AnswersHomeScreen } from "@toeic/answers";
import { AdminHomeScreen } from "@toeic/admin";
import { supabase } from "./lib/supabase";
import { SettingsScreen } from "./screens/SettingsScreen";
import { BottomTabs } from "./BottomTabs";

function AppShell() {
  return (
    <div className="pb-16">
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/exam" element={<ExamHomeScreen />} />
        <Route path="/answers" element={<AnswersHomeScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route
          path="/admin"
          element={
            <AdminGuard>
              <AdminHomeScreen />
            </AdminGuard>
          }
        />
      </Routes>
      <BottomTabs />
    </div>
  );
}

export default function App() {
  return (
    <SupabaseProvider client={supabase}>
      <AuthProvider>
        <RouteGuard>
          <Routes>
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/signup" element={<SignupScreen />} />
            <Route path="/pending" element={<PendingScreen />} />
            <Route path="/blocked" element={<BlockedScreen />} />
            <Route path="/*" element={<AppShell />} />
          </Routes>
        </RouteGuard>
      </AuthProvider>
    </SupabaseProvider>
  );
}
