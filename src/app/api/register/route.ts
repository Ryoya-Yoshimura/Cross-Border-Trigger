import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

async function generateUniqueInviteCode(): Promise<string> {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (let attempt = 0; attempt < 10; attempt++) {
    const part = (n: number) =>
      Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    const code = `${part(4)}-${part(4)}`;
    
    const snapshot = await adminDb.collection("users").where("inviteCode", "==", code).get();
    if (snapshot.empty) return code;
  }
  return Math.random().toString(36).substring(2, 12).toUpperCase();
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const { uid, email } = decodedToken;

    const body = await req.json().catch(() => ({}));
    const { name } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
    }

    // すでに Firestore にユーザーがいるか確認
    const userDoc = await adminDb.collection("users").doc(uid).get();
    if (userDoc.exists) {
      return NextResponse.json({ error: "ユーザーは既に登録されています" }, { status: 400 });
    }

    const inviteCode = await generateUniqueInviteCode();

    const userData = {
      id: uid,
      name,
      email,
      inviteCode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await adminDb.collection("users").doc(uid).set(userData);

    return NextResponse.json({ user: userData }, { status: 201 });
  } catch (e) {
    console.error("[register]", e);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
