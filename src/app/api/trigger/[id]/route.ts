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
    const triggerDoc = await adminDb.collection("triggers").doc(id).get();
    if (!triggerDoc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const triggerData = triggerDoc.data();
    const connectionId = triggerData?.connectionId;

    const connectionDoc = await adminDb.collection("connections").doc(connectionId).get();
    if (!connectionDoc.exists) return NextResponse.json({ error: "Connection not found" }, { status: 404 });

    const connData = connectionDoc.data();
    const userId = userToken.uid;
    if (connData?.userId1 !== userId && connData?.userId2 !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const partnerId = connData.userId1 === userId ? connData.userId2 : connData.userId1;
    const partnerDoc = await adminDb.collection("users").doc(partnerId).get();
    const partnerData = partnerDoc.data();

    // 既読に更新
    if (!triggerData?.isViewed) {
      await adminDb.collection("triggers").doc(id).update({ isViewed: true });
    }

    // 一致の証拠 (直近4件)
    const matchSnap = await adminDb.collection("match_records")
      .where("connectionId", "==", connectionId)
      .where("matched", "==", true)
      .orderBy("checkedAt", "desc")
      .limit(4)
      .get();

    const matchContext = await Promise.all(
      matchSnap.docs.map(async (doc) => {
        const record = doc.data();
        const questionId = record.questionId;
        
        // 質問データを取得してラベルを特定
        const questionDoc = await adminDb.collection("questions").doc(questionId).get();
        const questionData = questionDoc.data();
        const choices = typeof questionData?.choices === 'string' ? JSON.parse(questionData.choices) : questionData?.choices;

        // 自分の回答を取得
        const answerId = `${userId}_${questionId}`;
        const answerDoc = await adminDb.collection("answers").doc(answerId).get();
        const choiceIndex = answerDoc.data()?.choiceIndex;
        const label = choiceIndex !== undefined ? (choices[choiceIndex]?.label ?? "不明") : "不明";

        return {
          date: questionId, // YYYY-MM-DD
          label,
        };
      })
    );

    return NextResponse.json({
      trigger: {
        id: triggerDoc.id,
        message: triggerData?.message,
        partnerId,
        partnerName: partnerData?.name ?? "Unknown",
        createdAt: triggerData?.createdAt,
        matchContext,
      },
    });
  } catch (e) {
    console.error("[GET /api/trigger/[id]]", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
