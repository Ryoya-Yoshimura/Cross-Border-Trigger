"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

const SNS_META: { key: string; label: string; icon: string }[] = [
  { key: "xUrl",         label: "X",        icon: "𝕏" },
  { key: "lineUrl",      label: "LINE",     icon: "💬" },
  { key: "instagramUrl", label: "Instagram",icon: "📷" },
  { key: "facebookUrl",  label: "Facebook", icon: "📘" },
  { key: "threadsUrl",   label: "Threads",  icon: "🧵" },
];

export default function ProfilePage() {
  const { user: currentUser } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [targetUser, setTargetUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (!currentUser) return;
      try {
        const token = await currentUser.getIdToken();
        const res = await fetch(`/api/profile/${params.id}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setTargetUser(data.user);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [params.id, currentUser]);

  if (loading || !currentUser) return <div className="p-8 text-center text-sm text-muted">読み込み中...</div>;
  if (!targetUser) return <div className="p-8 text-center text-sm text-muted">ユーザーが見つかりません</div>;

  const isOwn = targetUser.id === currentUser.uid;
  const avatarChar = targetUser.name?.slice(0, 1) ?? "?";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-sm" style={{ color: "var(--muted)" }}>← 戻る</button>
        {isOwn && (
          <Link href="/profile/edit" className="ml-auto text-sm font-medium" style={{ color: "var(--accent)" }}>
            編集
          </Link>
        )}
      </div>

      {/* プロフィールカード */}
      <div
        className="rounded-2xl p-6 flex flex-col items-center gap-3 text-center"
        style={{ background: "white", border: "1.5px solid var(--border)" }}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white"
          style={{ background: "var(--primary)" }}
        >
          {avatarChar}
        </div>
        <p className="font-bold text-xl">{targetUser.name}</p>
        {targetUser.bio && (
          <p className="text-sm" style={{ color: "var(--muted)" }}>一言：{targetUser.bio}</p>
        )}
      </div>

      {/* SNS */}
      <div
        className="rounded-2xl p-5 space-y-3"
        style={{ background: "white", border: "1.5px solid var(--border)" }}
      >
        <div className="grid grid-cols-2 gap-2">
          {SNS_META.map(({ key, label, icon }) => {
            const url = targetUser[key];
            return (
              <div key={key} className="flex items-center gap-2 text-sm">
                <span>{icon}</span>
                <span className="w-20 shrink-0" style={{ color: "var(--muted)" }}>{label}</span>
                <span>：</span>
                {url ? (
                  <a href={url} target="_blank" rel="noopener noreferrer" className="font-medium truncate" style={{ color: "var(--accent)" }}>
                    開く
                  </a>
                ) : (
                  <span style={{ color: "var(--muted)" }}>—</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 統計 */}
      <div
        className="rounded-2xl p-5 grid grid-cols-3 text-center gap-2"
        style={{ background: "white", border: "1.5px solid var(--border)" }}
      >
        {isOwn ? (
          <>
            <div>
              <p className="text-2xl font-bold" style={{ color: "var(--accent)" }}>{targetUser.answerCount}</p>
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>回答した日</p>
            </div>
          </>
        ) : (
          <>
            <div>
              <p className="text-2xl font-bold" style={{ color: "var(--accent)" }}>{targetUser.matchCount}</p>
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>一致した日</p>
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: "var(--accent)" }}>{targetUser.answerCount}</p>
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>回答した日</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
