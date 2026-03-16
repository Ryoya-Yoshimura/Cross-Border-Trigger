import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const SNS_META: { key: string; label: string; icon: string }[] = [
  { key: "xUrl",         label: "X",        icon: "𝕏" },
  { key: "lineUrl",      label: "LINE",     icon: "💬" },
  { key: "instagramUrl", label: "Instagram",icon: "📷" },
  { key: "facebookUrl",  label: "Facebook", icon: "📘" },
  { key: "threadsUrl",   label: "Threads",  icon: "🧵" },
];

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, bio: true, xUrl: true, lineUrl: true, instagramUrl: true, facebookUrl: true, threadsUrl: true, answers: { select: { id: true } } },
  });
  if (!user) notFound();

  const isOwn = user.id === session.user.id;

  const answerCount = user.answers.length;

  // 一致した日（自分との接続に限定）
  const matchCount = await prisma.matchRecord.count({
    where: {
      matched: true,
      connection: {
        OR: [
          { userId1: session.user.id, userId2: user.id },
          { userId1: user.id, userId2: session.user.id },
        ],
      },
    },
  });

  const avatarChar = user.name.slice(0, 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/home" className="text-sm" style={{ color: "var(--muted)" }}>← 戻る</Link>
        {isOwn && (
          <Link href="/profile/edit" className="ml-auto text-sm font-medium" style={{ color: "var(--accent)" }}>
            編集
          </Link>
        )}
      </div>

      {/* プロフィールカード */}
      <div
        className="rounded-2xl p-6 flex flex-col items-center gap-3 text-center"
        style={{ background: "white", border: "1.5px solid var(--border)" }}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white"
          style={{ background: "var(--primary)" }}
        >
          {avatarChar}
        </div>
        <p className="font-bold text-xl">{user.name}</p>
        {user.bio && (
          <p className="text-sm" style={{ color: "var(--muted)" }}>一言：{user.bio}</p>
        )}
      </div>

      {/* SNS */}
      <div
        className="rounded-2xl p-5 space-y-3"
        style={{ background: "white", border: "1.5px solid var(--border)" }}
      >
        <div className="grid grid-cols-2 gap-2">
          {SNS_META.map(({ key, label, icon }) => {
            const url = user[key as keyof typeof user] as string | null;
            return (
              <div key={key} className="flex items-center gap-2 text-sm">
                <span>{icon}</span>
                <span className="w-20 shrink-0" style={{ color: "var(--muted)" }}>{label}</span>
                <span>：</span>
                {url ? (
                  <a href={url} target="_blank" rel="noopener noreferrer" className="font-medium truncate" style={{ color: "var(--accent)" }}>
                    開く
                  </a>
                ) : (
                  <span style={{ color: "var(--muted)" }}>—</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 統計 */}
      <div
        className="rounded-2xl p-5 grid grid-cols-3 text-center gap-2"
        style={{ background: "white", border: "1.5px solid var(--border)" }}
      >
        {isOwn ? (
          <>
            <div>
              <p className="text-2xl font-bold" style={{ color: "var(--accent)" }}>{answerCount}</p>
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>回答した日</p>
            </div>
          </>
        ) : (
          <>
            <div>
              <p className="text-2xl font-bold" style={{ color: "var(--accent)" }}>{matchCount}</p>
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>一致した日</p>
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: "var(--accent)" }}>{answerCount}</p>
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>回答した日</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
