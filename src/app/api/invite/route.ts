import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// 招待コードでつながる
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未認証" }, { status: 401 });
  }

  const { inviteCode } = await req.json();
  if (!inviteCode) {
    return NextResponse.json({ error: "招待コードが必要です" }, { status: 400 });
  }

  // 招待コードの相手を検索
  const targetUser = await prisma.user.findUnique({ where: { inviteCode } });
  if (!targetUser) {
    return NextResponse.json({ error: "招待コードが見つかりません" }, { status: 404 });
  }

  if (targetUser.id === session.user.id) {
    return NextResponse.json({ error: "自分自身とはつながれません" }, { status: 400 });
  }

  // 既存のConnectionを確認
  const existing = await prisma.connection.findFirst({
    where: {
      OR: [
        { userId1: session.user.id, userId2: targetUser.id },
        { userId1: targetUser.id, userId2: session.user.id },
      ],
    },
  });

  if (existing) {
    return NextResponse.json({ error: "すでにつながっています" }, { status: 400 });
  }

  const connection = await prisma.connection.create({
    data: {
      userId1: session.user.id,
      userId2: targetUser.id,
    },
    include: {
      user2: { select: { id: true, name: true } },
    },
  });

  revalidatePath("/connections");
  revalidatePath("/home");

  return NextResponse.json({
    connection: {
      id: connection.id,
      partner: { id: connection.user2.id, name: connection.user2.name },
    },
  }, { status: 201 });
}

