export type SourceType = "evergreen" | "trend" | "news";

// 出題比率（合計100）- 将来ここを調整する
export const SOURCE_WEIGHTS: Record<SourceType, number> = {
  news: 100,
  trend: 0,
  evergreen: 0,
};

/**
 * 日付文字列のハッシュ値から出題ソースを決定する。
 * 同じ日付なら必ず同じ結果になる。
 */
export function selectSourceType(_date: string): SourceType {
  return "news";
}
