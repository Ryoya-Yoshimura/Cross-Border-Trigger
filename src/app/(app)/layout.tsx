"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [dailyAnswered, setDailyAnswered] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function checkDailyAnswer() {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/questions", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        setDailyAnswered(data.answered !== null);
      } catch (err) {
        console.error(err);
      }
    }
    
    // 特定のページ遷移時や定期的にチェックする
    checkDailyAnswer();
  }, [user, pathname]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-sm text-muted">Loading...</div>;
  }

  if (!user) return null;

  return (
    <>
      <Header />
      <main className="max-w-lg mx-auto px-4 py-6 pb-24">{children}</main>
      <BottomNav dailyAnswered={dailyAnswered} />
    </>
  );
}
