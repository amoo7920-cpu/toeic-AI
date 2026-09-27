import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generatedQuestionSetSchema, isWordCountValid } from "../_shared/schema.ts";
import { CHAPTERS, WORD_COUNT_RANGES } from "../_shared/parts.ts";
import { buildSystemPrompt, buildImageOrderNote, RESPONSE_SCHEMA_HINT, type TemplateRow } from "../_shared/prompt.ts";
import { callClaude, extractJson } from "../_shared/anthropic-client.ts";
import { searchPexelsPhoto } from "../_shared/pexels-client.ts";

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
  const pexelsApiKey = Deno.env.get("PEXELS_API_KEY");

  const authHeader = req.headers.get("Authorization") ?? "";
  const admin = createClient(supabaseUrl, serviceRoleKey);
  const caller = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  // 1) 호출자 = admin + active 검증
  const {
    data: { user },
  } = await caller.auth.getUser();
  if (!user) return json({ error: "Unauthorized" }, 401);

  const { data: profile } = await admin
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .single();
  if (!profile || profile.role !== "admin" || profile.status !== "active") {
    return json({ error: "Forbidden: admin only" }, 403);
  }

  const body = await req.json().catch(() => ({}));
  const chapterId = Number(body.chapterId);
  const requestedDifficulty = body.difficulty as string | undefined;
  const autoPublish = Boolean(body.autoPublish);

  if (!(chapterId >= 1 && chapterId <= 5)) {
    return json({ error: "chapterId must be between 1 and 5" }, 400);
  }

  // 2) generation_jobs: running 행 생성
  const { data: job, error: jobInsertError } = await admin
    .from("generation_jobs")
    .insert({
      requested_by: user.id,
      chapter_id: chapterId,
      difficulty: requestedDifficulty ?? null,
      auto_publish: autoPublish,
      status: "running",
    })
    .select()
    .single();
  if (jobInsertError || !job) return json({ error: "Failed to create generation job" }, 500);

  try {
    // 3) 최근 topic_key 200개 조회
    const { data: recentSets } = await admin
      .from("question_sets")
      .select("topic_key")
      .eq("chapter_id", chapterId)
      .order("created_at", { ascending: false })
      .limit(200);
    const excludedTopicKeys = (recentSets ?? []).map((r) => r.topic_key as string);

    // 4) 챕터의 answer_templates 조회
    const { data: templates } = await admin
      .from("answer_templates")
      .select("id, label, skeleton, slot_keys, logic, min_words, max_words")
      .eq("chapter_id", chapterId);
    const templateRows = (templates ?? []) as TemplateRow[];

    // 5) Ch2이면 Pexels에서 문항 수만큼(보통 2장, Q3/Q4) 서로 다른 사진 검색
    const chapterDef = CHAPTERS.find((c) => c.id === chapterId)!;
    let photos: { url: string; credit: string }[] = [];
    if (chapterId === 2) {
      if (!pexelsApiKey) throw new Error("PEXELS_API_KEY is not configured");
      const seen = new Set<string>();
      while (photos.length < chapterDef.questionNos.length) {
        const photo = await searchPexelsPhoto(pexelsApiKey);
        if (seen.has(photo.url)) continue;
        seen.add(photo.url);
        photos.push(photo);
      }
    }

    const difficulty = requestedDifficulty ?? pickAutoDifficulty();
    const systemPrompt = buildSystemPrompt({
      chapterId: chapterId as 1 | 2 | 3 | 4 | 5,
      difficulty,
      excludedTopicKeys,
      templates: templateRows,
    });
    const imageNote =
      photos.length > 0
        ? `\n${buildImageOrderNote(chapterDef.questionNos)}\n${chapterDef.questionNos
            .map((no, i) => `Question ${no} image URL: ${photos[i].url}`)
            .join("\n")}`
        : "";
    const userPrompt = `Respond with JSON only, matching this shape:\n${RESPONSE_SCHEMA_HINT}${imageNote}`;

    // 6) Claude 호출 → zod 검증 (최대 2회 시도)
    let parsed: ReturnType<typeof generatedQuestionSetSchema.parse> | null = null;
    let lastError: string | null = null;
    for (let attempt = 0; attempt < 2 && !parsed; attempt++) {
      try {
        const raw = await callClaude({
          apiKey: anthropicApiKey,
          model: claudeModel,
          systemPrompt,
          userPrompt,
          imageUrls: photos.map((p) => p.url),
        });
        const candidate = generatedQuestionSetSchema.parse(extractJson(raw));

        for (const q of candidate.questions) {
          const wc = q.modelAnswer.wordCount;
          if (!isWordCountValid(q.modelAnswer.templateId, wc, WORD_COUNT_RANGES)) {
            throw new Error(
              `Question ${q.no}: word count ${wc} out of range for ${q.modelAnswer.templateId}`
            );
          }
        }
        if (excludedTopicKeys.includes(candidate.topicKey)) {
          throw new Error(`topicKey ${candidate.topicKey} already used recently`);
        }
        parsed = candidate;
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
      }
    }

    if (!parsed) throw new Error(lastError ?? "Generation failed validation");

    // 모델이 imageUrl을 잘못 옮겨 적었을 경우를 대비해, 실제로 검색한 사진을 문항 순서대로 강제 매핑한다.
    if (photos.length > 0) {
      for (const [i, no] of chapterDef.questionNos.entries()) {
        const q = parsed.questions.find((q) => q.no === no);
        if (q && photos[i]) {
          q.imageUrl = photos[i].url;
          q.imageCredit = photos[i].credit;
        }
      }
    }

    // 7) insert_question_set RPC로 트랜잭션 INSERT
    const { data: setId, error: rpcError } = await admin.rpc("insert_question_set", {
      payload: {
        ...parsed,
        autoPublish,
        source: "ai",
      },
    });
    if (rpcError) throw new Error(`insert_question_set failed: ${rpcError.message}`);

    await admin
      .from("generation_jobs")
      .update({ status: "success", set_id: setId, finished_at: new Date().toISOString() })
      .eq("id", job.id);

    return json({ jobId: job.id, setId, topicKey: parsed.topicKey, difficulty: parsed.difficulty });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await admin
      .from("generation_jobs")
      .update({ status: "failed", error: message, finished_at: new Date().toISOString() })
      .eq("id", job.id);
    return json({ error: message, jobId: job.id }, 500);
  }
});

// 자동배분 난이도: IH 30% / AL 50% / AM 20% (5-2 기본값)
function pickAutoDifficulty(): "IH" | "AL" | "AM" {
  const r = Math.random();
  if (r < 0.3) return "IH";
  if (r < 0.8) return "AL";
  return "AM";
}
