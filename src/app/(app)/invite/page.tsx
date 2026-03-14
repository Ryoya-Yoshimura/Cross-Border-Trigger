"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";

export default function InvitePage() {
  const { data: session } = useSession();
  const [inviteCode, setInviteCodeInput] = useState("");
  const [result, setResult] = useState<{ success?: string; error?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const myInviteCode = session?.user?.inviteCode ?? "読み込み中...";
  const inviteUrl = typeof window !== "undefined"
    ? `${window.location.origin}/invite/${myInviteCode}`
    : "";

  const copyInviteLink = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    setLoading(true);

    const res = await fetch("/api/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteCode }),
    });

    const data = await res.json();

    if (res.ok) {
      setResult({ success: `${data.connection.partner.name} さんとつながりました！` });
      setInviteCodeInput("");
    } else {
      setResult({ error: data.error });
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">招待・つながる</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          招待コードを共有して、友達とつながりましょう
        </p>
      </div>

      {/* 自分の招待コード */}
      <section>
        <h2 className="font-semibold text-sm mb-3" style={{ color: "var(--muted)" }}>
          あなたの招待コード
        </h2>
        <div
          className="rounded-2xl p-5"
          style={{ background: "white", border: "1.5px solid var(--border)" }}
        >
          <div
            className="rounded-xl p-3 text-center font-mono text-lg font-bold tracking-widest mb-3"
            style={{ background: "var(--background)", color: "var(--primary)" }}
          >
            {myInviteCode}
          </div>
          <button
            onClick={copyInviteLink}
            className="w-full rounded-xl py-2.5 text-sm font-semibold transition-all"
            style={{
              background: copied ? "var(--accent)" : "var(--primary)",
              color: "white",
            }}
          >
            {copied ? "✅ コピーしました！" : "招待リンクをコピー"}
          </button>
          <p className="text-xs text-center mt-2" style={{ color: "var(--muted)" }}>
            このリンクまたはコードを友達に送ってください
          </p>
        </div>
      </section>

      {/* 招待コードで接続 */}
      <section>
        <h2 className="font-semibold text-sm mb-3" style={{ color: "var(--muted)" }}>
          招待コードで友達とつながる
        </h2>
        <div
          className="rounded-2xl p-5"
          style={{ background: "white", border: "1.5px solid var(--border)" }}
        >
          <form onSubmit={handleConnect} className="space-y-3">
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCodeInput(e.target.value.trim())}
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none font-mono"
              style={{ border: "1.5px solid var(--border)", background: "var(--background)" }}
              placeholder="招待コードを入力"
              required
            />
            <button
              type="submit"
              disabled={loading || !inviteCode}
              className="w-full rounded-xl py-2.5 text-sm font-semibold transition-opacity"
              style={{
                background: "var(--accent)",
                color: "white",
                opacity: loading || !inviteCode ? 0.6 : 1,
              }}
            >
              {loading ? "確認中..." : "つながる"}
            </button>
          </form>

          {result?.success && (
            <div className="mt-3 p-3 rounded-xl text-sm text-center font-medium"
              style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
              🎉 {result.success}
            </div>
          )}
          {result?.error && (
            <div className="mt-3 p-3 rounded-xl text-sm text-center"
              style={{ background: "#fde8e8", color: "#c0392b" }}>
              {result.error}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
