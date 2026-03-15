import { adminDb } from "./firebase-admin";

export async function checkAndCreateTrigger(connectionId: string) {
  // 直近4件のMatchRecordを取得
  const matchSnap = await adminDb.collection("match_records")
    .where("connectionId", "==", connectionId)
    .orderBy("checkedAt", "desc")
    .limit(4)
    .get();

  if (matchSnap.size < 4) return null;

  const recentMatches = matchSnap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));

  // 4件すべてがmatchedかチェック
  const allMatched = recentMatches.every((m) => m.matched);
  if (!allMatched) return null;

  // 日付が連続しているか確認
  // questionId が "YYYY-MM-DD" 形式であることを前提とする
  const dates = recentMatches.map((m) => m.questionId).sort().reverse();
  for (let i = 0; i < dates.length - 1; i++) {
    const current = new Date(dates[i]);
    const next = new Date(dates[i + 1]);
    const diffDays = Math.round((current.getTime() - next.getTime()) / 86400000);
    if (diffDays !== 1) return null; // 連続していない日付がある
  }

  // 重複チェック
  const oldestQuestionDate = dates[dates.length - 1];
  const existingTriggerSnap = await adminDb.collection("triggers")
    .where("connectionId", "==", connectionId)
    .where("createdAt", ">=", oldestQuestionDate)
    .limit(1)
    .get();
  
  if (!existingTriggerSnap.empty) return null;

  // 接続情報
  const connectionDoc = await adminDb.collection("connections").doc(connectionId).get();
  if (!connectionDoc.exists) return null;
  const connection = connectionDoc.data();

  // 一致した選択肢のラベルを取得
  const matchedLabels: string[] = [];
  for (const record of recentMatches) {
    const questionDoc = await adminDb.collection("questions").doc(record.questionId).get();
    const questionData = questionDoc.data();
    if (!questionData) continue;

    const answerId = `${connection?.userId1}_${record.questionId}`;
    const answerDoc = await adminDb.collection("answers").doc(answerId).get();
    const answerData = answerDoc.data();

    if (answerData) {
      const choices = typeof questionData.choices === 'string' ? JSON.parse(questionData.choices) : questionData.choices;
      const label = choices[answerData.choiceIndex]?.label;
      if (label) matchedLabels.push(label);
    }
  }

  const message = buildTriggerMessage(matchedLabels);
  const triggerData = {
    connectionId,
    message,
    isViewed: false,
    createdAt: new Date().toISOString(),
  };

  const triggerRef = await adminDb.collection("triggers").add(triggerData);

  return { id: triggerRef.id, ...triggerData };
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
