import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkAndCreateTrigger } from "@/lib/match";
import { getOrCreateDailyQuestion, startBackgroundGeneration, isGenerating, regenerateDailyQuestion } from "@/lib/question-generator";
import { revalidatePath } from "next/cache";

function getToday() {
  return process.env.DEBUG_DATE ?? new Date().toISOString().slice(0, 10);
}

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未認証" }, { status: 401 });
  }

  try {
    const today = getToday();
    const question = await getOrCreateDailyQuestion(today);

    // 質問が未生成の場合はバックグラウンド生成を開始してgenerating状態を返す
    if (!question) {
      startBackgroundGeneration(today);
      return NextResponse.json({ question: null, generating: true, answered: null });
    }

    const answer = await prisma.answer.findUnique({
      where: { userId_questionId: { userId: session.user.id, questionId: question.id } },
    });

    return NextResponse.json({
      question: {
        id: question.id,
        date: question.date,
        sourceType: question.sourceType,
        text: question.text,
        choices: JSON.parse(question.choices),
      },
      generating: isGenerating(today),
      answered: answer ? answer.choiceIndex : null,
    });
  } catch (e) {
    console.error("[GET /api/questions]", e);
    return NextResponse.json({ error: "質問の取得に失敗しました" }, { status: 500 });
  }
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

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: "セッションが無効です。ログインし直してください。" }, { status: 401 });
  }

  const question = await prisma.question.findUnique({ where: { id: questionId } });
  if (!question) {
    return NextResponse.json({ error: "質問が見つかりません。ページを再読み込みしてください。" }, { status: 404 });
  }

  const existing = await prisma.answer.findUnique({
    where: { userId_questionId: { userId: session.user.id, questionId } },
  });
  if (existing) {
    return NextResponse.json({ error: "今日はすでに回答済みです" }, { status: 400 });
  }

  try {
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
          await checkAndCreateTrigger(conn.id);
        }
      }
    }

    revalidatePath("/home");
    revalidatePath("/connections");
    revalidatePath("/(app)/connections", "layout");
    revalidatePath("/profile/" + session.user.id);

    return NextResponse.json({ answer });
  } catch (e) {
    console.error("[POST /api/questions]", e);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}


// 開発用: その日の質問を強制再生成する
// POST /api/questions/regenerate 相当の機能を DELETE で提供
export async function DELETE(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未認証" }, { status: 401 });
  }

  // 開発環境のみ許可
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const today = getToday();
  await regenerateDailyQuestion(today);
  return NextResponse.json({ message: "バックグラウンドで再生成を開始しました" });
}
