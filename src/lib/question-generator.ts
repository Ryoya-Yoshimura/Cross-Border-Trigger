import { prisma } from "./prisma";
import { selectSourceType, type SourceType } from "./question-sources/selector";
import { generateEvergreen, type QuestionSet } from "./question-sources/evergreen";
import { generateTrend } from "./question-sources/trend";
import { generateNews } from "./question-sources/news";

const HARDCODED_FALLBACK: QuestionSet = {
  text: "今の気分に近いのはどれ？",
  choices: [
    { label: "のんびりモード", imageUrl: "https://picsum.photos/seed/fallback1/400/300" },
    { label: "やる気あり", imageUrl: "https://picsum.photos/seed/fallback2/400/300" },
    { label: "ぼーっとしてる", imageUrl: "https://picsum.photos/seed/fallback3/400/300" },
    { label: "ちょっと疲れ気味", imageUrl: "https://picsum.photos/seed/fallback4/400/300" },
  ],
};

type GeneratedQuestion = QuestionSet & { sourceType: SourceType };

async function generateWithFallback(
  sourceType: SourceType,
  date: string
): Promise<GeneratedQuestion> {
  if (sourceType === "news") {
    const q = await generateNews(date);
    if (q) return { ...q, sourceType: "news" };
    console.log("[generator] news failed, falling back to trend");
    sourceType = "trend";
  }

  if (sourceType === "trend") {
    try {
      const q = generateTrend(date);
      return { ...q, sourceType: "trend" };
    } catch (e) {
      console.warn("[generator] trend failed, falling back to evergreen:", e);
    }
  }

  try {
    const q = generateEvergreen(date);
    return { ...q, sourceType: "evergreen" };
  } catch (e) {
    console.warn("[generator] evergreen failed, using hardcoded fallback:", e);
    return { ...HARDCODED_FALLBACK, sourceType: "evergreen" };
  }
}

// バックグラウンド生成中の日付を管理
const generatingDates = new Set<string>();

/**
 * その日のニュースベース質問をDBから取得する。
 * - news ソースの質問があればそれを返す
 * - なければ（またはnews以外がキャッシュされていれば）null を返す
 */
export async function getOrCreateDailyQuestion(date: string) {
  const existing = await prisma.question.findUnique({ where: { date } });

  // newsソースの質問がキャッシュ済みならそのまま返す
  if (existing?.sourceType === "news") return existing;

  // news以外がキャッシュされていれば削除（古いevergreen等を一掃）
  if (existing) {
    await prisma.question.deleteMany({ where: { date } });
    console.log(`[generator] Deleted non-news cached question for ${date}, will regenerate`);
  }

  return null;
}

/**
 * バックグラウンドでニュース質問を生成してDBに保存する。
 * 同じ日付の生成が進行中なら何もしない。
 */
export function startBackgroundGeneration(date: string) {
  if (generatingDates.has(date)) return;
  generatingDates.add(date);

  const sourceType = selectSourceType(date);
  console.log(`[generator] Starting background generation for ${date} (source: ${sourceType})`);

  generateWithFallback(sourceType, date)
    .then((result) =>
      prisma.question.create({
        data: {
          date,
          sourceType: result.sourceType,
          text: result.text,
          choices: JSON.stringify(result.choices),
        },
      })
    )
    .then(() => console.log(`[generator] Background generation complete for ${date}`))
    .catch((e) => console.error("[generator] Background generation failed:", e))
    .finally(() => generatingDates.delete(date));
}

/**
 * 指定日付の質問が生成中かどうか。
 */
export function isGenerating(date: string) {
  return generatingDates.has(date);
}

/**
 * 開発・デバッグ用: その日の質問を強制再生成する。
 */
export async function regenerateDailyQuestion(date: string) {
  await prisma.question.deleteMany({ where: { date } });
  generatingDates.delete(date);
  startBackgroundGeneration(date);
}
