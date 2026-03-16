import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未認証" }, { status: 401 });
  }

  const trigger = await prisma.trigger.findUnique({
    where: { id },
    include: {
      connection: {
        include: {
          user1: { select: { id: true, name: true } },
          user2: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!trigger) {
    return NextResponse.json({ error: "見つかりません" }, { status: 404 });
  }

  const conn = trigger.connection;
  const userId = session.user.id;
  if (conn.userId1 !== userId && conn.userId2 !== userId) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const partner = conn.userId1 === userId ? conn.user2 : conn.user1;

  // 既読に更新
  if (!trigger.isViewed) {
    await prisma.trigger.update({ where: { id }, data: { isViewed: true } });
    revalidatePath("/home");
  }

  // 一致の証拠（直近4件の一致記録 + 選んだ選択肢ラベル）

  const matchRecords = await prisma.matchRecord.findMany({
    where: { connectionId: trigger.connectionId, matched: true },
    orderBy: { checkedAt: "desc" },
    take: 4,
    include: { question: true },
  });

  const matchContext = await Promise.all(
    matchRecords.map(async (record) => {
      // どちらのユーザーの回答でも同じ選択肢なので、自分のものを取得
      const answer = await prisma.answer.findFirst({
        where: { questionId: record.questionId, userId },
      });
      const choices = JSON.parse(record.question.choices) as { label: string; imageUrl: string }[];
      const label = answer ? (choices[answer.choiceIndex]?.label ?? "不明") : "不明";
      return {
        date: record.question.date,
        label,
      };
    })
  );

  return NextResponse.json({
    trigger: {
      id: trigger.id,
      message: trigger.message,
      partnerId: partner.id,
      partnerName: partner.name,
      createdAt: trigger.createdAt.toISOString(),
      matchContext,
    },
  });
}
