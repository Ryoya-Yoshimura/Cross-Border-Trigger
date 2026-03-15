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

export async function PATCH(req: NextRequest) {
  const userToken = await getAuthenticatedUser(req);
  if (!userToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { bio, xUrl, lineUrl, instagramUrl, facebookUrl, threadsUrl } = await req.json();

  const userRef = adminDb.collection("users").doc(userToken.uid);
  
  const updateData: any = {
    updatedAt: new Date().toISOString(),
  };
  if (bio !== undefined) updateData.bio = bio;
  if (xUrl !== undefined) updateData.xUrl = xUrl;
  if (lineUrl !== undefined) updateData.lineUrl = lineUrl;
  if (instagramUrl !== undefined) updateData.instagramUrl = instagramUrl;
  if (facebookUrl !== undefined) updateData.facebookUrl = facebookUrl;
  if (threadsUrl !== undefined) updateData.threadsUrl = threadsUrl;

  await userRef.update(updateData);

  return NextResponse.json({ id: userToken.uid, ...updateData });
}
