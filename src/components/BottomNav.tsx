"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  icon: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/home", label: "ホーム", icon: "🏠" },
  { href: "/daily", label: "今日", icon: "✨" },
  { href: "/connections", label: "つながり", icon: "👥" },
  { href: "/invite", label: "招待", icon: "💌" },
];

export function BottomNav({ dailyAnswered }: { dailyAnswered: boolean }) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t"
      style={{ background: "white", borderColor: "var(--border)" }}
    >
      <div className="max-w-lg mx-auto flex">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const showBadge = item.href === "/daily" && !dailyAnswered;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 relative"
              style={{ color: isActive ? "var(--primary)" : "var(--muted)" }}
            >
              <span className="relative leading-none">
                <span className="text-xl">{item.icon}</span>
                {showBadge && (
                  <span
                    className="absolute -top-0.5 -right-1.5 w-2 h-2 rounded-full"
                    style={{ background: "var(--primary)" }}
                  />
                )}
              </span>
              <span className="text-xs" style={{ fontWeight: isActive ? 600 : 400 }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
