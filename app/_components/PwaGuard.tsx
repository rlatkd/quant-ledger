"use client";

import { useEffect, useState } from "react";

function isPwa(): boolean {
  if (typeof window === "undefined") return true;
  if ((navigator as Navigator & { standalone?: boolean }).standalone === true) return true;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  return false;
}

function detectOS(): "ios" | "android" | "other" {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "other";
}

function IosGuide() {
  return (
    <div className="w-full max-w-xs space-y-3">
      {/* Step 1 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3.5 flex items-start gap-3">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-skku text-white text-xs font-bold flex items-center justify-center mt-0.5">1</span>
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-0.5">Safari 하단 공유 버튼 탭</p>
          <p className="text-xs text-gray-400">화면 하단 가운데 아이콘을 누르세요</p>
          {/* Safari share icon */}
          <div className="mt-2 flex items-center gap-1.5">
            <div className="bg-gray-100 rounded-xl px-3 py-2 flex items-center gap-1.5">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15M12 3v12.75m0-12.75-3 3m3-3 3 3" />
              </svg>
              <span className="text-xs text-blue-500 font-medium">공유</span>
            </div>
          </div>
        </div>
      </div>

      {/* Step 2 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3.5 flex items-start gap-3">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-skku text-white text-xs font-bold flex items-center justify-center mt-0.5">2</span>
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-0.5">홈 화면에 추가 선택</p>
          <p className="text-xs text-gray-400">스크롤해서 아래 항목을 찾으세요</p>
          <div className="mt-2 bg-gray-100 rounded-xl px-3 py-2 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className="text-xs text-gray-700 font-medium">홈 화면에 추가</span>
          </div>
        </div>
      </div>

      {/* Step 3 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3.5 flex items-start gap-3">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-skku text-white text-xs font-bold flex items-center justify-center mt-0.5">3</span>
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-0.5">추가 탭</p>
          <p className="text-xs text-gray-400">우측 상단 <strong>추가</strong>를 누르면 설치 완료</p>
        </div>
      </div>
    </div>
  );
}

function AndroidGuide() {
  return (
    <div className="w-full max-w-xs space-y-3">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3.5 flex items-start gap-3">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-skku text-white text-xs font-bold flex items-center justify-center mt-0.5">1</span>
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-0.5">Chrome 메뉴 열기</p>
          <p className="text-xs text-gray-400">주소창 오른쪽 <strong>⋮</strong> 버튼을 누르세요</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3.5 flex items-start gap-3">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-skku text-white text-xs font-bold flex items-center justify-center mt-0.5">2</span>
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-0.5">앱 설치 또는 홈 화면에 추가</p>
          <p className="text-xs text-gray-400">메뉴에서 해당 항목을 선택하세요</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3.5 flex items-start gap-3">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-skku text-white text-xs font-bold flex items-center justify-center mt-0.5">3</span>
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-0.5">설치 완료 후 앱 실행</p>
          <p className="text-xs text-gray-400">홈 화면의 퀀트 장부 아이콘을 탭하세요</p>
        </div>
      </div>
    </div>
  );
}

function OtherGuide() {
  return (
    <div className="w-full max-w-xs bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100 text-left text-sm">
      <div className="flex items-start gap-3 px-4 py-3.5">
        <span className="text-lg mt-0.5">🍎</span>
        <div>
          <p className="font-semibold text-gray-800">iPhone / iPad</p>
          <p className="text-gray-400 text-xs mt-0.5">Safari → 공유 버튼 → 홈 화면에 추가</p>
        </div>
      </div>
      <div className="flex items-start gap-3 px-4 py-3.5">
        <span className="text-lg mt-0.5">🤖</span>
        <div>
          <p className="font-semibold text-gray-800">Android</p>
          <p className="text-gray-400 text-xs mt-0.5">Chrome → 메뉴(⋮) → 앱 설치 또는 홈 화면에 추가</p>
        </div>
      </div>
      <div className="flex items-start gap-3 px-4 py-3.5">
        <span className="text-lg mt-0.5">💻</span>
        <div>
          <p className="font-semibold text-gray-800">PC</p>
          <p className="text-gray-400 text-xs mt-0.5">Chrome 주소창 오른쪽 설치 아이콘 클릭</p>
        </div>
      </div>
    </div>
  );
}

export default function PwaGuard() {
  const [blocked, setBlocked] = useState(false);
  const [os, setOs] = useState<"ios" | "android" | "other">("other");

  useEffect(() => {
    if (!isPwa()) {
      setOs(detectOS());
      setBlocked(true);
    }
  }, []);

  if (!blocked) return null;

  const subtitle =
    os === "ios"
      ? "Safari에서 아래 순서대로 설치해주세요"
      : os === "android"
      ? "Chrome에서 아래 순서대로 설치해주세요"
      : "설치된 앱에서만 사용할 수 있습니다";

  return (
    <div className="fixed inset-0 z-[999] bg-gray-50 flex flex-col items-center justify-center px-6 text-center overflow-y-auto py-10">
      <div className="w-20 h-20 rounded-3xl bg-skku flex items-center justify-center mb-5 shadow-lg flex-shrink-0">
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3m-3 3.75h3M9.75 17.25h4.5" />
        </svg>
      </div>

      <h1 className="text-xl font-bold text-gray-900 mb-1.5">앱으로 실행해주세요</h1>
      <p className="text-sm text-gray-500 leading-relaxed mb-6">{subtitle}</p>

      {os === "ios" && <IosGuide />}
      {os === "android" && <AndroidGuide />}
      {os === "other" && <OtherGuide />}

      {os === "ios" && (
        <p className="mt-6 text-xs text-gray-400">
          설치 후 홈 화면의 <strong>퀀트 장부</strong> 아이콘을 탭하세요
        </p>
      )}
    </div>
  );
}
