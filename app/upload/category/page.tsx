"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Category, ParsedReceipt } from "../../_lib/types";

export default function CategoryPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [addingNew, setAddingNew] = useState(false);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("upload_parsed");
    if (!stored) { router.replace("/"); return; }

    fetch("/api/categories")
      .then((r) => r.json())
      .then((data: Category[]) => setCategories(data))
      .catch(() => setError("카테고리를 불러오지 못했습니다."));
  }, [router]);

  async function handleCreateCategory() {
    if (!newName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "오류");
      }
      const created: Category = await res.json();
      setCategories((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setSelectedId(created.id);
      setNewName("");
      setAddingNew(false);
    } catch {
      setError("카테고리 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setCreating(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      // 새 카테고리 입력 중이면 먼저 생성
      let resolvedId = selectedId;
      if (addingNew && newName.trim()) {
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newName.trim() }),
        });
        if (!res.ok) throw new Error();
        const created: Category = await res.json();
        resolvedId = created.id;
      }

      const stored = sessionStorage.getItem("upload_parsed");
      if (!stored) throw new Error();
      const parsed: ParsedReceipt & { raw_text?: string } = JSON.parse(stored);

      const imgStored = sessionStorage.getItem("upload_image");
      const imageUrl = imgStored
        ? `data:image/jpeg;base64,${(JSON.parse(imgStored) as { base64: string }).base64}`
        : "";

      const res = await fetch("/api/receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsed,
          raw_text: parsed.raw_text ?? "",
          image_url: imageUrl,
          category_id: resolvedId,
        }),
      });
      if (!res.ok) throw new Error();

      sessionStorage.removeItem("upload_image");
      sessionStorage.removeItem("upload_parsed");
      router.push("/");
      router.refresh();
    } catch {
      setError("저장에 실패했습니다. 다시 시도해주세요.");
      setSaving(false);
    }
  }

  return (
    <div className="h-[100dvh] flex flex-col max-w-md mx-auto">
      <header className="px-5 pt-12 pb-4 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-base font-bold text-gray-900 flex-1">카테고리 선택</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-sm font-medium text-gray-400 active:text-gray-600 disabled:opacity-40"
        >
          건너뛰기
        </button>
      </header>

      <div className="flex-1 px-4 overflow-y-auto pb-4">
        <p className="text-sm text-gray-400 mb-4">이 영수증이 속할 카테고리를 선택하세요</p>

        <div className="space-y-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedId(cat.id === selectedId ? null : cat.id)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border transition-colors text-left
                ${selectedId === cat.id
                  ? "border-skku bg-skku-light"
                  : "border-gray-100 bg-white active:bg-gray-50"
                }`}
            >
              <span className={`text-sm font-medium ${selectedId === cat.id ? "text-skku-dark" : "text-gray-800"}`}>
                {cat.name}
              </span>
              {selectedId === cat.id && (
                <svg className="w-4 h-4 text-skku flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}

          {/* 새 카테고리 추가 */}
          {addingNew ? (
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-skku bg-white">
              <input
                autoFocus
                className="flex-1 text-sm outline-none bg-transparent placeholder-gray-300"
                placeholder="카테고리 이름"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleCreateCategory(); if (e.key === "Escape") { setAddingNew(false); setNewName(""); }}}
              />
              <button
                onClick={() => { setAddingNew(false); setNewName(""); }}
                className="text-gray-300 active:text-gray-500"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
              <button
                onClick={handleCreateCategory}
                disabled={!newName.trim() || creating}
                className="text-skku disabled:opacity-40"
              >
                {creating ? (
                  <div className="w-4 h-4 border-2 border-skku border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAddingNew(true)}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-dashed border-gray-200 text-gray-400 active:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm">새 카테고리 추가</span>
            </button>
          )}
        </div>

        {error && <p className="mt-3 text-sm text-red-500 text-center">{error}</p>}
      </div>

      <div className="px-4 pb-10 pt-2 flex-shrink-0">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 bg-skku text-white font-semibold rounded-2xl active:scale-95 transition-transform disabled:opacity-60"
        >
          {saving ? "저장 중..." : "저장하기"}
        </button>
      </div>
    </div>
  );
}
