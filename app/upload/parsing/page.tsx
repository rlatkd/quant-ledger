"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ParsedReceipt } from "../../_lib/types";

export default function ParsingPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const cancelledRef = useRef(false);

  function handleCancel() {
    cancelledRef.current = true;
    abortRef.current?.abort();
    sessionStorage.removeItem("upload_image");
    sessionStorage.removeItem("upload_parsed");
    router.replace("/");
  }

  useEffect(() => {
    const stored = sessionStorage.getItem("upload_image");
    if (!stored) { router.replace("/"); return; }

    const { base64, mimeType } = JSON.parse(stored) as { base64: string; mimeType: string };
    cancelledRef.current = false;
    const controller = new AbortController();
    abortRef.current = controller;

    async function parse() {
      try {
        const res = await fetch(`data:${mimeType};base64,${base64}`);
        const blob = await res.blob();
        const file = new File([blob], "receipt.jpg", { type: mimeType });

        const formData = new FormData();
        formData.append("image", file);

        const apiRes = await fetch("/api/parse", {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });
        if (!apiRes.ok) throw new Error();

        const data: ParsedReceipt & { raw_text?: string } = await apiRes.json();
        if (cancelledRef.current) return;
        sessionStorage.setItem("upload_parsed", JSON.stringify(data));
        router.replace("/upload/confirm");
      } catch (e: unknown) {
        if (cancelledRef.current) return;
        if (e instanceof Error && e.name === "AbortError") return;
        setError("분석에 실패했습니다.");
      }
    }

    parse();
    return () => { cancelledRef.current = true; controller.abort(); };
  }, [router]);

  if (error) {
    return (
      <div className="h-[100dvh] flex flex-col items-center justify-center px-8 gap-5">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>
        <div className="text-center">
          <p className="font-semibold text-gray-900 mb-1">분석 실패</p>
          <p className="text-sm text-gray-400">{error}</p>
        </div>
        <div className="flex gap-3 w-full max-w-xs">
          <button
            onClick={handleCancel}
            className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-600"
          >
            취소
          </button>
          <button
            onClick={() => { setError(null); window.location.reload(); }}
            className="flex-1 py-3 rounded-2xl bg-skku text-sm font-semibold text-white"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] relative flex items-center justify-center">
      {/* 뒤로가기 — absolute로 레이아웃에서 분리 */}
      <header className="absolute top-0 left-0 px-4 pt-12">
        <button
          onClick={handleCancel}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </header>

      <div className="flex flex-col items-center gap-4">
        <div className="w-7 h-7 border-2 border-skku border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 font-medium text-sm">영수증을 분석하는 중...</p>
      </div>
    </div>
  );
}
