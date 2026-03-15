"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

type Choice = { label: string; imageUrl?: string; subtext?: string; emoji?: string; gradient?: string };
type Question = { id: string; date: string; sourceType?: string; text: string; choices: Choice[] };

export default function DailyPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answered, setAnswered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [poppingIndex, setPoppingIndex] = useState<number | null>(null);

  const fetchQuestion = async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/questions", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setQuestion(data.question);
      setGenerating(data.generating ?? false);
      setAnswered(data.answered);
      if (data.answered !== null) setSelected(data.answered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchQuestion();
  }, [user]);

  // 生成中は5秒ごとにポーリング
  useEffect(() => {
    if (!generating || !user) return;
    const timer = setInterval(async () => {
      const token = await user.getIdToken();
      fetch("/api/questions", {
        headers: { "Authorization": `Bearer ${token}` }
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.question) {
            setQuestion(data.question);
            setGenerating(false);
            setAnswered(data.answered);
          }
        });
    }, 5000);
    return () => clearInterval(timer);
  }, [generating, user]);

  const handleSelect = (index: number) => {
    if (answered !== null) return;
    setSelected(index);
    setPoppingIndex(index);
    setTimeout(() => setPoppingIndex(null), 300);
  };

  const handleSubmit = async () => {
    if (selected === null || !question || !user) return;
    setSubmitting(true);
    setError("");

    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ questionId: question.id, choiceIndex: selected }),
      });

      const data = await res.json();
      if (res.ok) {
        setAnswered(selected);
      } else {
        setError(data.error || "送信に失敗しました");
      }
    } catch (err) {
      setError("通信エラーが発生しました");
    } finally {
      setSubmitting(false);
    }
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
    if (generating) {
      return (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-4xl animate-pulse">📰</div>
          <p className="font-semibold">今日のニュースから質問を生成中...</p>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            しばらくお待ちください（約1分）
          </p>
        </div>
      );
    }
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
          className="rounded-2xl p-4 text-center animate-slide-in"
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
              aria-pressed={isSelected}
              aria-label={`${choice.label}を選ぶ${isChosen ? "（選択済み）" : ""}`}
              className={`rounded-2xl overflow-hidden text-left${poppingIndex === index ? " animate-card-pop" : ""}`}
              style={{
                border: isChosen
                  ? "2.5px solid var(--accent)"
                  : isSelected
                  ? "2.5px solid var(--primary)"
                  : "1.5px solid var(--border)",
                background: "white",
                opacity: isAnswered && !isChosen ? 0.5 : 1,
                transition: "opacity 0.2s ease",
              }}
            >
              {/* 画像エリア */}
              <div
                className="w-full h-28 relative overflow-hidden flex items-center justify-center"
                style={{ background: choice.gradient ?? "var(--border)" }}
              >
                {choice.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={choice.imageUrl}
                    alt={choice.label}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-5xl select-none" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}>
                    {choice.emoji ?? "📰"}
                  </span>
                )}
                {isChosen && (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ background: "rgba(106,159,216,0.45)" }}
                  >
                    <span className="text-3xl">✅</span>
                  </div>
                )}
              </div>
              <div className="px-3 py-2.5">
                <p className="text-sm font-medium">{choice.label}</p>
                {choice.subtext && (
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                    {choice.subtext}
                  </p>
                )}
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
