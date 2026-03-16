export type NewsArticle = {
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: { name: string };
};

// 明るい話題を示すキーワード（スポーツ・芸能・エンタメ・生活系を広くカバー）
const POSITIVE_KEYWORDS = [
  // スポーツ
  "win", "wins", "won", "victory", "champion", "championship", "record",
  "baseball", "soccer", "football", "basketball", "tennis", "golf",
  "olympic", "tournament", "league", "team", "player", "coach", "score",
  "goal", "home run", "medal",
  "優勝", "勝利", "完封", "ホームラン", "メダル", "記録更新", "新記録",
  // 芸能・エンタメ
  "movie", "film", "music", "album", "concert", "award", "actor", "actress",
  "singer", "artist", "show", "series", "debut", "release", "performance",
  "comedy", "dance", "festival", "star", "celebrity",
  "映画", "ドラマ", "公開", "発売", "デビュー", "コンサート", "ライブ", "主演",
  // 明るい話題全般
  "new", "launch", "opens", "celebrate", "achievement", "success",
  "community", "volunteers", "rescue", "animals", "kids", "children",
  "school", "innovation", "trend", "popular", "fun", "enjoy", "amazing",
  "最新", "話題", "人気", "トレンド", "オープン", "開催", "成功", "癒やし",
];

// 除外するキーワード（暗い・重いニュース）
const NEGATIVE_KEYWORDS = [
  "killed", "died", "death", "murder", "crash", "explosion",
  "war", "attack", "shooting", "arrested", "trial", "lawsuit",
  "abuse", "violence", "disaster", "flood", "earthquake",
  "recession", "bankrupt", "scandal", "controversy",
  "死亡", "殺人", "逮捕", "事故", "衝突", "戦争", "攻撃", "訴訟", "不倫", "謝罪",
];

// ... (SAMPLE_NEWS unchanged) ...

function isBrightNews(article: NewsArticle): boolean {
  const text = `${article.title} ${article.description ?? ""}`.toLowerCase();
  const hasPositive = POSITIVE_KEYWORDS.some((kw) => text.includes(kw));
  const hasNegative = NEGATIVE_KEYWORDS.some((kw) => text.includes(kw));
  return hasPositive && !hasNegative;
}

/**
 * 昨日のニュースを取得する。
 */
export async function fetchYesterdayNews(_date: string): Promise<NewsArticle[]> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    console.log("[news-api] NEWS_API_KEY not set, using sample data");
    return SAMPLE_NEWS;
  }

  // top-headlines
  // デフォルトは language=en だが、日本のニュースも取得するように country=jp を試みる
  const url =
    `https://newsapi.org/v2/top-headlines?` +
    `country=${process.env.NEWS_COUNTRY || "jp"}&pageSize=40&apiKey=${apiKey}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();
    if (!res.ok || data.status === "error") {
      console.warn("[news-api] API error:", data.code, data.message, "- trying English fallback");
      const fallbackUrl = `https://newsapi.org/v2/top-headlines?language=en&pageSize=40&apiKey=${apiKey}`;
      const fallbackRes = await fetch(fallbackUrl, { cache: "no-store" });
      const fallbackData = await fallbackRes.json();
      if (!fallbackRes.ok || fallbackData.status === "error") {
        return SAMPLE_NEWS;
      }
      return (fallbackData.articles ?? []) as NewsArticle[];
    }
    const articles = (data.articles ?? []) as NewsArticle[];
    console.log(`[news-api] Fetched ${articles.length} articles from top-headlines`);
    return articles;
  } catch (e) {
    console.warn("[news-api] Fetch failed:", e);
    return SAMPLE_NEWS;
  }
}


/**
 * 明るいニュースを最大4件選ぶ。4件未満の場合はサンプルで補完する。
 */
export function selectHeartwarmingNews(articles: NewsArticle[]): NewsArticle[] {
  const filtered = articles.filter(isBrightNews).slice(0, 4);
  if (filtered.length < 4) {
    const needed = 4 - filtered.length;
    const supplement = SAMPLE_NEWS.slice(0, needed);
    return [...filtered, ...supplement];
  }
  return filtered;
}
