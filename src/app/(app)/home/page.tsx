import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const userId = session.user.id;
  const today = process.env.DEBUG_DATE ?? new Date().toISOString().slice(0, 10);

  // 今日の問題と回答状況
  const todayQuestion = await prisma.question.findUnique({ where: { date: today } });
  const todayAnswer = todayQuestion
    ? await prisma.answer.findUnique({
        where: { userId_questionId: { userId, questionId: todayQuestion.id } },
      })
    : null;

  // つながり一覧（直近5件）
  const connections = await prisma.connection.findMany({
    where: { OR: [{ userId1: userId }, { userId2: userId }] },
    include: {
      user1: { select: { id: true, name: true } },
      user2: { select: { id: true, name: true } },
      triggers: {
        where: { isViewed: false },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      matchRecords: {
        orderBy: { checkedAt: "desc" },
        take: 4,
      },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const unviewedTriggers = connections
    .filter((c) => c.triggers.length > 0)
    .map((c) => ({
      id: c.id,
      partner: c.userId1 === userId ? c.user2 : c.user1,
      trigger: c.triggers[0],
    }));

  const connSummaries = connections.map((c) => {
    const partner = c.userId1 === userId ? c.user2 : c.user1;
    let consecutiveMatches = 0;
    for (const m of c.matchRecords) {
      if (m.matched) consecutiveMatches++;
      else break;
    }
    return { id: c.id, partner, consecutiveMatches, hasTrigger: c.triggers.length > 0 };
  });

  return (
    <div className="space-y-6">
      {/* ウェルカムバナー */}
      <div
        className="rounded-2xl p-5"
        style={{ background: "linear-gradient(135deg, var(--primary-light), var(--accent-light))" }}
      >
        <p className="text-sm" style={{ color: "var(--muted)" }}>おかえり、</p>
        <h1 className="text-xl font-bold mt-0.5">{session.user.name} さん</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          今日も誰かとつながるきっかけを見つけましょう
        </p>
      </div>

      {/* 今日の質問 */}
      <section>
        <h2 className="font-semibold text-sm mb-2" style={{ color: "var(--muted)" }}>
          今日の質問
        </h2>
        {todayAnswer !== null ? (
          <div
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: "white", border: "1.5px solid var(--border)" }}
          >
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-semibold text-sm">今日の回答は完了しています</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>明日また来てね</p>
            </div>
          </div>
        ) : (
          <Link href="/daily">
            <div
              className="rounded-2xl p-4 flex items-center gap-3"
              style={{ background: "var(--primary)", color: "white" }}
            >
              <span className="text-2xl">✨</span>
              <div>
                <p className="font-semibold text-sm">今日の4択に答えよう！</p>
                <p className="text-xs mt-0.5 opacity-80">好みを選ぶだけ・1日1回</p>
              </div>
              <span className="ml-auto text-lg">→</span>
            </div>
          </Link>
        )}
      </section>

      {/* 再接続トリガー */}
      {unviewedTriggers.length > 0 && (
        <section>
          <h2 className="font-semibold text-sm mb-2" style={{ color: "var(--muted)" }}>
            🔔 再接続のきっかけ
          </h2>
          <div className="space-y-2">
            {unviewedTriggers.map((t) => (
              <Link key={t.id} href={`/trigger/${t.trigger.id}`}>
                <div
                  className="rounded-2xl p-4"
                  style={{
                    background: "white",
                    border: "1.5px solid var(--primary)",
                    borderLeft: "4px solid var(--primary)",
                  }}
                >
                  <p className="font-semibold text-sm" style={{ color: "var(--primary)" }}>
                    {t.partner.name} さんとの接点が見つかりました！
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                    {t.trigger.message}
                  </p>
                  <p className="text-xs mt-2 font-medium" style={{ color: "var(--accent)" }}>
                    推奨メッセージを見る →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* つながり一覧 */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-sm" style={{ color: "var(--muted)" }}>
            つながっている人
          </h2>
          <Link href="/connections" className="text-xs" style={{ color: "var(--accent)" }}>
            すべて見る
          </Link>
        </div>

        {connSummaries.length === 0 ? (
          <div
            className="rounded-2xl p-5 text-center"
            style={{ background: "white", border: "1.5px dashed var(--border)" }}
          >
            <p className="text-2xl mb-2">👋</p>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              まだつながっている人がいません
            </p>
            <Link href="/invite">
              <span className="text-sm font-medium" style={{ color: "var(--accent)" }}>
                友達を招待する →
              </span>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {connSummaries.map((c) => (
              <Link key={c.id} href={`/connections/${c.id}`}>
                <div
                  className="rounded-2xl p-4"
                  style={{ background: "white", border: "1.5px solid var(--border)" }}
                >
                  <div className="flex items-center gap-3">
                    {/* アバター */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                      style={{ background: "var(--accent)" }}
                    >
                      {c.partner.name[0]}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{c.partner.name}</p>

                      {/* 連続一致プログレスバー */}
                      <div className="flex items-center gap-1 mt-1.5">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div
                            key={i}
                            className="h-1.5 flex-1 rounded-full"
                            style={{
                              background:
                                i < c.consecutiveMatches ? "var(--primary)" : "var(--border)",
                              transition: "background 0.3s",
                            }}
                          />
                        ))}
                        <span className="text-xs ml-1 flex-shrink-0" style={{ color: "var(--muted)" }}>
                          {c.consecutiveMatches}/4日
                        </span>
                      </div>
                    </div>

                    {c.hasTrigger && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-semibold"
                        style={{ background: "var(--primary-light)", color: "var(--primary)" }}
                      >
                        NEW
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
