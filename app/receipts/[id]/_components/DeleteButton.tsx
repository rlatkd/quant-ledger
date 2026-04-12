"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteButton({ id, disabled = false }: { id: string; disabled?: boolean }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/receipts/${id}`, { method: "DELETE" });
    router.push("/receipts");
  }

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        disabled={disabled}
        aria-label={disabled ? "관리자만 삭제할 수 있습니다" : "영수증 삭제"}
        className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 active:bg-red-50 transition-colors disabled:opacity-40 disabled:active:bg-gray-100 disabled:cursor-not-allowed"
      >
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
        </svg>
      </button>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          {/* 딤 배경 */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !deleting && setModalOpen(false)}
          />

          {/* 모달 */}
          <div className="relative w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-xl">
            <div className="px-6 pt-7 pb-5 text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </div>
              <h2 className="text-base font-bold text-gray-900">영수증을 삭제할까요?</h2>
              <p className="text-sm text-gray-400 mt-1.5">삭제한 영수증은 복구할 수 없습니다.</p>
            </div>

            <div className="flex border-t border-gray-100">
              <button
                onClick={() => setModalOpen(false)}
                disabled={deleting}
                className="flex-1 py-4 text-sm font-medium text-gray-500 active:bg-gray-50 transition-colors border-r border-gray-100"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-4 text-sm font-semibold text-red-500 active:bg-red-50 transition-colors disabled:opacity-60"
              >
                {deleting ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
