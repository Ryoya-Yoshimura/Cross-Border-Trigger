"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session) return null;

  const navItems = [
    { href: "/home", label: "ホーム", icon: "🏠" },
    { href: "/daily", label: "今日の質問", icon: "✨" },
    { href: "/connections", label: "つながり", icon: "👥" },
    { href: "/invite", label: "招待", icon: "💌" },
  ];

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        background: "white",
        borderColor: "var(--border)",
      }}
    >
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/home" className="font-bold text-lg" style={{ color: "var(--primary)" }}>
          Cross Border
        </Link>
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-1.5 rounded-lg text-sm transition-colors"
              style={{
                background: pathname === item.href ? "var(--primary-light)" : "transparent",
                color: pathname === item.href ? "var(--primary)" : "var(--muted)",
                fontWeight: pathname === item.href ? 600 : 400,
              }}
            >
              {item.label}
            </Link>
          ))}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="ml-2 text-xs px-2 py-1 rounded"
            style={{ color: "var(--muted)" }}
          >
            ログアウト
          </button>
        </nav>
      </div>
    </header>
  );
}
