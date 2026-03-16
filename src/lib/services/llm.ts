import type { NewsArticle } from "./news-api";
import type { QuestionSet } from "../question-sources/evergreen";

export type LLMGeneratedQuestion = {
  question: string;
  options: { label: string; subtext: string; sourceIndex: number; imageKeyword: string }[];
};

// ================================================================
// トピックデータ（話題 → 日本語ラベル + 絵文字 + グラデーション）
// ================================================================

type Bucket = "sports" | "tech" | "entertainment" | "lifestyle";
type TopicData = { keywords: string[]; label: string; emoji: string; gradient: string; bucket: Bucket };

const TOPIC_DATA: TopicData[] = [
  // ── スポーツ ──
  { keywords: ["hockey", "nhl", "puck", "ice rink", "ホッケー"],                             label: "ホッケーの話",     emoji: "🏒", gradient: "linear-gradient(135deg, #c8eaf8, #a0d8f0)", bucket: "sports" },
  { keywords: ["baseball", "home run", "pitcher", "batter", "inning", "mlb", "野球", "メジャー"], label: "野球の話",         emoji: "⚾", gradient: "linear-gradient(135deg, #b7e4c7, #95d5b2)", bucket: "sports" },
  { keywords: ["soccer", "fifa", "striker", "midfielder", "premier league", "サッカー"],      label: "サッカーの話",     emoji: "⚽", gradient: "linear-gradient(135deg, #d8f3dc, #b7e4c7)", bucket: "sports" },
  { keywords: ["basketball", "nba", "dunk", "three-pointer", "バスケ"],                      label: "バスケの話",       emoji: "🏀", gradient: "linear-gradient(135deg, #ffd6a5, #ffb347)", bucket: "sports" },
  { keywords: ["american football", "nfl", "quarterback", "touchdown", "super bowl", "アメフト"], label: "アメフトの話",     emoji: "🏈", gradient: "linear-gradient(135deg, #ffd6a5, #f4a261)", bucket: "sports" },
  { keywords: ["tennis", "wimbledon", "grand slam", "racket", "テニス"],                     label: "テニスの話",       emoji: "🎾", gradient: "linear-gradient(135deg, #fff3b0, #ffe066)", bucket: "sports" },
  { keywords: ["golf", "pga", "birdie", "eagle", "fairway", "ゴルフ"],                       label: "ゴルフの話",       emoji: "⛳", gradient: "linear-gradient(135deg, #c9e4ca, #a7c4a0)", bucket: "sports" },
  { keywords: ["marathon", "swimming", "gymnastics", "athletics", "track", "陸上", "水泳"],   label: "陸上・競技の話",   emoji: "🏃", gradient: "linear-gradient(135deg, #ffecd2, #fcb69f)", bucket: "sports" },
  { keywords: ["olympic", "paralympic", "medal", "world cup", "五輪", "オリンピック"],         label: "国際大会の話",     emoji: "🏅", gradient: "linear-gradient(135deg, #fde8a0, #fbc84a)", bucket: "sports" },
  { keywords: ["ufc", "mma", "boxing", "wrestling", "combat", "格闘技", "ボクシング"],         label: "格闘技の話",       emoji: "🥊", gradient: "linear-gradient(135deg, #ffd1dc, #ffb3c1)", bucket: "sports" },
  // ── テクノロジー ──
  { keywords: ["artificial intelligence", "ai", "chatgpt", "llm", "machine learning", "人工知能"], label: "AIの話",           emoji: "🤖", gradient: "linear-gradient(135deg, #c0f0f4, #96e4ea)", bucket: "tech" },
  { keywords: ["smartphone", "iphone", "android", "mobile", "app", "スマホ", "アプリ"],       label: "スマホの話",       emoji: "📱", gradient: "linear-gradient(135deg, #d4c8f0, #b8a8e8)", bucket: "tech" },
  { keywords: ["space", "nasa", "rocket", "satellite", "astronaut", "astronomy", "spacex", "宇宙", "ロケット"], label: "宇宙の話",         emoji: "🚀", gradient: "linear-gradient(135deg, #c0c8e8, #a8b4d8)", bucket: "tech" },
  { keywords: ["gaming", "esports", "playstation", "nintendo", "xbox", "video game", "ゲーム"], label: "ゲームの話",       emoji: "🎮", gradient: "linear-gradient(135deg, #d4c8f0, #b8a8e8)", bucket: "tech" },
  { keywords: ["startup", "tech", "software", "gadget", "electric vehicle", "ev", "robot", "ロボット", "電気自動車"], label: "テクノロジーの話", emoji: "💻", gradient: "linear-gradient(135deg, #c0f0f4, #96e4ea)", bucket: "tech" },
  // ── エンタメ ──
  { keywords: ["movie", "film", "cinema", "director", "box office", "映画", "監督"],          label: "映画の話",         emoji: "🎬", gradient: "linear-gradient(135deg, #ffd1dc, #ffb3c1)", bucket: "entertainment" },
  { keywords: ["music", "album", "singer", "concert", "band", "rock", "pop star", "音楽", "ライブ", "歌手"], label: "音楽の話",         emoji: "🎵", gradient: "linear-gradient(135deg, #e2d4f0, #c9b8e8)", bucket: "entertainment" },
  { keywords: ["tv show", "series", "streaming", "netflix", "episode", "drama", "ドラマ", "アニメ"], label: "ドラマの話",       emoji: "📺", gradient: "linear-gradient(135deg, #c8d8f0, #a8c0e8)", bucket: "entertainment" },
  { keywords: ["actor", "actress", "celebrity", "red carpet", "award", "俳優", "女優", "芸能"], label: "芸能の話",         emoji: "⭐", gradient: "linear-gradient(135deg, #fff0c8, #ffe49a)", bucket: "entertainment" },
  { keywords: ["comedy", "comedian", "stand-up", "funny", "お笑い", "芸人"],                  label: "お笑いの話",       emoji: "😄", gradient: "linear-gradient(135deg, #fff4b0, #ffe880)", bucket: "entertainment" },
  { keywords: ["dance", "ballet", "choreography", "ダンス"],                                 label: "ダンスの話",       emoji: "💃", gradient: "linear-gradient(135deg, #ffc8d8, #ffaac4)", bucket: "entertainment" },
  // ── ライフスタイル ──
  { keywords: ["restaurant", "café", "coffee", "cuisine", "recipe", "chef", "food", "グルメ", "カフェ", "料理"], label: "グルメの話",       emoji: "🍽️", gradient: "linear-gradient(135deg, #ffd9b3, #ffbf80)", bucket: "lifestyle" },
  { keywords: ["travel", "trip", "destination", "hotel", "tourism", "vacation", "旅行", "ホテル", "観光"], label: "旅行の話",         emoji: "✈️", gradient: "linear-gradient(135deg, #c8eaf8, #a0d8f0)", bucket: "lifestyle" },
  { keywords: ["fashion", "runway", "designer", "outfit", "style", "ファッション", "モデル"], label: "ファッションの話", emoji: "👗", gradient: "linear-gradient(135deg, #ffd6e7, #ffb3d1)", bucket: "lifestyle" },
  { keywords: ["dog", "cat", "wildlife", "zoo", "rescue", "puppy", "kitten", "animal", "動物", "犬", "猫"], label: "動物の話",         emoji: "🐾", gradient: "linear-gradient(135deg, #e8d8c8, #d4c0aa)", bucket: "lifestyle" },
  { keywords: ["fitness", "workout", "yoga", "gym", "wellness", "health", "健康", "ヨガ", "フィットネス"], label: "健康の話",         emoji: "💪", gradient: "linear-gradient(135deg, #b8ead8, #96d8c0)", bucket: "lifestyle" },
  { keywords: ["book", "novel", "author", "bestseller", "本", "小説", "作家"],               label: "本の話",           emoji: "📚", gradient: "linear-gradient(135deg, #d0dce8, #b8ccd8)", bucket: "lifestyle" },
  { keywords: ["art", "painting", "exhibition", "museum", "gallery", "アート", "美術館", "展覧会"], label: "アートの話",       emoji: "🎨", gradient: "linear-gradient(135deg, #ffd6cc, #f0b8d0)", bucket: "lifestyle" },
  { keywords: ["nature", "environment", "forest", "ocean", "climate", "自然", "環境", "海"],   label: "自然の話",         emoji: "🌿", gradient: "linear-gradient(135deg, #c8e8c0, #aad4a0)", bucket: "lifestyle" },
];

