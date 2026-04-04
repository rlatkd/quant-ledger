"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [studentId, setStudentId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!studentId.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "로그인에 실패했습니다.");
        setLoading(false);
        inputRef.current?.focus();
        return;
      }
      router.replace("/");
    } catch {
      setError("네트워크 오류가 발생했습니다.");
      setLoading(false);
    }
  }

  return (
    <div className="h-[100dvh] flex flex-col items-center justify-center px-6 bg-gray-50">
      {/* 로고 영역 */}
      <div className="mb-8 text-center">
        <Image
          src="/icon-192.png"
          alt="성균관대학교"
          width={140}
          height={140}
          className="mx-auto mb-4" style={{ mixBlendMode: "multiply" }}
          priority
        />
        <p className="text-xl text-gray-400 font-medium mb-1">Quant Ledger</p>
      </div>

      {/* 로그인 카드 */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-bold text-gray-900 mb-1">로그인</h2>
        <p className="text-sm text-gray-400 mb-5">학번을 입력하세요</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              placeholder="2026000000"
              maxLength={10}
              value={studentId}
              onChange={(e) => {
                setStudentId(e.target.value.replace(/\D/g, ""));
                setError(null);
              }}
              className={`w-full border rounded-2xl px-4 py-3.5 text-sm outline-none transition-colors
                ${error ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-skku bg-white"}`}
            />
            {error && (
              <p className="mt-2 text-xs text-red-500">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || studentId.length !== 10}
            className="w-full py-4 bg-skku text-white font-semibold rounded-2xl text-sm active:scale-95 transition-transform disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                로그인 중...
              </span>
            ) : "로그인"}
          </button>
        </form>
      </div>

      <p className="mt-6 text-xs text-gray-400">성균관대학교 퀀트응용경제학과 구성원만 이용할 수 있습니다</p>
    </div>
  );
}
