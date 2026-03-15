import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 招待コードから招待者の情報を取得（認証不要）
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  const user = await prisma.user.findUnique({
    where: { inviteCode: code },
    select: { name: true },
  });

  if (!user) {
    return NextResponse.json({ error: "招待コードが見つかりません" }, { status: 404 });
  }

  return NextResponse.json({ name: user.name });
}
