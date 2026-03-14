import { prisma } from "./prisma";

const RECONNECT_MESSAGES = [
  "最近よく考えが合いそうです！久しぶりに話しかけてみませんか？",
  "最近、趣味や感覚が似ているかもしれません。また連絡してみませんか？",
  "4日連続で選択が一致しました！話が合いそうですよ。",
  "以前より共通点が増えているかもしれません。久しぶりにメッセージを送ってみては？",
];

export async function checkAndCreateTrigger(connectionId: string) {
  // 直近4件のMatchRecordを取得
  const recentMatches = await prisma.matchRecord.findMany({
    where: { connectionId },
    orderBy: { checkedAt: "desc" },
    take: 4,
  });

  if (recentMatches.length < 4) return null;

  // 4件すべてがmatchedかチェック
  const allMatched = recentMatches.every((m) => m.matched);
  if (!allMatched) return null;

  // 既にトリガーが存在するか確認（最新の4件一致後に作成済みか）
  const lastMatchDate = recentMatches[0].checkedAt;
  const existingTrigger = await prisma.trigger.findFirst({
    where: {
      connectionId,
      createdAt: { gte: lastMatchDate },
    },
  });
  if (existingTrigger) return null;

  // トリガー生成
  const message =
    RECONNECT_MESSAGES[Math.floor(Math.random() * RECONNECT_MESSAGES.length)];
  const trigger = await prisma.trigger.create({
    data: { connectionId, message },
  });

  return trigger;
}
