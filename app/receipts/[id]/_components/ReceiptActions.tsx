"use client";

import { useState } from "react";
import type { Receipt } from "../../../_lib/types";
import ExportSheet from "./ExportSheet";

interface Props {
  receipt: Receipt;
}

export default function ReceiptActions({ receipt }: Props) {
  const [imgOpen, setImgOpen] = useState(false);

  return (
    <>
      <div className="flex gap-3 px-4 pb-8 pt-4">
        {/* 원본 이미지 보기 */}
        <button
          onClick={() => setImgOpen(true)}
          disabled={!receipt.image_url}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 active:bg-gray-50 transition-colors disabled:opacity-40"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
          원본 이미지
        </button>

        {/* 파일 내보내기 */}
        <ExportSheet receipt={receipt} />
      </div>

      {/* 이미지 모달 */}
      {imgOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-4"
          onClick={() => setImgOpen(false)}
        >
          <div className="relative max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="absolute -top-10 right-0 left-0 flex items-center justify-between">
              <button
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = receipt.image_url;
                  link.download = `receipt-${receipt.store_name}-${receipt.receipt_date}.jpg`;
                  link.click();
                }}
                className="text-white/70 text-sm flex items-center gap-1 active:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                저장
              </button>
              <button
                onClick={() => setImgOpen(false)}
                className="text-white/70 text-sm active:text-white transition-colors"
              >
                닫기
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={receipt.image_url} alt="영수증 원본" className="w-full rounded-2xl" />
          </div>
        </div>
      )}
    </>
  );
}
