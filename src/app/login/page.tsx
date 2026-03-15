"use client";

import { Suspense, useState } from "react";
// useSearchParams requires Suspense boundary
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/home";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push(callbackUrl);
    } catch (err: any) {
      console.error(err);
      setError("メールアドレスまたはパスワードが正しくありません");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "var(--background)" }}>
      {/* ロゴ */}
      <div className="mb-8 text-center">
        <Image src="/icon.png" alt="Cross-Border-Trigger" width={80} height={80} className="mx-auto mb-3 rounded-2xl" />
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
          Cross-Border-Trigger
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
        <h2 className="font-semibold text-lg mb-5">ログイン</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
              style={{
                border: "1.5px solid var(--border)",
                background: "var(--background)",
              }}
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
              style={{
                border: "1.5px solid var(--border)",
                background: "var(--background)",
              }}
              placeholder="••••••••"
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
            {loading ? "ログイン中..." : "ログイン"}
          </button>
        </form>

        <p className="text-center text-sm mt-4" style={{ color: "var(--muted)" }}>
          アカウントがない方は{" "}
          <Link href="/register" className="font-medium" style={{ color: "var(--accent)" }}>
            新規登録
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
