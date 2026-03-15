"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

export default function ConnectionDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [connection, setConnection] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConnection() {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch(`/api/connections/${params.id}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setConnection(data.connection);
        } else {
          router.push("/home");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchConnection();
  }, [params.id, user, router]);

  if (loading || !user) {
    return <div className="p-8 text-center text-sm text-muted">読み込み中...</div>;
  }

  if (!connection) return null;

  // トリガー未発火の場合は詳細を見せない
  if (connection.triggers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <p className="text-4xl">🌱</p>
        <p className="font-semibold">まだわかりません</p>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          毎日の4択に答え続けると、<br />気が合う人が見つかったときにお知らせします
        </p>
        <Link href="/home" className="text-sm font-medium" style={{ color: "var(--accent)" }}>
          ホームへ戻る
        </Link>
      </div>
    );
  }

  const partner = connection.partner;

  let consecutiveMatches = 0;
  for (const m of connection.matchRecords) {
    if (m.matched) consecutiveMatches++;
    else break;
  }
  const totalMatches = connection.matchRecords.filter((m: any) => m.matched).length;

  return (
    <div className="space-y-5">
      {/* プロフィールヘッダー */}
      <div
        className="rounded-2xl p-5 text-center"
        style={{ background: "white", border: "1.5px solid var(--border)" }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3"
          style={{ background: "var(--accent)" }}
        >
          {partner.name[0]}
        </div>
        <h1 className="text-xl font-bold">{partner.name}</h1>
        <div className="flex justify-center gap-5 mt-3">
          <div className="text-center">
            <p className="text-xl font-bold" style={{ color: "var(--primary)" }}>
              {totalMatches}
            </p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              一致した日
            </p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold" style={{ color: "var(--primary)" }}>
              {consecutiveMatches}
            </p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              連続一致
            </p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold" style={{ color: "var(--primary)" }}>
              {connection.matchRecords.length}
            </p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              回答した日
            </p>
          </div>
        </div>
      </div>

      {/* 連続一致バー */}
      {consecutiveMatches >= 2 && (
        <div
          className="rounded-2xl p-4"
          style={{ background: "var(--primary-light)", border: "1.5px solid var(--primary)" }}
        >
          <p className="font-semibold text-sm" style={{ color: "var(--primary)" }}>
            🔥 {consecutiveMatches}日連続で気が合っています！
          </p>
          {consecutiveMatches < 4 ? (
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
              あと{4 - consecutiveMatches}日一致すると、連絡のきっかけが届きます
            </p>
          ) : (
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
              再接続のトリガーが届いています！
            </p>
          )}
        </div>
      )}

      {/* トリガー一覧 */}
      {connection.triggers.length > 0 && (
        <section>
          <h2 className="font-semibold text-sm mb-2" style={{ color: "var(--muted)" }}>
            再接続のきっかけ
          </h2>
          <div className="space-y-2">
            {connection.triggers.map((trigger: any) => (
              <Link key={trigger.id} href={`/trigger/${trigger.id}`}>
                <div
                  className="rounded-2xl p-4 cursor-pointer transition-opacity hover:opacity-90"
                  style={{
                    background: "white",
                    borderLeft: "4px solid var(--primary)",
                    border: "1.5px solid var(--primary)",
                  }}
                >
                  <p className="text-sm">{trigger.message}</p>
                  <p className="text-xs mt-1 font-medium" style={{ color: "var(--accent)" }}>
                    推奨メッセージを見る →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 最近の一致履歴 */}
      <section>
        <h2 className="font-semibold text-sm mb-2" style={{ color: "var(--muted)" }}>
          最近の記録
        </h2>
        <div className="space-y-1.5">
          {connection.matchRecords.slice(0, 7).map((record: any) => (
            <div
              key={record.id}
              className="rounded-xl px-4 py-2.5 flex items-center justify-between"
              style={{ background: "white", border: "1.5px solid var(--border)" }}
            >
              <span className="text-sm" style={{ color: "var(--muted)" }}>
                {record.questionId}
              </span>
              <span
                className="text-sm font-medium"
                style={{ color: record.matched ? "var(--primary)" : "var(--muted)" }}
              >
                {record.matched ? "✓ 一致" : "✗ 不一致"}
              </span>
            </div>
          ))}
          {connection.matchRecords.length === 0 && (
            <p className="text-sm text-center py-4" style={{ color: "var(--muted)" }}>
              まだ記録がありません。今日の質問に答えてみましょう！
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
