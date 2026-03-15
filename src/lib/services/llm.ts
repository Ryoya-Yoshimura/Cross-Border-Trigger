import type { NewsArticle } from "./news-api";
import type { QuestionSet } from "../question-sources/evergreen";

export type LLMGeneratedQuestion = {
  question: string;
  options: { label: string; subtext: string; sourceIndex: number; imageKeyword: string }[];
};

// ================================================================
// トピックデータ（話題 → 日本語ラベル + 絵文字 + グラデーション）
// ================================================================

type TopicData = { keywords: string[]; label: string; emoji: string; gradient: string };

// ※ keywords は単語境界マッチ（"win"が"award-winning"に誤反応しないよう \b を使用）
const TOPIC_DATA: TopicData[] = [
  { keywords: ["baseball", "home run", "pitcher", "batter", "inning", "ballpark"],       label: "野球の話",         emoji: "⚾", gradient: "linear-gradient(135deg, #b7e4c7, #95d5b2)" },
  { keywords: ["soccer", "football", "goal", "league", "fifa", "striker", "midfielder"], label: "サッカーの話",     emoji: "⚽", gradient: "linear-gradient(135deg, #d8f3dc, #b7e4c7)" },
  { keywords: ["basketball", "nba", "dunk", "three-pointer", "layup"],                  label: "バスケの話",       emoji: "🏀", gradient: "linear-gradient(135deg, #ffd6a5, #ffb347)" },
  { keywords: ["tennis", "wimbledon", "grand slam", "serve", "racket"],                 label: "テニスの話",       emoji: "🎾", gradient: "linear-gradient(135deg, #fff3b0, #ffe066)" },
  { keywords: ["golf", "pga", "birdie", "eagle", "fairway", "caddie"],                  label: "ゴルフの話",       emoji: "⛳", gradient: "linear-gradient(135deg, #c9e4ca, #a7c4a0)" },
  { keywords: ["olympic", "paralympic", "medal", "marathon", "swimming", "gymnastics"], label: "スポーツの話",     emoji: "🏅", gradient: "linear-gradient(135deg, #ffecd2, #fcb69f)" },
  { keywords: ["champion", "championship", "tournament", "trophy", "title match"],      label: "優勝の話",         emoji: "🏆", gradient: "linear-gradient(135deg, #fde8a0, #fbc84a)" },
  { keywords: ["music", "album", "singer", "concert", "band", "pop star", "rock"],      label: "音楽の話",         emoji: "🎵", gradient: "linear-gradient(135deg, #e2d4f0, #c9b8e8)" },
  { keywords: ["movie", "film", "cinema", "director", "box office", "screenplay"],      label: "映画の話",         emoji: "🎬", gradient: "linear-gradient(135deg, #ffd1dc, #ffb3c1)" },
  { keywords: ["tv show", "series", "drama", "streaming", "netflix", "episode"],        label: "ドラマの話",       emoji: "📺", gradient: "linear-gradient(135deg, #c8d8f0, #a8c0e8)" },
  { keywords: ["actor", "actress", "celebrity", "red carpet", "award ceremony"],        label: "芸能の話",         emoji: "⭐", gradient: "linear-gradient(135deg, #fff0c8, #ffe49a)" },
  { keywords: ["restaurant", "café", "coffee", "cuisine", "recipe", "chef", "menu"],    label: "グルメの話",       emoji: "🍽️", gradient: "linear-gradient(135deg, #ffd9b3, #ffbf80)" },
  { keywords: ["travel", "trip", "destination", "hotel", "tourism", "vacation"],        label: "旅行の話",         emoji: "✈️", gradient: "linear-gradient(135deg, #c8eaf8, #a0d8f0)" },
  { keywords: ["fashion", "runway", "designer", "outfit", "clothing brand"],            label: "ファッションの話", emoji: "👗", gradient: "linear-gradient(135deg, #ffd6e7, #ffb3d1)" },
  { keywords: ["tech", "artificial intelligence", "smartphone", "gadget", "software"],  label: "テクノロジーの話", emoji: "💻", gradient: "linear-gradient(135deg, #c0f0f4, #96e4ea)" },
  { keywords: ["game", "gaming", "esports", "playstation", "nintendo", "xbox"],         label: "ゲームの話",       emoji: "🎮", gradient: "linear-gradient(135deg, #d4c8f0, #b8a8e8)" },
  { keywords: ["dog", "cat", "wildlife", "zoo", "rescue", "puppy", "kitten"],           label: "動物の話",         emoji: "🐾", gradient: "linear-gradient(135deg, #e8d8c8, #d4c0aa)" },
  { keywords: ["book", "novel", "author", "bestseller", "literature"],                  label: "本の話",           emoji: "📚", gradient: "linear-gradient(135deg, #d0dce8, #b8ccd8)" },
  { keywords: ["art", "painting", "exhibition", "museum", "gallery", "artwork"],        label: "アートの話",       emoji: "🎨", gradient: "linear-gradient(135deg, #ffd6cc, #f0b8d0)" },
  { keywords: ["fitness", "workout", "yoga", "marathon", "gym", "wellness"],            label: "健康の話",         emoji: "💪", gradient: "linear-gradient(135deg, #b8ead8, #96d8c0)" },
  { keywords: ["comedy", "comedian", "stand-up", "funny", "humor"],                     label: "お笑いの話",       emoji: "😄", gradient: "linear-gradient(135deg, #fff4b0, #ffe880)" },
  { keywords: ["dance", "ballet", "choreography", "performance"],                       label: "ダンスの話",       emoji: "💃", gradient: "linear-gradient(135deg, #ffc8d8, #ffaac4)" },
  { keywords: ["space", "nasa", "rocket", "satellite", "astronomy"],                    label: "宇宙の話",         emoji: "🚀", gradient: "linear-gradient(135deg, #c0c8e8, #a8b4d8)" },
  { keywords: ["nature", "environment", "forest", "ocean", "climate"],                  label: "自然の話",         emoji: "🌿", gradient: "linear-gradient(135deg, #c8e8c0, #aad4a0)" },
];

