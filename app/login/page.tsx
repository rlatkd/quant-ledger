"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

const STUDENT_ID_REGEX = /^20267121\d{2}$/;

export default function LoginPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [studentId, setStudentId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError(null);

    if (!STUDENT_ID_REGEX.test(studentId)) {
      setError("권한이 없습니다.");
      inputRef.current?.focus();
      return;
    }

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
        return;
      }
      router.replace("/");
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-[100dvh] flex flex-col items-center justify-center px-6 bg-gray-50">
      {/* 로고 영역 */}
      <div className="mb-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-skku flex items-center justify-center mx-auto mb-4 shadow-md">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
          </svg>
        </div>
        <p className="text-xl text-gray-400 font-medium mb-1">성균관대학교 퀀트응용경제학과</p>
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
              maxLength={10}
              placeholder="2026000000"
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

      <p className="mt-6 text-xs text-gray-400">퀀트응용경제학과 구성원만 이용할 수 있습니다</p>
    </div>
  );
}
