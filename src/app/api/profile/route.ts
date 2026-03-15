import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { bio, xUrl, lineUrl, instagramUrl, facebookUrl, threadsUrl } = await req.json();

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { bio, xUrl, lineUrl, instagramUrl, facebookUrl, threadsUrl },
    select: { id: true, bio: true, xUrl: true, lineUrl: true, instagramUrl: true, facebookUrl: true, threadsUrl: true },
  });

  return NextResponse.json(user);
}
