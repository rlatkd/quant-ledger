"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

function getSessionExpiry(): number | null {
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith("ql_session_exp="));
  if (!match) return null;
  const val = Number(match.split("=")[1]);
  return isNaN(val) ? null : val;
}

export default function SessionGuard() {
  const pathname = usePathname();
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (pathname === "/login") return;

    function schedule() {
      const exp = getSessionExpiry();
      if (!exp) {
        setExpired(true);
        return;
      }
      const msLeft = exp - Date.now();
      if (msLeft <= 0) {
        setExpired(true);
        return;
      }
      const timer = setTimeout(() => setExpired(true), msLeft);
      return timer;
    }

    const timer = schedule();
    return () => { if (timer) clearTimeout(timer); };
  }, [pathname]);

  if (!expired) return null;

  return (
    <>
      {/* Dim overlay — 뒤 화면 차단 */}
      <div className="fixed inset-0 z-[200] bg-black/50" />

      {/* 만료 모달 */}
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[210] bg-white rounded-3xl shadow-2xl overflow-hidden max-w-sm mx-auto">
        <div className="px-6 py-7 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <h2 className="text-base font-bold text-gray-900 mb-2">세션이 만료되었습니다</h2>
          <p className="text-sm text-gray-400 mb-6">보안을 위해 다시 로그인해주세요.</p>
          <button
            onClick={() => { window.location.href = "/login"; }}
            className="w-full py-3.5 bg-skku text-white font-semibold rounded-2xl text-sm active:scale-95 transition-transform"
          >
            확인
          </button>
        </div>
      </div>
    </>
  );
}
