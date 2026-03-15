import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// 自分のConnectionリストを取得
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未認証" }, { status: 401 });
  }

  const userId = session.user.id;

  const connections = await prisma.connection.findMany({
    where: {
      OR: [{ userId1: userId }, { userId2: userId }],
    },
    include: {
      user1: { select: { id: true, name: true, inviteCode: true } },
      user2: { select: { id: true, name: true, inviteCode: true } },
      triggers: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      matchRecords: {
        orderBy: { checkedAt: "desc" },
        take: 7,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const result = connections.map((conn) => {
    const partner = conn.userId1 === userId ? conn.user2 : conn.user1;
    const consecutiveMatches = countConsecutiveMatches(conn.matchRecords);
    return {
      id: conn.id,
      partner: { id: partner.id, name: partner.name },
      latestTrigger: conn.triggers[0] ?? null,
      consecutiveMatches,
      matchCount: conn.matchRecords.filter((m) => m.matched).length,
    };
  });

  return NextResponse.json({ connections: result });
}

function countConsecutiveMatches(matchRecords: { matched: boolean }[]) {
  let count = 0;
  for (const record of matchRecords) {
    if (record.matched) count++;
    else break;
  }
  return count;
}
