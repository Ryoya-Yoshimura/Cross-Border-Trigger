import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// 今日の問題を取得（なければシード）
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未認証" }, { status: 401 });
  }

  const today = new Date().toISOString().slice(0, 10);

  let question = await prisma.question.findUnique({ where: { date: today } });

  if (!question) {
    // 当日の問題がなければダミーを生成
    question = await prisma.question.create({
      data: {
        date: today,
        choices: JSON.stringify(getDailyChoices(today)),
      },
    });
  }

  // 今日すでに回答済みか確認
  const answer = await prisma.answer.findUnique({
    where: { userId_questionId: { userId: session.user.id, questionId: question.id } },
  });

  return NextResponse.json({
    question: {
      ...question,
      choices: JSON.parse(question.choices),
    },
    answered: answer ? answer.choiceIndex : null,
  });
}

// 今日の問題に回答
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未認証" }, { status: 401 });
  }

  const { questionId, choiceIndex } = await req.json();
  if (choiceIndex === undefined || choiceIndex < 0 || choiceIndex > 3) {
    return NextResponse.json({ error: "無効な回答" }, { status: 400 });
  }

  // 既存の回答チェック
  const existing = await prisma.answer.findUnique({
    where: { userId_questionId: { userId: session.user.id, questionId } },
  });
  if (existing) {
    return NextResponse.json({ error: "今日はすでに回答済みです" }, { status: 400 });
  }

  const answer = await prisma.answer.create({
    data: { userId: session.user.id, questionId, choiceIndex },
  });

  // 接続相手のすべてのConnectionでマッチング確認
  const connections = await prisma.connection.findMany({
    where: {
      OR: [{ userId1: session.user.id }, { userId2: session.user.id }],
    },
  });

  for (const conn of connections) {
    const partnerId = conn.userId1 === session.user.id ? conn.userId2 : conn.userId1;
    const partnerAnswer = await prisma.answer.findUnique({
      where: { userId_questionId: { userId: partnerId, questionId } },
    });

    if (partnerAnswer) {
      const matched = partnerAnswer.choiceIndex === choiceIndex;
      await prisma.matchRecord.upsert({
        where: { connectionId_questionId: { connectionId: conn.id, questionId } },
        create: { connectionId: conn.id, questionId, matched },
        update: { matched },
      });

      // トリガー判定
      if (matched) {
        const { checkAndCreateTrigger } = await import("@/lib/match");
        await checkAndCreateTrigger(conn.id);
      }
    }
  }

  return NextResponse.json({ answer });
}

// 日付ベースのダミー問題セット
function getDailyChoices(date: string) {
  const sets = [
    [
      { label: "朝の珈琲", imageUrl: "/images/coffee.jpg" },
      { label: "朝の紅茶", imageUrl: "/images/tea.jpg" },
      { label: "朝のスムージー", imageUrl: "/images/smoothie.jpg" },
      { label: "朝は何も飲まない", imageUrl: "/images/nothing.jpg" },
    ],
    [
      { label: "山の景色", imageUrl: "/images/mountain.jpg" },
      { label: "海の景色", imageUrl: "/images/ocean.jpg" },
      { label: "街の夜景", imageUrl: "/images/city.jpg" },
      { label: "森の小道", imageUrl: "/images/forest.jpg" },
    ],
    [
      { label: "ひとりで過ごす休日", imageUrl: "/images/solo.jpg" },
      { label: "友達とわいわい", imageUrl: "/images/friends.jpg" },
      { label: "家族でゆっくり", imageUrl: "/images/family.jpg" },
      { label: "新しい場所を探索", imageUrl: "/images/explore.jpg" },
    ],
    [
      { label: "読書", imageUrl: "/images/book.jpg" },
      { label: "映画・ドラマ", imageUrl: "/images/movie.jpg" },
      { label: "音楽", imageUrl: "/images/music.jpg" },
      { label: "アウトドア", imageUrl: "/images/outdoor.jpg" },
    ],
  ];
  const index = date.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % sets.length;
  return sets[index];
}
