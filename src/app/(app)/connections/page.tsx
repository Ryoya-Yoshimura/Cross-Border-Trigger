"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

export default function ConnectionsPage() {
  const { user } = useAuth();
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConnections() {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/connections", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        setConnections(data.connections || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchConnections();
  }, [user]);

  if (loading || !user) {
    return <div className="p-8 text-center text-sm text-muted">読み込み中...</div>;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">つながり一覧</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          {connections.length}人とつながっています
        </p>
      </div>

      {connections.length === 0 ? (
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
          {connections.map((s) => (
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
                    {s.latestTrigger && !s.latestTrigger.isViewed && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                        style={{ background: "var(--primary-light)", color: "var(--primary)" }}
                      >
                        NEW
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3 mt-1">
                    {s.consecutiveMatches > 0 && (
                      <span className="text-xs font-medium" style={{ color: "var(--primary)" }}>
                        🔥 {s.consecutiveMatches}日連続一致中
                      </span>
                    )}
                    {s.matchCount > 0 && (
                      <span className="text-xs" style={{ color: "var(--muted)" }}>
                        通算一致: {s.matchCount}回
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
