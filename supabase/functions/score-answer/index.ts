import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callClaude, extractJson } from "../_shared/anthropic-client.ts";

// Phase 5(선택): Web Speech API로 뜬 전사문을 채점한다.
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "content-type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY")!;
  const claudeModel = Deno.env.get("CLAUDE_MODEL") ?? "claude-sonnet-5";

  const authHeader = req.headers.get("Authorization") ?? "";
  const admin = createClient(supabaseUrl, serviceRoleKey);
  const caller = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
  } = await caller.auth.getUser();
  if (!user) return json({ error: "Unauthorized" }, 401);

  const { data: profile } = await admin
    .from("profiles")
    .select("status")
    .eq("id", user.id)
    .single();
  if (!profile || profile.status !== "active") return json({ error: "Forbidden" }, 403);

  const body = await req.json().catch(() => ({}));
  const questionId = body.questionId as string | undefined;
  const transcript = body.transcript as string | undefined;
  if (!questionId || !transcript) {
    return json({ error: "questionId and transcript are required" }, 400);
  }

  const { data: question } = await admin
    .from("questions")
    .select("prompt, model_answer, set_id")
    .eq("id", questionId)
    .single();
  if (!question) return json({ error: "Question not found" }, 404);

  const systemPrompt = `You are the official rater of the TOEIC Speaking test.
Score the examinee's spoken response (given as a transcript) against the question and the model answer.
Output ONLY valid JSON: { "partScore": number (1-5), "estimatedGrade": "IM2"|"IM3"|"IH"|"AL"|"AM"|"AH",
"corrections": [{ "original": string, "corrected": string }] (up to 3),
"expressionsToUse": string[] (up to 2) }.`;
  const userPrompt = `Question: ${question.prompt}\nModel answer: ${JSON.stringify(question.model_answer)}\nExaminee transcript: ${transcript}`;

  try {
    const raw = await callClaude({ apiKey: anthropicApiKey, model: claudeModel, systemPrompt, userPrompt });
    const feedback = extractJson(raw);
    return json({ feedback });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : String(err) }, 500);
  }
});
