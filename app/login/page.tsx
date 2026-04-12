"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type ModalState =
  | { kind: "warn"; remaining: number }
  | { kind: "blocked"; minutes: number }
  | null;

export default function LoginPage() {
  const router = useRouter();
  const studentIdRef = useRef<HTMLInputElement>(null);
  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<ModalState>(null);

  const isValid = studentId.length === 10 && name.trim().length >= 2;

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!isValid) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, name: name.trim() }),
      });
      if (!res.ok) {
        const data: {
          error?: string;
          failCount?: number;
          maxAttempts?: number;
          blocked?: boolean;
          retryAfter?: number;
        } = await res.json();
        setError(data.error ?? "로그인에 실패했습니다.");
        setLoading(false);
        studentIdRef.current?.focus();

        if (data.blocked) {
          setModal({ kind: "blocked", minutes: Math.ceil((data.retryAfter ?? 0) / 60) });
        } else if (data.failCount === 3 && (data.maxAttempts ?? 5) === 5) {
          setModal({ kind: "warn", remaining: 2 });
        } else if (data.failCount && data.maxAttempts && data.failCount >= data.maxAttempts) {
          setModal({ kind: "blocked", minutes: 30 });
        }
        return;
      }
      sessionStorage.setItem("ql_alive", "1");
      router.replace("/");
    } catch {
      setError("네트워크 오류가 발생했습니다.");
      setLoading(false);
    }
  }

  const inputClass = (hasError: boolean) =>
    `w-full border rounded-2xl px-4 py-3.5 text-sm outline-none transition-colors
    ${hasError ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-skku bg-white"}`;

  return (
    <div className="h-[100dvh] flex flex-col items-center justify-center px-6 bg-gray-50">
      {/* 로고 영역 */}
      <div className="mb-8 text-center">
        <Image
          src="/icon-192.png"
          alt="성균관대학교"
          width={140}
          height={140}
          className="mx-auto mb-4"
          style={{ mixBlendMode: "multiply" }}
          priority
        />
        <p className="text-xl text-gray-400 font-medium mb-1">Quant Ledger</p>
      </div>

      {/* 로그인 카드 */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-bold text-gray-900 mb-1">로그인</h2>
        <p className="text-sm text-gray-400 mb-5">이름과 학번을 입력하세요</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="이름"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            className={inputClass(!!error)}
          />
          <input
            ref={studentIdRef}
            type="text"
            inputMode="numeric"
            placeholder="2026000000"
            maxLength={10}
            value={studentId}
            onChange={(e) => {
              setStudentId(e.target.value.replace(/\D/g, ""));
              setError(null);
            }}
            className={inputClass(!!error)}
          />
          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading || !isValid}
            className="w-full py-4 bg-skku text-white font-semibold rounded-2xl text-sm active:scale-95 transition-transform disabled:opacity-50 !mt-4"
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

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModal(null)} />
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="px-6 pt-7 pb-5 text-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  modal.kind === "blocked" ? "bg-red-50" : "bg-amber-50"
                }`}
              >
                <svg
                  className={`w-6 h-6 ${modal.kind === "blocked" ? "text-red-500" : "text-amber-500"}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
              </div>
              <h2 className="text-base font-bold text-gray-900">
                {modal.kind === "blocked" ? "로그인이 제한되었습니다" : "로그인 실패"}
              </h2>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                {modal.kind === "blocked" ? (
                  <>5회 연속 실패로 {modal.minutes}분간<br />로그인이 제한됩니다.</>
                ) : (
                  <>3회 연속 실패했습니다.<br />{modal.remaining}회 더 실패하면 로그인이 30분간 제한됩니다.</>
                )}
              </p>
            </div>
            <button
              onClick={() => setModal(null)}
              className="w-full py-4 text-sm font-semibold text-skku active:bg-gray-50 border-t border-gray-100"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
