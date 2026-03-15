import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function getToday() {
  return process.env.DEBUG_DATE ?? new Date().toISOString().slice(0, 10);
}

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未認証" }, { status: 401 });
  }

  const today = getToday();
  const set = getDailySet(today);

  let question = await prisma.question.findUnique({ where: { date: today } });

  if (!question) {
    question = await prisma.question.create({
      data: {
        date: today,
        choices: JSON.stringify(set.choices),
      },
    });
  }

  const answer = await prisma.answer.findUnique({
    where: { userId_questionId: { userId: session.user.id, questionId: question.id } },
  });

  return NextResponse.json({
    question: {
      ...question,
      text: set.text,
      choices: JSON.parse(question.choices),
    },
    answered: answer ? answer.choiceIndex : null,
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未認証" }, { status: 401 });
  }

  const { questionId, choiceIndex } = await req.json();
  if (choiceIndex === undefined || choiceIndex < 0 || choiceIndex > 3) {
    return NextResponse.json({ error: "無効な回答" }, { status: 400 });
  }

  const existing = await prisma.answer.findUnique({
    where: { userId_questionId: { userId: session.user.id, questionId } },
  });
  if (existing) {
    return NextResponse.json({ error: "今日はすでに回答済みです" }, { status: 400 });
  }

  const answer = await prisma.answer.create({
    data: { userId: session.user.id, questionId, choiceIndex },
  });

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

      if (matched) {
        const { checkAndCreateTrigger } = await import("@/lib/match");
        await checkAndCreateTrigger(conn.id);
      }
    }
  }

  return NextResponse.json({ answer });
}

type QuestionSet = {
  text: string;
  choices: { label: string; imageUrl: string }[];
};

function getDailySet(date: string): QuestionSet {
  const SETS: QuestionSet[] = [
    {
      text: "今朝の気分、飲み物で表すと？",
      choices: [
        { label: "珈琲", imageUrl: "https://picsum.photos/seed/coffeecup/400/300" },
        { label: "紅茶", imageUrl: "https://picsum.photos/seed/greentea/400/300" },
        { label: "スムージー", imageUrl: "https://picsum.photos/seed/smoothiedrink/400/300" },
        { label: "お水だけ", imageUrl: "https://picsum.photos/seed/mineralwater/400/300" },
      ],
    },
    {
      text: "週末に行くなら、どの景色？",
      choices: [
        { label: "山", imageUrl: "https://picsum.photos/seed/mountainview/400/300" },
        { label: "海", imageUrl: "https://picsum.photos/seed/oceanbeach/400/300" },
        { label: "街の夜景", imageUrl: "https://picsum.photos/seed/citynightview/400/300" },
        { label: "森の小道", imageUrl: "https://picsum.photos/seed/forestpath/400/300" },
      ],
    },
    {
      text: "理想の休日の過ごし方は？",
      choices: [
        { label: "ひとりでゆっくり", imageUrl: "https://picsum.photos/seed/solorelax/400/300" },
        { label: "友達とわいわい", imageUrl: "https://picsum.photos/seed/friendsfun/400/300" },
        { label: "家族でのんびり", imageUrl: "https://picsum.photos/seed/familytime/400/300" },
        { label: "新しい場所を探索", imageUrl: "https://picsum.photos/seed/adventuretrip/400/300" },
      ],
    },
    {
      text: "リラックスするなら、どれ？",
      choices: [
        { label: "読書", imageUrl: "https://picsum.photos/seed/readingbook/400/300" },
        { label: "映画・ドラマ", imageUrl: "https://picsum.photos/seed/movienight/400/300" },
        { label: "音楽を聴く", imageUrl: "https://picsum.photos/seed/musicvibes/400/300" },
        { label: "アウトドア", imageUrl: "https://picsum.photos/seed/outdoorhike/400/300" },
      ],
    },
    {
      text: "今の気分、食べ物で表すと？",
      choices: [
        { label: "ラーメン", imageUrl: "https://picsum.photos/seed/ramenjapaness/400/300" },
        { label: "スイーツ", imageUrl: "https://picsum.photos/seed/dessertcake/400/300" },
        { label: "サラダ", imageUrl: "https://picsum.photos/seed/freshsalad/400/300" },
        { label: "焼肉", imageUrl: "https://picsum.photos/seed/grillbbq/400/300" },
      ],
    },
    {
      text: "今夜、したいことは？",
      choices: [
        { label: "ゆっくり入浴", imageUrl: "https://picsum.photos/seed/bathrelax/400/300" },
        { label: "夜ランニング", imageUrl: "https://picsum.photos/seed/runningnight/400/300" },
        { label: "ゲーム", imageUrl: "https://picsum.photos/seed/gamingsetup/400/300" },
        { label: "早めに就寝", imageUrl: "https://picsum.photos/seed/sleepcozy/400/300" },
      ],
    },
    {
      text: "旅行先に選ぶなら？",
      choices: [
        { label: "京都", imageUrl: "https://picsum.photos/seed/kyototemple/400/300" },
        { label: "沖縄", imageUrl: "https://picsum.photos/seed/okinawaocean/400/300" },
        { label: "北海道", imageUrl: "https://picsum.photos/seed/hokkaidosnow/400/300" },
        { label: "海外旅行", imageUrl: "https://picsum.photos/seed/worldtravel/400/300" },
      ],
    },
  ];

  const index = date.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % SETS.length;
  return SETS[index];
}