// ソース名 → バケツ（キーワード検出の補完用）
const SOURCE_BUCKET_MAP: { sources: string[]; bucket: Bucket }[] = [
  { sources: ["espn", "sports illustrated", "bleacher report", "the athletic", "cbs sports"], bucket: "sports" },
  { sources: ["techcrunch", "the verge", "wired", "ars technica", "engadget", "gizmodo"],     bucket: "tech" },
  { sources: ["variety", "entertainment weekly", "deadline", "hollywood reporter", "billboard", "rolling stone", "pitchfork"], bucket: "entertainment" },
];

const DEFAULT_TOPIC: TopicData = { keywords: [], label: "気になる話題", emoji: "📰", gradient: "linear-gradient(135deg, #e0e8f0, #ccd8e4)", bucket: "lifestyle" };

// 単語境界マッチで誤検出を防ぐ（日本語は単純な include）
function matchesKeyword(text: string, keyword: string): boolean {
  const isJapanese = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf]/.test(keyword);
  if (isJapanese) {
    return text.toLowerCase().includes(keyword.toLowerCase());
  }
  try {
    return new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(text);
  } catch {
    return text.toLowerCase().includes(keyword.toLowerCase());
  }
}

function detectTopic(text: string, sourceName?: string): TopicData {
  // キーワードで具体的なトピックを先に検出
  for (const topic of TOPIC_DATA) {
    if (topic.keywords.some((kw) => matchesKeyword(text, kw))) return topic;
  }
  // キーワード未検出 → ソース名でバケツを判定して汎用ラベルを返す
  if (sourceName) {
    const lower = sourceName.toLowerCase();
    const matched = SOURCE_BUCKET_MAP.find((m) => m.sources.some((s) => lower.includes(s)));
    if (matched) {
      const fallback = TOPIC_DATA.find((t) => t.bucket === matched.bucket);
      if (fallback) return fallback;
    }
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
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in model output");
    return JSON.parse(jsonMatch[0]) as LLMGeneratedQuestion;
  } catch (e) {
    console.error("[llm] Failed to parse model output:", raw);
    throw e;
  }
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
  const tagged = articles.map((a) => ({ a, topic: detectTopic(a.title + " " + (a.description || ""), a.source.name) }));

  // バケツごとにグループ化
  const buckets: Record<Bucket, typeof tagged> = { sports: [], tech: [], entertainment: [], lifestyle: [] };
  for (const item of tagged) {
    buckets[item.topic.bucket].push(item);
  }

  // 各バケツから1件ずつ選ぶ
  const selected: typeof tagged = [];
  const bucketOrder: Bucket[] = ["sports", "entertainment", "tech", "lifestyle"];

  for (const bucket of bucketOrder) {
    if (selected.length >= 4) break;
    if (buckets[bucket].length > 0) {
      selected.push(buckets[bucket][0]);
    }
  }

  // 4件に満たない場合、残りの記事で補完
  for (const item of tagged) {
    if (selected.length >= 4) break;
    if (!selected.includes(item)) selected.push(item);
  }

  const choices = selected.map(({ a, topic }) => {
    // トピックが汎用的な「気になる話題」の場合は、ソース名をsubtextにしてタイトルの断片をラベルにする試み
    let label = topic.label;
    if (topic.label === "気になる話題" && a.title) {
      // タイトルの最初の20文字程度を使用
      label = a.title.length > 20 ? a.title.slice(0, 17) + "..." : a.title;
    }

    if (a.urlToImage) {
      return { label, subtext: a.source.name, imageUrl: a.urlToImage };
    }
    return { label, subtext: a.source.name, emoji: topic.emoji, gradient: topic.gradient };
  });

  return { text: "今日、ちょっと気になるのはどれ？", choices };
}

// ================================================================
// Gemini API（本番用）
// ================================================================

async function generateWithGemini(articles: NewsArticle[]): Promise<QuestionSet> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const modelName = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";

  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(apiKey);

  // Gemini 2.0以降は JSON モードを明示的に指定可能
  const geminiModel = genAI.getGenerativeModel({ 
    model: modelName,
    generationConfig: {
      responseMimeType: "application/json",
    }
  });

  const result = await geminiModel.generateContent(buildPrompt(articles));
  const response = await result.response;
  const text = response.text();
  console.log(`[llm] Gemini response (${modelName}) length:`, text.length);

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
