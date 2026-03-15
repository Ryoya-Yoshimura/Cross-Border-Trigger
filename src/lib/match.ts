import { prisma } from "./prisma";

export async function checkAndCreateTrigger(connectionId: string) {
  // 直近4件のMatchRecordを取得（Questionも含む）
  const recentMatches = await prisma.matchRecord.findMany({
    where: { connectionId },
    orderBy: { checkedAt: "desc" },
    take: 4,
    include: { question: true },
  });

  if (recentMatches.length < 4) return null;

  // 4件すべてがmatchedかチェック
  const allMatched = recentMatches.every((m) => m.matched);
  if (!allMatched) return null;

  // 日付が連続しているか確認（ギャップがあると誤発火するため）
  // recentMatches は checkedAt desc 順なので dates[0] が最新
  const dates = recentMatches.map((m) => m.question.date).sort().reverse();
  for (let i = 0; i < dates.length - 1; i++) {
    const current = new Date(dates[i]);
    const next = new Date(dates[i + 1]);
    const diffDays = Math.round((current.getTime() - next.getTime()) / 86400000);
    if (diffDays !== 1) return null; // 連続していない日付がある
  }

  // 重複チェック：4件のうち最も古い質問日以降にトリガーが存在するか
  // checkedAt（処理タイミング）ではなく question.date（安定した日付文字列）基準にすることで
  // 同じ4日間ウィンドウに対して複数回トリガーが発火するのを防ぐ
  const oldestQuestionDate = recentMatches[recentMatches.length - 1].question.date;
  const existingTrigger = await prisma.trigger.findFirst({
    where: { connectionId, createdAt: { gte: new Date(oldestQuestionDate) } },
  });
  if (existingTrigger) return null;

  // 接続情報（ユーザーID取得用）
  const connection = await prisma.connection.findUnique({ where: { id: connectionId } });
  if (!connection) return null;

  // 一致した選択肢のラベルを取得してコンテキストメッセージを生成
  const matchedLabels: string[] = [];
  for (const record of recentMatches) {
    const answer = await prisma.answer.findFirst({
      where: { questionId: record.questionId, userId: connection.userId1 },
    });
    if (answer) {
      const choices = JSON.parse(record.question.choices) as { label: string; imageUrl: string }[];
      const label = choices[answer.choiceIndex]?.label;
      if (label) matchedLabels.push(label);
    }
  }

  const message = buildTriggerMessage(matchedLabels);
  const trigger = await prisma.trigger.create({
    data: { connectionId, message },
  });

  return trigger;
}

function buildTriggerMessage(labels: string[]): string {
  if (labels.length === 0) {
    return "4日連続で選択が一致しました！久しぶりに話しかけてみませんか？";
  }

  const labelStr = labels.map((l) => `「${l}」`).join("・");

  const TEMPLATES = [
    `${labelStr}など4日連続で一致！共通点がありそうです。久しぶりに話しかけてみては？`,
    `4日連続で${labelStr}などが一致しました。趣味や感覚が合うかもしれません！`,
    `${labelStr}の選択が続けて一致しています。連絡するきっかけにどうぞ。`,
    `${labelStr}が一致！もしかして気が合う？ひさしぶりにメッセージを送ってみましょう。`,
  ];

  return TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
}
