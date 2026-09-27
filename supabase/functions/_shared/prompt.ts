import { CHAPTERS, type ChapterId } from "./parts.ts";

export interface TemplateRow {
  id: string;
  label: string;
  skeleton: string;
  slot_keys: string[];
  logic: string;
  min_words: number | null;
  max_words: number | null;
}

// 5-4 생성 프롬프트 (system)
export function buildSystemPrompt(params: {
  chapterId: ChapterId;
  difficulty: string;
  excludedTopicKeys: string[];
  templates: TemplateRow[];
}): string {
  const chapter = CHAPTERS.find((c) => c.id === params.chapterId);
  if (!chapter) throw new Error(`Unknown chapter ${params.chapterId}`);

  const promptFieldRule = PROMPT_FIELD_RULES[params.chapterId];

  const templateBlock = params.templates
    .map(
      (t) =>
        `- templateId "${t.id}" (${t.label}): skeleton = ${JSON.stringify(t.skeleton)}; slots = [${t.slot_keys.join(", ")}]; logic = ${t.logic}${
          t.min_words ? `; word count ${t.min_words}-${t.max_words}` : ""
        }`
    )
    .join("\n");

  return `You are the administrator and official rater of the TOEIC Speaking test.
Create ONE new question set for Chapter ${chapter.id} (${chapter.name}), suited for a
Korean examinee (40s, finance professional at a large company) whose current
level is slightly below IH and whose target is AL.

Rules:
- Follow the official TOEIC Speaking format and timing exactly.
- Question numbers for this chapter: ${chapter.questionNos.join(", ")}.
- Prep/response seconds per question, in order: prep=[${chapter.prepSecs.join(", ")}], response=[${chapter.responseSecs.join(", ")}].
- Output ONLY valid JSON matching the provided schema. No markdown fences, no code blocks,
  no explanation before or after. Your entire response must start with "{" and end with "}".
- Available answer templates for this chapter:
${templateBlock}
- Model answers MUST use the given template skeleton (templateId).
  Keep every skeleton sentence unchanged; fill ONLY the {SLOT} values.
- Model answers must fit the response time at ~130 words per minute.
- For opinion examples, draw on realistic workplace experiences
  (finance/accounting, leading a large system project, cross-team collaboration).
- Do not reuse any topicKey in the exclusion list: ${JSON.stringify(params.excludedTopicKeys)}
- Difficulty: ${params.difficulty}.
- ${promptFieldRule}`;
}

// 각 챕터에서 "prompt" 필드에 정확히 무엇이 들어가야 하는지 지시문.
// (이게 없으면 모델이 "Read the text aloud..." 같은 메타 지시문을 prompt에 넣어버리는 사고가 난다.)
const PROMPT_FIELD_RULES: Record<ChapterId, string> = {
  1: 'CRITICAL for the "prompt" field: it must be the EXACT passage text the examinee will read aloud ' +
    '(the announcement/advertisement/news brief itself, 40-60 words). Do NOT put instructions like ' +
    '"Read the text aloud" or a title/label into "prompt" — that is a meta-instruction, not the passage.',
  2: 'For the "prompt" field, use exactly: "Describe the picture in as much detail as you can." for every question.',
  3: 'For the "prompt" field, put ONLY the interviewer\'s question sentence itself (e.g. "How often do you ...?"), ' +
    "not any instructions or labels.",
  4: 'For the "prompt" field, put ONLY the caller\'s spoken line itself (e.g. "Hi, I\'m calling about ...").',
  5: 'For the "prompt" field, put ONLY the opinion question sentence itself, not any instructions or labels.',
};

export const RESPONSE_SCHEMA_HINT = `{
  "chapterId": number, "difficulty": "IH"|"AL"|"AM", "topicKey": string,
  "stimulus": { "text": string|null, "infoTable": object|null, "scenario": string|null },
  "questions": [{
    "no": number, "prompt": string, "prepSec": number, "responseSec": number,
    "modelAnswer": { "templateId": string, "slots": object, "rendered": string, "wordCount": number },
    "keyExpressions": string[], "raterNotes": string,
    "imageUrl": string|null, "imageCredit": string|null
  }]
}`;

// Ch2에서 사진을 여러 장 첨부할 때, 몇 번째 이미지가 몇 번 문항인지 모델에게 알려주는 안내문
export function buildImageOrderNote(questionNos: number[]): string {
  return `The images are attached in this order: ${questionNos
    .map((no, i) => `image ${i + 1} = question ${no}`)
    .join(", ")}. Set each question's "imageUrl" to the URL provided for its own image.`;
}
