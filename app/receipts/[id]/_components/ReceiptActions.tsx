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
      <div className="flex gap-3 px-4 pb-8 pt-2">
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
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setImgOpen(false)}
        >
          <div className="relative max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setImgOpen(false)}
              className="absolute -top-10 right-0 text-white/70 text-sm"
            >
              닫기
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={receipt.image_url} alt="영수증 원본" className="w-full rounded-2xl" />
          </div>
        </div>
      )}
    </>
  );
}