const DEFAULT_TOPIC: TopicData = { keywords: [], label: "気になる話題", emoji: "📰", gradient: "linear-gradient(135deg, #e0e8f0, #ccd8e4)" };

// 単語境界マッチで誤検出を防ぐ
function matchesKeyword(text: string, keyword: string): boolean {
  try {
    return new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(text);
  } catch {
    return text.toLowerCase().includes(keyword.toLowerCase());
  }
}

function detectTopic(text: string): TopicData {
  for (const topic of TOPIC_DATA) {
    if (topic.keywords.some((kw) => matchesKeyword(text, kw))) return topic;
  }
  return DEFAULT_TOPIC;
}

// ================================================================
// 共通プロンプト
// ================================================================

function buildPrompt(articles: NewsArticle[]): string {
  return `以下のニュース4件をもとに、日本語で4択の質問を1つ作ってください。

ニュース:
${articles.map((a, i) => `${i + 1}. ${a.title}${a.description ? `\n   ${a.description}` : ""}`).join("\n")}

要件:
- ニュースはスポーツ・芸能・エンタメ・ライフスタイルなど明るい話題です
- 質問文は「今日気になるのはどれ？」「最近チェックしてる？」「どれが気になる？」のような
  軽い好奇心・関心を引き出す自然な日本語にすること（20文字以内が理想）
- ユーザー自身の関心・好みを問う形にする
- 選択肢はニュースの話題を日本語で簡潔に表現する
- 各選択肢のlabelは10〜20文字程度
- subtextは補足説明（15文字以内）
- imageKeywordはその話題を表す英単語1〜3語（例: "baseball", "concert stage", "cafe latte"）
- 前置き文は出力しない
- 出力は必ずJSON形式のみ

出力形式:
{
  "question": "...",
  "options": [
    { "label": "...", "subtext": "...", "sourceIndex": 0, "imageKeyword": "..." },
    { "label": "...", "subtext": "...", "sourceIndex": 1, "imageKeyword": "..." },
    { "label": "...", "subtext": "...", "sourceIndex": 2, "imageKeyword": "..." },
    { "label": "...", "subtext": "...", "sourceIndex": 3, "imageKeyword": "..." }
  ]
}`;
}

function parseOutput(raw: string): LLMGeneratedQuestion {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON in model output");
  return JSON.parse(jsonMatch[0]) as LLMGeneratedQuestion;
}

function buildChoices(parsed: LLMGeneratedQuestion, articles: NewsArticle[]) {
  return parsed.options.map((opt, i) => {
    const sourceArticle = articles[opt.sourceIndex] ?? articles[i];
    if (sourceArticle?.urlToImage) {
      return { label: opt.label, subtext: opt.subtext, imageUrl: sourceArticle.urlToImage };
    }
    const topic = detectTopic(opt.imageKeyword + " " + opt.label);
    return { label: opt.label, subtext: opt.subtext, emoji: topic.emoji, gradient: topic.gradient };
  });
}

