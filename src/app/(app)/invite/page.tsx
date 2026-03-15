"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

export default function InvitePage() {
  const { data: session } = useSession();
  const [inviteCode, setInviteCodeInput] = useState("");
  const [result, setResult] = useState<{ success?: string; error?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState("");

  const myInviteCode = session?.user?.inviteCode ?? "読み込み中...";
  const inviteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/invite/${myInviteCode}`
      : "";

  // Web Share API（スマホではネイティブシェートシートが開く）
  const handleShare = async () => {
    setShareError("");
    const shareData = {
      title: "Cross Borderに参加しませんか？",
      text: `${session?.user?.name ?? "友達"} さんから招待が届いています！毎日の4択で気が合うか確かめてみよう。`,
      url: inviteUrl,
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch {
        // キャンセルは無視
      }
    } else {
      // フォールバック: クリップボードにコピー
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyInviteLink = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConnect = async (e: React.SyntheticEvent<HTMLFormElement>) => {
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

  const lineShareUrl = `https://line.me/R/msg/text/?${encodeURIComponent(
    `Cross Borderへの招待です！\n${inviteUrl}`
  )}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">招待・つながる</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          招待リンクを共有して、友達とつながりましょう
        </p>
      </div>

      {/* 自分の招待コード */}
      <section>
        <h2 className="font-semibold text-sm mb-3" style={{ color: "var(--muted)" }}>
          あなたの招待リンク
        </h2>
        <div
          className="rounded-2xl p-5"
          style={{ background: "white", border: "1.5px solid var(--border)" }}
        >
          {/* QRコード */}
          {inviteUrl && (
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-xl bg-white" style={{ border: "1.5px solid var(--border)" }}>
                <QRCodeSVG value={inviteUrl} size={180} />
              </div>
            </div>
          )}

          {/* 招待コード表示 */}
          <div
            className="rounded-xl p-3 text-center font-mono text-2xl font-bold tracking-widest mb-4"
            style={{ background: "var(--background)", color: "var(--primary)" }}
          >
            {myInviteCode}
          </div>

          {/* シェアボタン群 */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {/* Web Share / コピー */}
            <button
              onClick={handleShare}
              className="rounded-xl py-2.5 text-sm font-semibold"
              style={{
                background: copied ? "var(--accent)" : "var(--primary)",
                color: "white",
              }}
            >
              {copied ? "✅ コピー済み" : "📤 共有する"}
            </button>

            {/* LINEで送る */}
            <a
              href={lineShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl py-2.5 text-sm font-semibold text-center block"
              style={{ background: "#06C755", color: "white" }}
            >
              📱 LINEで送る
            </a>
          </div>

          {/* コピーのみボタン（フォールバック） */}
          <button
            onClick={copyInviteLink}
            className="w-full rounded-xl py-2 text-xs"
            style={{
              background: "transparent",
              color: "var(--muted)",
              border: "1px solid var(--border)",
            }}
          >
            {copied ? "✅ コピーしました" : "リンクをコピー"}
          </button>

          {shareError && (
            <p className="text-xs text-red-500 text-center mt-2">{shareError}</p>
          )}

          <p className="text-xs text-center mt-3" style={{ color: "var(--muted)" }}>
            リンクを開いた相手が登録 or ログインするとつながります
          </p>
        </div>
      </section>

      {/* 招待コードで接続（相手のコードを入力） */}
      <section>
        <h2 className="font-semibold text-sm mb-3" style={{ color: "var(--muted)" }}>
          招待コードで手動入力
        </h2>
        <div
          className="rounded-2xl p-5"
          style={{ background: "white", border: "1.5px solid var(--border)" }}
        >
          <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>
            相手から招待コードを直接受け取った場合はここに入力
          </p>
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
            <div
              className="mt-3 p-3 rounded-xl text-sm text-center font-medium"
              style={{ background: "var(--accent-light)", color: "var(--accent)" }}
            >
              🎉 {result.success}
            </div>
          )}
          {result?.error && (
            <div
              className="mt-3 p-3 rounded-xl text-sm text-center"
              style={{ background: "#fde8e8", color: "#c0392b" }}
            >
              {result.error}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
