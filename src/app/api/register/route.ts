import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

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
    const { name, email, password, inviteCode } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "このメールアドレスは既に使われています" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newInviteCode = await generateUniqueInviteCode();

    // トランザクションでユーザー作成と招待接続を同時実行
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { name, email, passwordHash, inviteCode: newInviteCode },
      });

      // 招待コードがあれば接続を作成
      if (inviteCode) {
        const inviter = await tx.user.findUnique({ where: { inviteCode } });
        if (inviter && inviter.id !== newUser.id) {
          // 重複チェック
          const existingConn = await tx.connection.findFirst({
            where: {
              OR: [
                { userId1: newUser.id, userId2: inviter.id },
                { userId1: inviter.id, userId2: newUser.id },
              ],
            },
          });

          if (!existingConn) {
            await tx.connection.create({
              data: {
                userId1: newUser.id,
                userId2: inviter.id,
              },
            });
            console.log(`[register] Automatic connection created between ${newUser.id} and ${inviter.id}`);
          }
        }
      }

      return newUser;
    });

    if (inviteCode) {
      revalidatePath("/connections");
      revalidatePath("/home");
    }

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, inviteCode: user.inviteCode },
    }, { status: 201 });
  } catch (e) {
    console.error("[register]", e);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}

