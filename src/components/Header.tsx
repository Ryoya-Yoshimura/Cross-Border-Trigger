"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function Header() {
  const { data: session } = useSession();

  if (!session) return null;

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{ background: "white", borderColor: "var(--border)" }}
    >
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/home" className="font-bold text-lg" style={{ color: "var(--primary)" }}>
          🌉 Cross Border
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-xs px-3 py-1.5 rounded-lg"
          style={{ color: "var(--muted)", border: "1px solid var(--border)" }}
        >
          ログアウト
        </button>
      </div>
    </header>
  );
}
