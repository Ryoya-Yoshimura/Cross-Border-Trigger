"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type MatchItem = { date: string; label: string };

type TriggerData = {
  id: string;
  message: string;
  partnerName: string;
  createdAt: string;
  matchContext: MatchItem[];
};

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

  // matchContextを使ってサンプルメッセージを動的生成
  const getSampleMessages = (t: TriggerData): string[] => {
    const name = t.partnerName;
    const first = t.matchContext[0]?.label;
    const labels = t.matchContext.map((m) => m.label).filter(Boolean);
    const labelStr = labels.slice(0, 2).join("とか");

    return [
      `久しぶり！最近どうしてる？`,
      first
        ? `ひさしぶり！${first}好きなの？なんか気が合いそうって出たんだけど笑`
        : `ひさしぶり！なんか気が合いそうって出たんだけど笑、元気？`,
      labelStr
        ? `急に連絡してごめんね、${labelStr}が被っててなんか気になって`
        : `急に連絡してごめんね、最近どんな感じ？`,
      `${name}さん久しぶり！最近よく考えることあって、連絡してみた`,
    ];
  };

  const copyMessage = async () => {
    if (!trigger) return;
    const messages = getSampleMessages(trigger);
    await navigator.clipboard.writeText(messages[selectedMessage]);
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

  const sampleMessages = getSampleMessages(trigger);

  return (
    <div className="space-y-5">
      {/* ヘッダーバナー */}
      <div
        className="rounded-2xl p-5 text-center"
        style={{ background: "linear-gradient(135deg, var(--primary-light), var(--accent-light))" }}
      >
        <div className="text-5xl mb-3">🎉</div>
        <h1 className="text-xl font-bold">
          {trigger.partnerName} さんと気が合います！
        </h1>
        <p className="text-sm mt-2" style={{ color: "var(--muted)" }}>
          {trigger.message}
        </p>
      </div>

      {/* 一致の証拠 */}
      {trigger.matchContext.length > 0 && (
        <section>
          <h2 className="font-semibold text-sm mb-2" style={{ color: "var(--muted)" }}>
            📊 4日間の一致記録
          </h2>
          <div
            className="rounded-2xl p-4"
            style={{ background: "white", border: "1.5px solid var(--border)" }}
          >
            <div className="space-y-2">
              {trigger.matchContext.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  {/* 日付 */}
                  <span
                    className="text-xs w-20 flex-shrink-0"
                    style={{ color: "var(--muted)" }}
                  >
                    {item.date}
                  </span>
                  {/* 選択肢ラベル */}
                  <span
                    className="text-xs px-3 py-1 rounded-full font-medium flex-shrink-0"
                    style={{ background: "var(--primary-light)", color: "var(--primary)" }}
                  >
                    {item.label}
                  </span>
                  {/* チェックマーク */}
                  <span className="text-sm ml-auto" style={{ color: "var(--primary)" }}>
                    ✓ 一致
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs mt-3 text-center" style={{ color: "var(--muted)" }}>
              2人が同じ選択肢を選び続けました
            </p>
          </div>
        </section>
      )}

      {/* 推奨メッセージ */}
      <section>
        <h2 className="font-semibold text-sm mb-1" style={{ color: "var(--muted)" }}>
          最初の一言として使えるメッセージ
        </h2>
        <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>
          気に入ったものを選んで、コピーしてSNSで送りましょう
        </p>

        <div className="space-y-2 mb-4">
          {sampleMessages.map((msg, i) => (
            <button
              key={i}
              onClick={() => setSelectedMessage(i)}
              className="w-full rounded-xl p-4 text-left text-sm"
              style={{
                background: selectedMessage === i ? "var(--primary-light)" : "white",
                border:
                  selectedMessage === i
                    ? "2px solid var(--primary)"
                    : "1.5px solid var(--border)",
                color: "var(--foreground)",
                transition: "background 0.15s, border-color 0.15s",
              }}
            >
              {msg}
            </button>
          ))}
        </div>

        <button
          onClick={copyMessage}
          className="w-full rounded-xl py-3 text-sm font-semibold"
          style={{
            background: copied ? "var(--accent)" : "var(--primary)",
            color: "white",
            transition: "background 0.2s",
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
