"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Choice = { label: string; imageUrl: string };
type Question = { id: string; date: string; choices: Choice[] };

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
      <div>
        <p className="text-xs font-medium" style={{ color: "var(--muted)" }}>
          今日の質問
        </p>
        <h1 className="text-xl font-bold mt-0.5">
          今の気分に近いのはどれ？
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          直感で選んでみてください
        </p>
      </div>

      {/* 回答済み表示 */}
      {answered !== null && (
        <div
          className="rounded-2xl p-4 text-center"
          style={{ background: "var(--accent-light)", border: "1.5px solid var(--accent)" }}
        >
          <p className="text-sm font-semibold" style={{ color: "var(--accent)" }}>
            ✅ 今日の回答は「{question.choices[answered].label}」でした
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
          const isCorrect = answered === index;

          return (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={isAnswered}
              className="rounded-2xl overflow-hidden text-left transition-all"
              style={{
                border: isCorrect
                  ? "2.5px solid var(--accent)"
                  : isSelected
                  ? "2.5px solid var(--primary)"
                  : "1.5px solid var(--border)",
                background: "white",
                opacity: isAnswered && !isCorrect ? 0.6 : 1,
                transform: isSelected && !isAnswered ? "scale(1.02)" : "scale(1)",
              }}
            >
              {/* 画像エリア（ダミー） */}
              <div
                className="w-full h-28 flex items-center justify-center text-4xl"
                style={{
                  background: getGradient(index),
                }}
              >
                {getEmoji(index)}
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
          className="w-full rounded-xl py-3 text-sm font-semibold transition-opacity"
          style={{
            background: "var(--primary)",
            color: "white",
            opacity: selected === null || submitting ? 0.5 : 1,
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

function getGradient(index: number) {
  const gradients = [
    "linear-gradient(135deg, #fde8e4, #f87c6a)",
    "linear-gradient(135deg, #e4f0fd, #6a9fd8)",
    "linear-gradient(135deg, #e8fde4, #6ad87c)",
    "linear-gradient(135deg, #fde4f8, #d86ac8)",
  ];
  return gradients[index];
}

function getEmoji(index: number) {
  const emojis = ["🌸", "🌊", "🌿", "🌙"];
  return emojis[index];
}
