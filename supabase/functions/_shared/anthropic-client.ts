export interface ClaudeCallParams {
  apiKey: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
  // Ch2는 문항(Q3,Q4)마다 다른 사진을 쓰므로 여러 장을 순서대로 전달할 수 있다.
  imageUrls?: (string | null | undefined)[];
}

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
      max_tokens: 4096,
      system: params.systemPrompt,
      messages: [{ role: "user", content }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Claude API error ${res.status}: ${body}`);
  }

  const json = await res.json();
  const textBlock = json.content?.find((b: { type: string }) => b.type === "text");
  if (!textBlock?.text) throw new Error("Claude API returned no text content");
  return textBlock.text as string;
}

export function extractJson(raw: string): unknown {
  const trimmed = raw.trim();
  const withoutFences = trimmed.replace(/^```(json)?/i, "").replace(/```$/, "").trim();
  return JSON.parse(withoutFences);
}
