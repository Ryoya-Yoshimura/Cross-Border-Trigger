import { NextRequest, NextResponse } from "next/server";
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
    const connDoc = await adminDb.collection("connections").doc(id).get();
    if (!connDoc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const connData = connDoc.data();
    const userId = userToken.uid;
    if (connData?.userId1 !== userId && connData?.userId2 !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const partnerId = connData?.userId1 === userId ? connData?.userId2 : connData?.userId1;
    const partnerDoc = await adminDb.collection("users").doc(partnerId).get();
    const partnerData = partnerDoc.data();

    // MatchRecords
    const matchSnap = await adminDb.collection("match_records")
      .where("connectionId", "==", id)
      .orderBy("checkedAt", "desc")
      .limit(14)
      .get();
    const matchRecords = matchSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Triggers
    const triggerSnap = await adminDb.collection("triggers")
      .where("connectionId", "==", id)
      .orderBy("createdAt", "desc")
      .get();
    const triggers = triggerSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({
      connection: {
        id,
        userId1: connData?.userId1,
        userId2: connData?.userId2,
        partner: { id: partnerId, name: partnerData?.name ?? "Unknown" },
        matchRecords,
        triggers,
      }
    });
  } catch (e) {
    console.error("[GET /api/connections/[id]]", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
