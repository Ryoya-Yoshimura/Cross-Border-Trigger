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

  // つながり（未読トリガーと総数だけ取得）
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
    },
    orderBy: { createdAt: "desc" },
  });

  const totalConnections = connections.length;

  // 自分のプロフィール
  const me = await prisma.user.findUnique({
    where: { id: userId },
    select: { bio: true, xUrl: true, lineUrl: true, instagramUrl: true, facebookUrl: true, threadsUrl: true },
  });

  const unviewedTriggers = connections
    .filter((c) => c.triggers.length > 0)
    .map((c) => ({
      id: c.id,
      partner: c.userId1 === userId ? c.user2 : c.user1,
      trigger: c.triggers[0],
    }));

  return (
    <div className="space-y-6">
      {/* プロフィールカード */}
      <div
        className="rounded-2xl p-4 flex items-center gap-4"
        style={{ background: "white", border: "1.5px solid var(--border)" }}
      >
        <Link href={`/profile/${userId}`} className="flex items-center gap-4 flex-1 min-w-0">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0"
            style={{ background: "var(--primary)" }}
          >
            {session.user.name?.slice(0, 1) ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">{session.user.name}</p>
            {me?.bio ? (
              <p className="text-xs mt-0.5 truncate" style={{ color: "var(--muted)" }}>{me.bio}</p>
            ) : (
              <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>一言を追加する</p>
            )}
          </div>
        </Link>
        <Link href="/profile/edit" className="text-xs font-medium shrink-0" style={{ color: "var(--accent)" }}>
          編集
        </Link>
      </div>

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

      {/* 再接続トリガー（4日一致後にのみ表示） */}
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

      {/* 待機中メッセージ（つながりはあるがトリガー未発火） */}
      {totalConnections > 0 && unviewedTriggers.length === 0 && (
        <section>
          <div
            className="rounded-2xl p-5 text-center"
            style={{ background: "white", border: "1.5px dashed var(--border)" }}
          >
            <p className="text-2xl mb-2">🌱</p>
            <p className="font-semibold text-sm">毎日答え続けましょう</p>
            <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
              気が合う人が見つかったらお知らせします
            </p>
          </div>
        </section>
      )}

      {/* つながりがゼロの場合 */}
      {totalConnections === 0 && (
        <section>
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
        </section>
      )}
    </div>
  );
}
