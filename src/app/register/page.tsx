"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) {
        setError(data.error || "登録に失敗しました");
        return;
      }

      // 登録後すぐにログイン
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("ログインに失敗しました。ログインページからお試しください。");
      } else {
        router.push("/home");
      }
    } catch {
      setError("通信エラーが発生しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "var(--background)" }}>
      {/* ロゴ */}
      <div className="mb-8 text-center">
        <div className="text-4xl mb-3">🌉</div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
          Cross Border
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          疎遠になった人と、また話すきっかけを
        </p>
      </div>

      {/* フォーム */}
      <div
        className="w-full max-w-sm rounded-2xl p-6 shadow-sm"
        style={{ background: "white", border: "1.5px solid var(--border)" }}
      >
        <h2 className="font-semibold text-lg mb-5">新規登録</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              ニックネーム
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
              style={{ border: "1.5px solid var(--border)", background: "var(--background)" }}
              placeholder="山田 太郎"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
              style={{ border: "1.5px solid var(--border)", background: "var(--background)" }}
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
              style={{ border: "1.5px solid var(--border)", background: "var(--background)" }}
              placeholder="6文字以上"
              minLength={6}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-3 text-sm font-semibold transition-opacity"
            style={{
              background: "var(--primary)",
              color: "white",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "登録中..." : "アカウントを作成"}
          </button>
        </form>

        <p className="text-center text-sm mt-4" style={{ color: "var(--muted)" }}>
          すでにアカウントがある方は{" "}
          <Link href="/login" className="font-medium" style={{ color: "var(--accent)" }}>
            ログイン
          </Link>
        </p>
      </div>
    </div>
  );
}
