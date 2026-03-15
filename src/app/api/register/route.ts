import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// 例: "A3K9-Z2MX" 形式の短い招待コード
async function generateUniqueInviteCode(): Promise<string> {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 紛らわしい文字(O,0,I,1)を除外
  for (let attempt = 0; attempt < 10; attempt++) {
    const part = (n: number) =>
      Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    const code = `${part(4)}-${part(4)}`;
    const existing = await prisma.user.findUnique({ where: { inviteCode: code } });
    if (!existing) return code;
  }
  return Math.random().toString(36).substring(2, 12).toUpperCase();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "このメールアドレスは既に使われています" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const inviteCode = await generateUniqueInviteCode();

    const user = await prisma.user.create({
      data: { name, email, passwordHash, inviteCode },
      select: { id: true, name: true, email: true, inviteCode: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (e) {
    console.error("[register]", e);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
