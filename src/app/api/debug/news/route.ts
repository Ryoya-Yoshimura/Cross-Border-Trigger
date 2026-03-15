import { NextRequest, NextResponse } from "next/server";
import { fetchYesterdayNews, selectHeartwarmingNews } from "@/lib/services/news-api";
import { generateQuestionFromNews } from "@/lib/services/llm";
import { selectSourceType } from "@/lib/question-sources/selector";

// 開発環境のみ有効
function guardDev() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "dev only" }, { status: 403 });
  }
  return null;
}

function getDate(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  return (
    searchParams.get("date") ??
    process.env.DEBUG_DATE ??
    new Date().toISOString().slice(0, 10)
  );
}

/**
 * GET /api/debug/news
 *   → その日のニュース取得〜質問生成の全ステップを返す（DBには保存しない）
 *
 * GET /api/debug/news?date=2026-03-10
 *   → 指定日付で実行
 *
 * GET /api/debug/news?step=fetch
 *   → fetch のみ（フィルタ前の生ニュース一覧）
 *
 * GET /api/debug/news?step=filter
 *   → fetch + ほのぼのフィルタ後のニュース一覧
 *
 * GET /api/debug/news?step=generate
 *   → fetch + filter + LLM質問生成まで（デフォルト）
 */
export async function GET(req: NextRequest) {
  const guard = guardDev();
  if (guard) return guard;

  const date = getDate(req);
  const { searchParams } = new URL(req.url);
  const step = searchParams.get("step") ?? "generate";

  const sourceType = selectSourceType(date);

  // Step 1: ニュース取得
  const allArticles = await fetchYesterdayNews(date);

  if (step === "fetch") {
    return NextResponse.json({
      date,
      sourceType,
      step: "fetch",
      count: allArticles.length,
      articles: allArticles.map((a) => ({
        title: a.title,
        description: a.description,
        urlToImage: a.urlToImage,
        source: a.source.name,
        publishedAt: a.publishedAt,
      })),
    });
  }

  // Step 2: ほのぼのフィルタ
  const selected = selectHeartwarmingNews(allArticles);

  if (step === "filter") {
    return NextResponse.json({
      date,
      sourceType,
      step: "filter",
      totalFetched: allArticles.length,
      selectedCount: selected.length,
      selected: selected.map((a) => ({
        title: a.title,
        description: a.description,
        urlToImage: a.urlToImage,
        source: a.source.name,
      })),
    });
  }

  // Step 3: LLM質問生成
  const question = await generateQuestionFromNews(selected);

  return NextResponse.json({
    date,
    sourceType,
    step: "generate",
    totalFetched: allArticles.length,
    selectedCount: selected.length,
    selected: selected.map((a) => ({
      title: a.title,
      urlToImage: a.urlToImage,
      source: a.source.name,
    })),
    generated: {
      text: question.text,
      choices: question.choices,
    },
    note: "DBには保存していません。保存するには DELETE /api/questions を実行してください。",
  });
}
