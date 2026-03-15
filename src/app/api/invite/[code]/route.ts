import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  try {
    const userSnap = await adminDb.collection("users").where("inviteCode", "==", code).limit(1).get();
    if (userSnap.empty) {
      return NextResponse.json({ error: "招待コードが見つかりません" }, { status: 404 });
    }

    const userData = userSnap.docs[0].data();
    return NextResponse.json({ name: userData.name });
  } catch (e) {
    console.error("[GET /api/invite/[code]]", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
