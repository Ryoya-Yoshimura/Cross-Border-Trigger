import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: NextRequest,
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
  }

  return NextResponse.json({
    trigger: {
      id: trigger.id,
      message: trigger.message,
      partnerName: partner.name,
      createdAt: trigger.createdAt.toISOString(),
    },
  });
}
