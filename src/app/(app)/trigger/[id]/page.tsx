"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type TriggerData = {
  id: string;
  message: string;
  partnerName: string;
  createdAt: string;
};

const SAMPLE_MESSAGES = [
  "久しぶり！最近どうしてる？",
  "ひさしぶり！なんか気が合いそうって出たんだけど笑、元気？",
  "急に連絡してごめんね、最近どんな感じ？",
  "最近よく考えることがあって、久しぶりに話しかけてみた。元気？",
];

export default function TriggerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [trigger, setTrigger] = useState<TriggerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(0);

  useEffect(() => {
    fetch(`/api/trigger/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setTrigger(data.trigger);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  const copyMessage = async () => {
    await navigator.clipboard.writeText(SAMPLE_MESSAGES[selectedMessage]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p style={{ color: "var(--muted)" }}>読み込み中...</p>
      </div>
    );
  }

  if (!trigger) {
    return (
      <div className="text-center py-12">
        <p style={{ color: "var(--muted)" }}>トリガーが見つかりません</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ヘッダー */}
      <div
        className="rounded-2xl p-5 text-center"
        style={{ background: "linear-gradient(135deg, var(--primary-light), var(--accent-light))" }}
      >
        <div className="text-4xl mb-2">🎉</div>
        <h1 className="text-xl font-bold">
          {trigger.partnerName} さんと気が合います！
        </h1>
        <p className="text-sm mt-2" style={{ color: "var(--muted)" }}>
          {trigger.message}
        </p>
      </div>

      {/* 推奨メッセージ */}
      <section>
        <h2 className="font-semibold text-sm mb-3" style={{ color: "var(--muted)" }}>
          最初の一言として使えるメッセージ
        </h2>
        <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>
          気に入ったメッセージを選んで、コピーしてSNSで送りましょう
        </p>

        <div className="space-y-2 mb-4">
          {SAMPLE_MESSAGES.map((msg, i) => (
            <button
              key={i}
              onClick={() => setSelectedMessage(i)}
              className="w-full rounded-xl p-4 text-left text-sm transition-all"
              style={{
                background: selectedMessage === i ? "var(--primary-light)" : "white",
                border: selectedMessage === i
                  ? "2px solid var(--primary)"
                  : "1.5px solid var(--border)",
                color: "var(--foreground)",
              }}
            >
              {msg}
            </button>
          ))}
        </div>

        <button
          onClick={copyMessage}
          className="w-full rounded-xl py-3 text-sm font-semibold transition-all"
          style={{
            background: copied ? "var(--accent)" : "var(--primary)",
            color: "white",
          }}
        >
          {copied ? "✅ コピーしました！SNSで送ってみよう" : "このメッセージをコピー"}
        </button>
      </section>

      <p className="text-xs text-center" style={{ color: "var(--muted)" }}>
        ※ アプリ内でのチャット機能はありません。コピーして外部のSNS等でお送りください。
      </p>

      <button
        onClick={() => router.back()}
        className="w-full rounded-xl py-2.5 text-sm"
        style={{ background: "white", border: "1.5px solid var(--border)", color: "var(--muted)" }}
      >
        戻る
      </button>
    </div>
  );
}
