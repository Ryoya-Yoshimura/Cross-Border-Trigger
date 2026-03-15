"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

export default function HomePage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        
        // 1. プロフィール (me)
        const profileRes = await fetch("/api/profile/me", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const profile = await profileRes.json();

        // 2. 質問
        const questionRes = await fetch("/api/questions", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const questionData = await questionRes.json();

        // 3. つながり
        const connectionsRes = await fetch("/api/connections", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const connectionsData = await connectionsRes.json();

        setData({
          profile,
          question: questionData,
          connections: connectionsData.connections,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  if (loading || !user) {
    return <div className="p-8 text-center text-sm text-muted">読み込み中...</div>;
  }

  const { profile, question, connections } = data || {};
  const unviewedTriggers = connections?.filter((c: any) => c.latestTrigger && !c.latestTrigger.isViewed) || [];

  return (
    <div className="space-y-6">
      {/* プロフィールカード */}
      <div
        className="rounded-2xl p-4 flex items-center gap-4"
        style={{ background: "white", border: "1.5px solid var(--border)" }}
      >
        <Link href={`/profile/${user.uid}`} className="flex items-center gap-4 flex-1 min-w-0">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0"
            style={{ background: "var(--primary)" }}
          >
            {user.displayName?.slice(0, 1) ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">{user.displayName}</p>
            {profile?.bio ? (
              <p className="text-xs mt-0.5 truncate" style={{ color: "var(--muted)" }}>{profile.bio}</p>
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
        <h1 className="text-xl font-bold mt-0.5">{user.displayName} さん</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          今日も誰かとつながるきっかけを見つけましょう
        </p>
      </div>

      {/* 今日の質問 */}
      <section>
        <h2 className="font-semibold text-sm mb-2" style={{ color: "var(--muted)" }}>
          今日の質問
        </h2>
        {question?.answered !== null ? (
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
            {unviewedTriggers.map((t: any) => (
              <Link key={t.id} href={`/trigger/${t.latestTrigger.id}`}>
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
                    {t.latestTrigger.message}
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

      {/* 待機中メッセージ */}
      {connections?.length > 0 && unviewedTriggers.length === 0 && (
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
      {connections?.length === 0 && (
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
