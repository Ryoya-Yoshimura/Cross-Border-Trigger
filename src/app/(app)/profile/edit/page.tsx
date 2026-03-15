"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type ProfileForm = {
  bio: string;
  xUrl: string;
  lineUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  threadsUrl: string;
};

export default function ProfileEditPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<ProfileForm>({
    bio: "", xUrl: "", lineUrl: "", instagramUrl: "", facebookUrl: "", threadsUrl: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      const token = await user.getIdToken();
      const r = await fetch("/api/profile/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await r.json();
      if (!data) return;
      setForm({
        bio: data.bio ?? "",
        xUrl: data.xUrl ?? "",
        lineUrl: data.lineUrl ?? "",
        instagramUrl: data.instagramUrl ?? "",
        facebookUrl: data.facebookUrl ?? "",
        threadsUrl: data.threadsUrl ?? "",
      });
    }
    fetchProfile();
  }, [user]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    const token = await user.getIdToken();
    const res = await fetch("/api/profile", { 
      method: "PATCH", 
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }, 
      body: JSON.stringify(form) 
    });
    const data = await res.json();
    console.log("[profile save]", res.status, data);
    setSaving(false);
    if (!res.ok) {
      alert("保存に失敗しました: " + JSON.stringify(data));
      return;
    }
    router.refresh();
    router.push("/home");
  }

  const snsFields: { key: keyof ProfileForm; label: string; placeholder: string }[] = [
    { key: "xUrl",         label: "X",         placeholder: "https://x.com/username" },
    { key: "lineUrl",      label: "LINE",       placeholder: "https://line.me/ti/p/~id" },
    { key: "instagramUrl", label: "Instagram",  placeholder: "https://instagram.com/username" },
    { key: "facebookUrl",  label: "Facebook",   placeholder: "https://facebook.com/username" },
    { key: "threadsUrl",   label: "Threads",    placeholder: "https://threads.net/@username" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-sm" style={{ color: "var(--muted)" }}>← 戻る</button>
        <h1 className="font-bold text-lg">プロフィール編集</h1>
      </div>

      {/* アバター */}
      <div className="flex flex-col items-center gap-2">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white"
          style={{ background: "var(--primary)" }}
        >
          {user?.displayName?.slice(0, 1) ?? "?"}
        </div>
        <p className="font-semibold">{user?.displayName}</p>
      </div>

      {/* 一言 */}
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: "var(--muted)" }}>一言</label>
        <textarea
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          placeholder="自己紹介や一言を入力..."
          rows={3}
          className="w-full rounded-xl px-4 py-3 text-sm"
          style={{ border: "1.5px solid var(--border)", outline: "none", resize: "none", background: "white" }}
        />
      </div>

      {/* SNS */}
      <div className="space-y-3">
        <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>SNSリンク</p>
        {snsFields.map(({ key, label, placeholder }) => (
          <div key={key} className="flex items-center gap-3">
            <span className="text-sm font-medium w-20 shrink-0">{label}</span>
            <input
              type="url"
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              placeholder={placeholder}
              className="flex-1 rounded-xl px-4 py-2 text-sm"
              style={{ border: "1.5px solid var(--border)", outline: "none", background: "white" }}
            />
          </div>
        ))}
      </div>

      {/* 保存ボタン */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full rounded-2xl py-4 font-bold text-white text-sm"
        style={{ background: saving ? "var(--muted)" : "var(--primary)" }}
      >
        {saving ? "保存中..." : "保存する"}
      </button>
    </div>
  );
}