// ================================================================
// テンプレートフォールバック（LLM失敗時）
// ================================================================

function templateFallback(articles: NewsArticle[]): QuestionSet {
  const usedEmojis = new Set<string>();

  const choices = articles.slice(0, 4).map((a) => {
    // 話題検出（重複時は別のトピックを使用）
    let topic = detectTopic(a.title);
    if (usedEmojis.has(topic.emoji)) {
      const alt = TOPIC_DATA.find((t) => !usedEmojis.has(t.emoji));
      if (alt) topic = alt;
    }
    usedEmojis.add(topic.emoji);

    if (a.urlToImage) {
      return { label: topic.label, subtext: a.source.name, imageUrl: a.urlToImage };
    }
    return { label: topic.label, subtext: a.source.name, emoji: topic.emoji, gradient: topic.gradient };
  });

  return { text: "今日、ちょっと気になるのはどれ？", choices };
}

// ================================================================
// Gemini API（本番用）
// ================================================================

async function generateWithGemini(articles: NewsArticle[]): Promise<QuestionSet> {
  const apiKey = process.env.GEMINI_API_KEY!;
  const model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";

  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(apiKey);
  const geminiModel = genAI.getGenerativeModel({ model });

  const result = await geminiModel.generateContent(buildPrompt(articles));
  const text = result.response.text();
  console.log(`[llm] Gemini response (${model}):`, text.slice(0, 100));

  const parsed = parseOutput(text);
  return { text: parsed.question, choices: buildChoices(parsed, articles) };
}

// ================================================================
// ローカル Transformers.js（開発用）
// ================================================================

const LOCAL_MODEL =
  process.env.QWEN_LOCAL_MODEL ?? "onnx-community/Qwen2.5-1.5B-Instruct";
const DEVICE = (process.env.QWEN_DEVICE ?? "cpu") as "cpu" | "cuda" | "webgpu";
const DTYPE = (process.env.QWEN_DTYPE ?? "q4f16") as "q4" | "fp32" | "fp16" | "q8" | "q4f16";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedPipeline: any = null;

async function getLocalPipeline() {
  if (cachedPipeline) return cachedPipeline;

  const { pipeline, env } = await import("@huggingface/transformers");
  env.cacheDir = "./.hf-cache";
  if (env.backends?.onnx?.wasm) {
    env.backends.onnx.wasm.numThreads = 4;
  }

  console.log(`[llm] Loading local model: ${LOCAL_MODEL}`);
  console.log(`[llm] Device: ${DEVICE}, dtype: ${DTYPE}`);
  console.log("[llm] First load will download the model (may take several minutes)...");

  cachedPipeline = await pipeline("text-generation", LOCAL_MODEL, {
    device: DEVICE,
    dtype: DTYPE,
  });

  console.log("[llm] Model loaded successfully.");
  return cachedPipeline;
}

async function generateWithLocal(articles: NewsArticle[]): Promise<QuestionSet> {
  const pipe = await getLocalPipeline();
  const messages = [
    { role: "system", content: "あなたは日本語で回答するAIアシスタントです。必ず日本語のみで回答してください。英語は使用しないでください。" },
    { role: "user", content: buildPrompt(articles) },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const output = await pipe(messages as any, { max_new_tokens: 1024, do_sample: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const generated = (output as any)[0]?.generated_text;
  const lastMessage = Array.isArray(generated)
    ? generated[generated.length - 1]?.content
    : generated;

  if (!lastMessage) throw new Error("No output from model");

  const parsed = parseOutput(String(lastMessage));
  return { text: parsed.question, choices: buildChoices(parsed, articles) };
}

// ================================================================
// エントリーポイント（自動切り替え）
// ================================================================

export async function generateQuestionFromNews(
  articles: NewsArticle[]
): Promise<QuestionSet> {
  const useGemini = !!process.env.GEMINI_API_KEY;

  try {
    if (useGemini) {
      console.log("[llm] Using Gemini API");
      return await generateWithGemini(articles);
    } else {
      console.log("[llm] Using local model (set GEMINI_API_KEY to use Gemini)");
      return await generateWithLocal(articles);
    }
  } catch (e) {
    console.warn("[llm] Generation failed, using template fallback:", e);
    return templateFallback(articles);
  }
}
