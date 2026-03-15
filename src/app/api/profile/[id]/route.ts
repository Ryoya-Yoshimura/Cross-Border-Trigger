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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userToken = await getAuthenticatedUser(req);
  if (!userToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const userDoc = await adminDb.collection("users").doc(id).get();
    if (!userDoc.exists) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const userData = userDoc.data();
    const isOwn = id === userToken.uid;

    // 回答数
    const answerSnap = await adminDb.collection("answers").where("userId", "==", id).get();
    const answerCount = answerSnap.size;

    let matchCount = 0;
    if (!isOwn) {
      // 自分との一致数を取得
      // まず自分との接続IDを特定
      const q1 = await adminDb.collection("connections")
        .where("userId1", "==", userToken.uid)
        .where("userId2", "==", id)
        .get();
      const q2 = await adminDb.collection("connections")
        .where("userId1", "==", id)
        .where("userId2", "==", userToken.uid)
        .get();
      
      const connDoc = q1.docs[0] || q2.docs[0];
      if (connDoc) {
        const matchSnap = await adminDb.collection("match_records")
          .where("connectionId", "==", connDoc.id)
          .where("matched", "==", true)
          .get();
        matchCount = matchSnap.size;
      }
    }

    return NextResponse.json({
      user: {
        id,
        name: userData?.name,
        bio: userData?.bio,
        xUrl: userData?.xUrl,
        lineUrl: userData?.lineUrl,
        instagramUrl: userData?.instagramUrl,
        facebookUrl: userData?.facebookUrl,
        threadsUrl: userData?.threadsUrl,
        answerCount,
        matchCount,
      }
    });
  } catch (e) {
    console.error("[GET /api/profile/[id]]", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
