import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

async function getAuthenticatedUser(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  const userToken = await getAuthenticatedUser(req);
  if (!userToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { inviteCode } = await req.json();
  if (!inviteCode) {
    return NextResponse.json({ error: "招待コードが必要です" }, { status: 400 });
  }

  try {
    // 招待コードの相手を検索
    const userSnap = await adminDb.collection("users").where("inviteCode", "==", inviteCode).limit(1).get();
    if (userSnap.empty) {
      return NextResponse.json({ error: "招待コードが見つかりません" }, { status: 404 });
    }

    const targetUser = userSnap.docs[0].data();
    const targetUserId = userSnap.docs[0].id;

    if (targetUserId === userToken.uid) {
      return NextResponse.json({ error: "自分自身とはつながれません" }, { status: 400 });
    }

    // 既存の接続を確認
    const q1 = await adminDb.collection("connections")
      .where("userId1", "==", userToken.uid)
      .where("userId2", "==", targetUserId)
      .get();
    const q2 = await adminDb.collection("connections")
      .where("userId1", "==", targetUserId)
      .where("userId2", "==", userToken.uid)
      .get();

    if (!q1.empty || !q2.empty) {
      return NextResponse.json({ error: "すでにつながっています" }, { status: 400 });
    }

    const connectionData = {
      userId1: userToken.uid,
      userId2: targetUserId,
      createdAt: new Date().toISOString(),
    };

    const docRef = await adminDb.collection("connections").add(connectionData);

    return NextResponse.json({
      connection: {
        id: docRef.id,
        partner: { id: targetUserId, name: targetUser.name },
      },
    }, { status: 201 });
  } catch (e) {
    console.error("[POST /api/invite]", e);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
