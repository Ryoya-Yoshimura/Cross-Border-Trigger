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
  // 芸能・エンタメ
  "movie", "film", "music", "album", "concert", "award", "actor", "actress",
  "singer", "artist", "show", "series", "debut", "release", "performance",
  "comedy", "dance", "festival", "star", "celebrity",
  // 明るい話題全般
  "new", "launch", "opens", "celebrate", "achievement", "success",
  "community", "volunteers", "rescue", "animals", "kids", "children",
  "school", "innovation", "trend", "popular", "fun", "enjoy", "amazing",
];

// 除外するキーワード（暗い・重いニュース）
const NEGATIVE_KEYWORDS = [
  "killed", "died", "death", "murder", "crash", "explosion",
  "war", "attack", "shooting", "arrested", "trial", "lawsuit",
  "abuse", "violence", "disaster", "flood", "earthquake",
  "recession", "bankrupt", "scandal", "controversy",
];

// APIキー未設定時のサンプルニュース（スポーツ・芸能系）
const SAMPLE_NEWS: NewsArticle[] = [
  {
    title: "Local baseball team wins regional championship in dramatic final",
    description: "The city's beloved baseball team clinched the regional title with a walkoff home run, sending thousands of fans into celebration.",
    url: "https://example.com/news/1",
    urlToImage: null,
    publishedAt: new Date().toISOString(),
    source: { name: "Sports Daily" },
  },
  {
    title: "Popular singer announces surprise new album dropping this week",
    description: "The chart-topping artist revealed an unexpected album release on social media, with fans flooding comments with excitement.",
    url: "https://example.com/news/2",
    urlToImage: null,
    publishedAt: new Date().toISOString(),
    source: { name: "Music News" },
  },
  {
    title: "New café trend: themed bookstore cafés are popping up everywhere",
    description: "A new wave of cozy bookstore cafés where visitors can read freely while enjoying specialty coffee is sweeping across major cities.",
    url: "https://example.com/news/3",
    urlToImage: null,
    publishedAt: new Date().toISOString(),
    source: { name: "Lifestyle Weekly" },
  },
  {
    title: "Award-winning film director announces highly anticipated next project",
    description: "The acclaimed filmmaker shared details of their next movie, already generating buzz for its unique storyline and star-studded cast.",
    url: "https://example.com/news/4",
    urlToImage: null,
    publishedAt: new Date().toISOString(),
    source: { name: "Entertainment Today" },
  },
];

function getPreviousDate(date: string): string {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function isBrightNews(article: NewsArticle): boolean {
  const text = `${article.title} ${article.description ?? ""}`.toLowerCase();
  const hasPositive = POSITIVE_KEYWORDS.some((kw) => text.includes(kw));
  const hasNegative = NEGATIVE_KEYWORDS.some((kw) => text.includes(kw));
  return hasPositive && !hasNegative;
}

/**
 * 昨日のニュースを取得する。
 * NEWS_API_KEY 未設定時はサンプルデータを返す。
 */
export async function fetchYesterdayNews(date: string): Promise<NewsArticle[]> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    console.log("[news-api] NEWS_API_KEY not set, using sample data");
    return SAMPLE_NEWS;
  }

  const yesterday = getPreviousDate(date);
  // スポーツ・芸能・エンタメ・ライフスタイルを幅広くカバー
  const query = "sports+music+movie+entertainment+celebrity+festival+win+championship";
  const url =
    `https://newsapi.org/v2/everything?q=${query}` +
    `&from=${yesterday}&to=${yesterday}` +
    `&sortBy=popularity&language=en&pageSize=40&apiKey=${apiKey}`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      console.warn("[news-api] API returned", res.status, "- using sample data");
      return SAMPLE_NEWS;
    }
    const data = await res.json();
    return (data.articles ?? []) as NewsArticle[];
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
