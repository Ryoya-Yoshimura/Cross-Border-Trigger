import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { checkAndCreateTrigger } from "@/lib/match";
import { getOrCreateDailyQuestion, startBackgroundGeneration, isGenerating, regenerateDailyQuestion } from "@/lib/question-generator";

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

function getToday() {
  return process.env.DEBUG_DATE ?? new Date().toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  // GitHub Actions 等からの自動実行用チェック
  const authHeader = req.headers.get("Authorization");
  const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;

  const userToken = !isCron ? await getAuthenticatedUser(req) : null;
  
  if (!isCron && !userToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = getToday();
    
    // 1. 今日の質問を取得（または生成開始）
    const question = (await getOrCreateDailyQuestion(today)) as any;
    
    if (!question) {
      startBackgroundGeneration(today);
      return NextResponse.json({ question: null, generating: true, answered: null });
    }

    // Cron実行の場合はここで終了（生成を確認・開始するのが目的なので）
    if (isCron) {
      return NextResponse.json({ message: "Question already exists or generation started" });
    }

    // 2. ユーザーの回答を取得
    const userId = userToken!.uid;
    const answerId = `${userId}_${today}`;
    const answerDoc = await adminDb.collection("answers").doc(answerId).get();

    return NextResponse.json({
      question: {
        ...question,
        id: today,
        choices: typeof question.choices === 'string' ? JSON.parse(question.choices) : question.choices,
      },
      generating: isGenerating(today),
      answered: answerDoc.exists ? answerDoc.data()?.choiceIndex : null,
    });
  } catch (e) {
    console.error("[GET /api/questions]", e);
    return NextResponse.json({ error: "質問の取得に失敗しました" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // ... (POST body remains same as previously updated)
  const userToken = await getAuthenticatedUser(req);
  if (!userToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { questionId, choiceIndex } = await req.json();
  if (choiceIndex === undefined || choiceIndex < 0 || choiceIndex > 3) {
    return NextResponse.json({ error: "無効な回答" }, { status: 400 });
  }

  const userId = userToken.uid;
  const answerId = `${userId}_${questionId}`;

  try {
    const answerRef = adminDb.collection("answers").doc(answerId);
    const existing = await answerRef.get();
    if (existing.exists) {
      return NextResponse.json({ error: "今日はすでに回答済みです" }, { status: 400 });
    }

    const answerData = {
      userId,
      questionId,
      choiceIndex,
      answeredAt: new Date().toISOString(),
    };

    await answerRef.set(answerData);

    // つながっている相手との一致確認
    const q1 = adminDb.collection("connections").where("userId1", "==", userId).get();
    const q2 = adminDb.collection("connections").where("userId2", "==", userId).get();
    const [snap1, snap2] = await Promise.all([q1, q2]);
    const connections = [...snap1.docs, ...snap2.docs];

    for (const conn of connections) {
      const connData = conn.data();
      const partnerId = connData.userId1 === userId ? connData.userId2 : connData.userId1;
      
      const partnerAnswerId = `${partnerId}_${questionId}`;
      const partnerAnswerDoc = await adminDb.collection("answers").doc(partnerAnswerId).get();

      if (partnerAnswerDoc.exists) {
        const partnerChoice = partnerAnswerDoc.data()?.choiceIndex;
        const matched = partnerChoice === choiceIndex;
        
        // MatchRecord を保存
        const matchRecordId = `${conn.id}_${questionId}`;
        await adminDb.collection("match_records").doc(matchRecordId).set({
          connectionId: conn.id,
          questionId,
          matched,
          checkedAt: new Date().toISOString(),
        });

        // 一致した場合はトリガー発火チェック
        if (matched) {
          await checkAndCreateTrigger(conn.id);
        }
      }
    }

    return NextResponse.json({ answer: answerData });
  } catch (e) {
    console.error("[POST /api/questions]", e);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const userToken = await getAuthenticatedUser(req);
  if (!userToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 開発環境のみ許可
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const today = getToday();
  await regenerateDailyQuestion(today);
  return NextResponse.json({ message: "バックグラウンドで再生成を開始しました" });
}
