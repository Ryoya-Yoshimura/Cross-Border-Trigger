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

export async function GET(req: NextRequest) {
  const userToken = await getAuthenticatedUser(req);
  if (!userToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = userToken.uid;

  try {
    // 自分が参加している接続を取得
    // NOTE: userId1 または userId2 に自分が含まれるものを取得するために2回クエリが必要（Firestoreの制限）
    const q1 = adminDb.collection("connections").where("userId1", "==", userId).get();
    const q2 = adminDb.collection("connections").where("userId2", "==", userId).get();

    const [snap1, snap2] = await Promise.all([q1, q2]);
    const connectionDocs = [...snap1.docs, ...snap2.docs];

    const result = await Promise.all(
      connectionDocs.map(async (doc) => {
        const data = doc.data();
        const partnerId = data.userId1 === userId ? data.userId2 : data.userId1;
        
        // 相手のユーザー情報を取得
        const partnerDoc = await adminDb.collection("users").doc(partnerId).get();
        const partnerData = partnerDoc.data();

        // 最新のトリガーを取得
        const triggerSnap = await adminDb.collection("triggers")
          .where("connectionId", "==", doc.id)
          .orderBy("createdAt", "desc")
          .limit(1)
          .get();
        const latestTrigger = triggerSnap.empty ? null : { id: triggerSnap.docs[0].id, ...triggerSnap.docs[0].data() };

        // 直近の一致記録を取得 (MatchRecord)
        const matchSnap = await adminDb.collection("match_records")
          .where("connectionId", "==", doc.id)
          .orderBy("checkedAt", "desc")
          .limit(7)
          .get();
        const matchRecords = matchSnap.docs.map(d => d.data());

        const consecutiveMatches = countConsecutiveMatches(matchRecords);

        return {
          id: doc.id,
          partner: { id: partnerId, name: partnerData?.name ?? "Unknown" },
          latestTrigger,
          consecutiveMatches,
          matchCount: matchRecords.filter((m: any) => m.matched).length,
        };
      })
    );

    return NextResponse.json({ connections: result });
  } catch (e) {
    console.error("[GET /api/connections]", e);
    return NextResponse.json({ error: "Failed to fetch connections" }, { status: 500 });
  }
}

function countConsecutiveMatches(matchRecords: any[]) {
  let count = 0;
  for (const record of matchRecords) {
    if (record.matched) count++;
    else break;
  }
  return count;
}
