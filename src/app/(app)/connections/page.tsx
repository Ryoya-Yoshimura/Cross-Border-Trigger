import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ConnectionsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const userId = session.user.id;

  const connections = await prisma.connection.findMany({
    where: {
      OR: [{ userId1: userId }, { userId2: userId }],
    },
    include: {
      user1: { select: { id: true, name: true } },
      user2: { select: { id: true, name: true } },
      matchRecords: {
        orderBy: { checkedAt: "desc" },
        take: 7,
      },
      triggers: {
        where: { isViewed: false },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const summaries = connections.map((conn) => {
    const partner = conn.userId1 === userId ? conn.user2 : conn.user1;
    let consecutiveMatches = 0;
    for (const m of conn.matchRecords) {
      if (m.matched) consecutiveMatches++;
      else break;
    }
    const totalMatches = conn.matchRecords.filter((m) => m.matched).length;
    return {
      id: conn.id,
      partner,
      consecutiveMatches,
      totalMatches,
      hasTrigger: conn.triggers.length > 0,
      daysTogether: conn.matchRecords.length,
    };
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">つながり一覧</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          {summaries.length}人とつながっています
        </p>
      </div>

      {summaries.length === 0 ? (
        <div
          className="rounded-2xl p-8 text-center"
          style={{ background: "white", border: "1.5px dashed var(--border)" }}
        >
          <p className="text-3xl mb-3">👥</p>
          <p className="font-semibold mb-1">まだつながっている人がいません</p>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            招待コードで友達とつながりましょう
          </p>
          <Link href="/invite">
            <div
              className="mt-4 inline-block px-6 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: "var(--primary)", color: "white" }}
            >
              招待する
            </div>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {summaries.map((s) => (
            <Link key={s.id} href={`/connections/${s.id}`}>
              <div
                className="rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-opacity hover:opacity-90"
                style={{ background: "white", border: "1.5px solid var(--border)" }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                  style={{ background: "var(--accent)" }}
                >
                  {s.partner.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{s.partner.name}</p>
                    {s.hasTrigger && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                        style={{ background: "var(--primary-light)", color: "var(--primary)" }}
                      >
                        NEW
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3 mt-1">
                    <span className="text-xs" style={{ color: "var(--muted)" }}>
                      回答 {s.daysTogether}日
                    </span>
                    <span className="text-xs" style={{ color: "var(--muted)" }}>
                      一致 {s.totalMatches}日
                    </span>
                    {s.consecutiveMatches > 0 && (
                      <span className="text-xs font-medium" style={{ color: "var(--primary)" }}>
                        🔥 {s.consecutiveMatches}連続
                      </span>
                    )}
                  </div>
                </div>
                <span style={{ color: "var(--muted)" }}>›</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="text-center">
        <Link href="/invite">
          <span className="text-sm font-medium" style={{ color: "var(--accent)" }}>
            + 友達を招待する
          </span>
        </Link>
      </div>
    </div>
  );
}
