"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Choice = { label: string; imageUrl: string };
type Question = { id: string; date: string; text: string; choices: Choice[] };

export default function DailyPage() {
  const router = useRouter();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answered, setAnswered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/questions")
      .then((r) => r.json())
      .then((data) => {
        setQuestion(data.question);
        setAnswered(data.answered);
        if (data.answered !== null) setSelected(data.answered);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSelect = (index: number) => {
    if (answered !== null) return;
    setSelected(index);
  };

  const handleSubmit = async () => {
    if (selected === null || !question) return;
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: question.id, choiceIndex: selected }),
    });

    const data = await res.json();
    if (res.ok) {
      setAnswered(selected);
    } else {
      setError(data.error || "送信に失敗しました");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center" style={{ color: "var(--muted)" }}>
          <div className="text-3xl mb-2">✨</div>
          <p className="text-sm">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="text-center py-12" style={{ color: "var(--muted)" }}>
        <p>問題を取得できませんでした</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ヘッダー */}
      <div>
        <p className="text-xs font-medium" style={{ color: "var(--muted)" }}>
          今日の質問
        </p>
        <h1 className="text-xl font-bold mt-1">{question.text}</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          直感で選んでみてください
        </p>
      </div>

      {/* 回答済みバナー */}
      {answered !== null && (
        <div
          className="rounded-2xl p-4 text-center"
          style={{ background: "#f0f9ff", border: "1.5px solid var(--accent)" }}
        >
          <p className="text-sm font-semibold" style={{ color: "var(--accent)" }}>
            ✅ 今日の回答：「{question.choices[answered].label}」
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
            つながっている人との一致を確認中...
          </p>
        </div>
      )}

      {/* 4択カード */}
      <div className="grid grid-cols-2 gap-3">
        {question.choices.map((choice, index) => {
          const isSelected = selected === index;
          const isAnswered = answered !== null;
          const isChosen = answered === index;

          return (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={isAnswered}
              className="rounded-2xl overflow-hidden text-left"
              style={{
                border: isChosen
                  ? "2.5px solid var(--accent)"
                  : isSelected
                  ? "2.5px solid var(--primary)"
                  : "1.5px solid var(--border)",
                background: "white",
                opacity: isAnswered && !isChosen ? 0.5 : 1,
                transform: isSelected && !isAnswered ? "scale(1.02)" : "scale(1)",
                transition: "transform 0.15s ease, opacity 0.2s ease",
              }}
            >
              {/* 画像エリア */}
              <div className="w-full h-28 relative overflow-hidden" style={{ background: "var(--border)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={choice.imageUrl}
                  alt={choice.label}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {isChosen && (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ background: "rgba(106,159,216,0.35)" }}
                  >
                    <span className="text-3xl">✅</span>
                  </div>
                )}
              </div>
              <div className="px-3 py-2.5">
                <p className="text-sm font-medium">{choice.label}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* 送信ボタン */}
      {answered === null && (
        <button
          onClick={handleSubmit}
          disabled={selected === null || submitting}
          className="w-full rounded-xl py-3 text-sm font-semibold"
          style={{
            background: "var(--primary)",
            color: "white",
            opacity: selected === null || submitting ? 0.5 : 1,
            transition: "opacity 0.2s",
          }}
        >
          {submitting ? "送信中..." : "この答えで決定！"}
        </button>
      )}

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

      {answered !== null && (
        <button
          onClick={() => router.push("/home")}
          className="w-full rounded-xl py-3 text-sm font-semibold"
          style={{ background: "var(--accent)", color: "white" }}
        >
          ホームに戻る
        </button>
      )}
    </div>
  );
}
