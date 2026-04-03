"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import UploadSheet from "./UploadSheet";

export default function BottomNav() {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);

  const isHome = pathname === "/";
  const isList = pathname.startsWith("/receipts");
  const isUpload = pathname.startsWith("/upload");
  const isLogin = pathname === "/login";

  if (isUpload || isLogin) return null;

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-md mx-auto flex items-center justify-around h-16 px-6">
          {/* 홈 */}
          <Link
            href="/"
            className={`flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${
              isHome ? "text-skku" : "text-gray-400"
            }`}
          >
            <svg
              className="w-6 h-6"
              fill={isHome ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth={1.8}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m3 12 2-2m0 0 7-7 7 7M5 10v10a1 1 0 0 0 1 1h3m10-11 2 2m-2-2v10a1 1 0 0 1-1 1h-3m-6 0a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1m-6 0h6" />
            </svg>
            홈
          </Link>

          {/* 추가 버튼 */}
          <button
            onClick={() => setSheetOpen(true)}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-skku shadow-lg -mt-6 active:scale-95 transition-transform cursor-pointer"
          >
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>

          {/* 목록 */}
          <Link
            href="/receipts"
            className={`flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${
              isList ? "text-skku" : "text-gray-400"
            }`}
          >
            <svg
              className="w-6 h-6"
              fill={isList ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth={1.8}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            목록
          </Link>
        </div>
      </nav>

      <UploadSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  );
}
