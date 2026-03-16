import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

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
        take: 30,
        include: { question: { select: { date: true } } },
      },
      triggers: {
        where: { isViewed: false },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const today = process.env.DEBUG_DATE ?? new Date().toISOString().slice(0, 10);

  const summaries = connections.map((conn) => {
    const partner = conn.userId1 === userId ? conn.user2 : conn.user1;

    // 日付の降順ソート
    const dates = conn.matchRecords
      .map((m) => m.question.date)
      .sort()
      .reverse();

    // 連続回答日数（今日 or 昨日から連続しているか）
    let consecutiveAnswerDays = 0;
    let expected = today;
    // 今日記録がなければ昨日から数える
    if (dates[0] && dates[0] < today) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      expected = yesterday.toISOString().slice(0, 10);
    }
    for (const date of dates) {
      if (date === expected) {
        consecutiveAnswerDays++;
        const d = new Date(expected);
        d.setDate(d.getDate() - 1);
        expected = d.toISOString().slice(0, 10);
      } else {
        break;
      }
    }

    // 最終回答からの経過日数
    const lastDate = dates[0];
    const daysSinceLast = lastDate
      ? Math.floor((new Date(today).getTime() - new Date(lastDate).getTime()) / 86400000)
      : null;

    return {
      id: conn.id,
      partner,
      consecutiveAnswerDays,
      daysSinceLast,
      hasTrigger: conn.triggers.length > 0,
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
            <div
              key={s.id}
              className="rounded-2xl p-4 flex items-center gap-4"
              style={{ background: "white", border: "1.5px solid var(--border)" }}
            >
              {/* アバター → プロフィールへ */}
              <Link
                href={`/profile/${s.partner.id}`}
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                style={{ background: "var(--accent)" }}
              >
                {s.partner.name[0]}
              </Link>

              {/* 名前・統計 → つながり詳細へ */}
              <Link href={`/connections/${s.id}`} className="flex-1 min-w-0 flex items-center gap-2">
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
                    {s.consecutiveAnswerDays > 0 && (
                      <span className="text-xs font-medium" style={{ color: "var(--primary)" }}>
                        🔥 {s.consecutiveAnswerDays}日連続回答中
                      </span>
                    )}
                    {s.daysSinceLast === null && (
                      <span className="text-xs" style={{ color: "var(--muted)" }}>まだ回答なし</span>
                    )}
                    {s.daysSinceLast !== null && s.consecutiveAnswerDays === 0 && (
                      <span className="text-xs" style={{ color: "var(--muted)" }}>
                        最終回答 {s.daysSinceLast === 0 ? "今日" : `${s.daysSinceLast}日前`}
                      </span>
                    )}
                  </div>
                </div>
                <span style={{ color: "var(--muted)" }}>›</span>
              </Link>
            </div>
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
