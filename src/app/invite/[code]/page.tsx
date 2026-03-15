"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function InviteLandingPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const code = params.code as string;

  const [inviterName, setInviterName] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [alreadyConnected, setAlreadyConnected] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/invite/${code}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setNotFound(true);
        else setInviterName(data.name);
      })
      .catch(() => setNotFound(true));
  }, [code]);

  const handleConnect = async () => {
    setConnecting(true);
    setError("");

    const res = await fetch("/api/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteCode: code }),
    });

    const data = await res.json();

    if (res.ok) {
      setConnected(true);
      setTimeout(() => router.push("/home"), 2200);
    } else if (data.error === "すでにつながっています") {
      setAlreadyConnected(true);
    } else {
      setError(data.error || "エラーが発生しました");
    }
    setConnecting(false);
  };

  // セッション or 招待者情報 読み込み中
  if (status === "loading" || (!inviterName && !notFound)) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <p className="text-sm" style={{ color: "var(--muted)" }}>読み込み中...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "var(--background)" }}>
        <div className="text-center">
          <div className="text-4xl mb-3">😢</div>
          <h2 className="font-bold text-lg mb-2">招待リンクが見つかりません</h2>
          <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>
            有効期限が切れているか、URLが正しくない可能性があります。
          </p>
          <Link href="/login">
            <span className="text-sm font-medium" style={{ color: "var(--accent)" }}>
              ログインページへ
            </span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "var(--background)" }}
    >
      {/* ロゴ */}
      <div className="mb-8 text-center">
        <div className="text-4xl mb-2">🌉</div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
          Cross Border
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          疎遠になった人と、また話すきっかけを
        </p>
      </div>

      <div
        className="w-full max-w-sm rounded-2xl p-6 shadow-sm"
        style={{ background: "white", border: "1.5px solid var(--border)" }}
      >
        {connected ? (
          /* 接続成功 */
          <div className="text-center py-4">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="font-bold text-xl mb-2">{inviterName} さんとつながりました！</h2>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              毎日の4択に一緒に答えていきましょう
            </p>
            <p className="text-xs mt-3" style={{ color: "var(--muted)" }}>
              ホームへ移動中...
            </p>
          </div>
        ) : alreadyConnected ? (
          /* 既につながっている */
          <div className="text-center py-4">
            <div className="text-4xl mb-3">✅</div>
            <h2 className="font-bold text-lg mb-2">{inviterName} さんとはすでにつながっています</h2>
            <button
              onClick={() => router.push("/home")}
              className="mt-3 w-full rounded-xl py-2.5 text-sm font-semibold"
              style={{ background: "var(--accent)", color: "white" }}
            >
              ホームへ
            </button>
          </div>
        ) : (
          /* メイン招待UI */
          <>
            {/* 招待者情報 */}
            <div className="text-center mb-6">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3"
                style={{ background: "var(--accent)" }}
              >
                {inviterName?.[0]}
              </div>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                招待が届いています
              </p>
              <h2 className="text-xl font-bold mt-1">{inviterName} さんから</h2>
              <p className="text-sm mt-2" style={{ color: "var(--muted)" }}>
                毎日の4択を一緒に選んで、<br />気が合ったらきっかけをお知らせします
              </p>
            </div>

            {session ? (
              /* ログイン済み → 即接続 */
              <>
                <button
                  onClick={handleConnect}
                  disabled={connecting}
                  className="w-full rounded-xl py-3 text-sm font-semibold mb-3"
                  style={{
                    background: "var(--primary)",
                    color: "white",
                    opacity: connecting ? 0.7 : 1,
                  }}
                >
                  {connecting ? "接続中..." : `${inviterName} さんとつながる`}
                </button>
                {error && (
                  <p className="text-sm text-red-500 text-center mt-2">{error}</p>
                )}
                <p className="text-xs text-center mt-2" style={{ color: "var(--muted)" }}>
                  {session.user?.name} としてログイン中
                </p>
              </>
            ) : (
              /* 未ログイン → 登録 / ログインへ */
              <>
                <Link href={`/register?inviteCode=${code}`}>
                  <button
                    className="w-full rounded-xl py-3 text-sm font-semibold mb-2"
                    style={{ background: "var(--primary)", color: "white" }}
                  >
                    新規登録してつながる
                  </button>
                </Link>
                <Link href={`/login?callbackUrl=/invite/${code}`}>
                  <button
                    className="w-full rounded-xl py-3 text-sm font-semibold"
                    style={{
                      background: "white",
                      border: "1.5px solid var(--border)",
                      color: "var(--foreground)",
                    }}
                  >
                    ログインしてつながる
                  </button>
                </Link>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
