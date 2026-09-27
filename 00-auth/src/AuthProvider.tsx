import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useSupabase } from "./supabase-context";

export type AuthStatus = "loading" | "signed-out" | "pending" | "blocked" | "active";

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  role: "admin" | "user";
  status: "pending" | "active" | "blocked";
  exam_date: string | null;
  target_grade: string;
}

interface AuthContextValue {
  status: AuthStatus;
  profile: Profile | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useSupabase();
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [profile, setProfile] = useState<Profile | null>(null);

  async function loadProfile(userId: string) {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (error || !data) {
      setStatus("signed-out");
      setProfile(null);
      return;
    }
    setProfile(data as Profile);
    setStatus(data.status as AuthStatus);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      if (user) loadProfile(user.id);
      else setStatus("signed-out");
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) loadProfile(session.user.id);
      else {
        setStatus("signed-out");
        setProfile(null);
      }
    });

    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }

  async function signUp(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function refreshProfile() {
    const { data } = await supabase.auth.getUser();
    if (data.user) await loadProfile(data.user.id);
  }

  return (
    <AuthContext.Provider value={{ status, profile, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
