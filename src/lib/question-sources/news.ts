import type { QuestionSet } from "./evergreen";
import { fetchYesterdayNews, selectHeartwarmingNews } from "../services/news-api";
import { generateQuestionFromNews } from "../services/llm";

/**
 * ニュースベースの質問を生成する。
 * 失敗時は null を返し、上位でフォールバックする。
 */
export async function generateNews(date: string): Promise<QuestionSet | null> {
  try {
    const articles = await fetchYesterdayNews(date);
    const selected = selectHeartwarmingNews(articles);
    const question = await generateQuestionFromNews(selected);
    return question;
  } catch (e) {
    console.warn("[news-source] Failed to generate news question:", e);
    return null;
  }
}
