export interface ClaudeCallParams {
  apiKey: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
  // Ch2는 문항(Q3,Q4)마다 다른 사진을 쓰므로 여러 장을 순서대로 전달할 수 있다.
  imageUrls?: (string | null | undefined)[];
}

// JSON 응답을 확실히 받기 위해 assistant 턴을 "{"로 미리 채워(prefill) 이어쓰게 만든다.
// 이렇게 하면 마크다운 코드펜스나 설명 문구가 앞에 붙는 걸 원천 차단할 수 있다.
const JSON_PREFILL = "{";

// Claude Messages API 호출. 이미지가 있으면(Ch2) content block에 순서대로 함께 전달한다.
export async function callClaude(params: ClaudeCallParams): Promise<string> {
  const content: Record<string, unknown>[] = [];
  for (const url of params.imageUrls ?? []) {
    if (!url) continue;
    content.push({ type: "image", source: { type: "url", url } });
  }
  content.push({ type: "text", text: params.userPrompt });

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": params.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: params.model,
      max_tokens: 8192,
      system: params.systemPrompt,
      messages: [
        { role: "user", content },
        { role: "assistant", content: JSON_PREFILL },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Claude API error ${res.status}: ${body}`);
  }

  const json = await res.json();
  const textBlock = json.content?.find((b: { type: string }) => b.type === "text");
  if (!textBlock?.text) {
    throw new Error(
      `Claude API returned no text content (stop_reason: ${json.stop_reason ?? "unknown"})`
    );
  }
  if (json.stop_reason === "max_tokens") {
    throw new Error("Claude response was truncated (hit max_tokens) — retrying");
  }
  // prefill로 보낸 "{" 는 응답에 포함되지 않으므로 다시 앞에 붙여준다.
  return JSON_PREFILL + (textBlock.text as string);
}

export function extractJson(raw: string): unknown {
  const trimmed = raw.trim();
  const withoutFences = trimmed.replace(/^```(json)?/i, "").replace(/```$/, "").trim();
  const start = withoutFences.indexOf("{");
  const end = withoutFences.lastIndexOf("}");
  const sliced = start >= 0 && end > start ? withoutFences.slice(start, end + 1) : withoutFences;
  return JSON.parse(sliced);
}
