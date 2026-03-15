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

  const userDoc = await adminDb.collection("users").doc(userToken.uid).get();
  if (!userDoc.exists) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const userData = userDoc.data();
  // idも含めて返す
  return NextResponse.json({ id: userToken.uid, ...userData });
}
