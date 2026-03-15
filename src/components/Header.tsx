"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

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
          onClick={handleLogout}
          className="text-xs px-3 py-1.5 rounded-lg"
          style={{ color: "var(--muted)", border: "1px solid var(--border)" }}
        >
          ログアウト
        </button>
      </div>
    </header>
  );
}
