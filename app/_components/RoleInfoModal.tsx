"use client";

import { useEffect, useState } from "react";

const NOTICED_KEY = "ql_role_noticed";

export default function RoleInfoModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem(NOTICED_KEY)) {
      setOpen(true);
    }
  }, []);

  function handleConfirm() {
    sessionStorage.setItem(NOTICED_KEY, "1");
    setOpen(false);
  }

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[200] bg-black/30" />
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[210] bg-white rounded-3xl shadow-2xl overflow-hidden max-w-sm mx-auto">
        <div className="px-6 py-7 text-center">
          <div className="w-12 h-12 rounded-full bg-skku-light flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-skku" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>
          </div>
          <h2 className="text-base font-bold text-gray-900 mb-2">조회 전용 계정</h2>
          <p className="text-sm text-gray-400 leading-relaxed mb-6">
            영수증 조회만 가능합니다.<br />등록 · 수정 · 삭제는<br />관리자만 이용할 수 있습니다.
          </p>
          <button
            onClick={handleConfirm}
            className="w-full py-3.5 bg-skku text-white font-semibold rounded-2xl text-sm active:scale-95 transition-transform"
          >
            확인
          </button>
        </div>
      </div>
    </>
  );
}
