"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Browser = "safari" | "chrome" | "samsung" | "edge" | "firefox" | "other";

function isPwa(): boolean {
  if (typeof window === "undefined") return true;
  if ((navigator as Navigator & { standalone?: boolean }).standalone === true) return true;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  return false;
}

function detectBrowser(): Browser {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  if (/SamsungBrowser/i.test(ua)) return "samsung";
  if (/Edg\//i.test(ua)) return "edge";
  if (/Firefox|FxiOS/i.test(ua)) return "firefox";
  if (/Chrome|CriOS/i.test(ua) && !/Edg\//i.test(ua)) return "chrome";
  if (/Safari/i.test(ua) && !/Chrome|CriOS|Android/i.test(ua)) return "safari";
  return "other";
}

type Step = { title: string; desc: string };

const GUIDES: Record<Browser, { subtitle: string; steps: Step[]; footnote?: string }> = {
  safari: {
    subtitle: "Safari에서 아래 순서대로 설치해주세요",
    steps: [
      { title: "하단 공유 버튼 탭", desc: "화면 하단 가운데 공유 아이콘을 누르세요" },
      { title: "홈 화면에 추가 선택", desc: "메뉴를 스크롤해서 항목을 찾으세요" },
      { title: "우측 상단 추가 탭", desc: "추가를 누르면 설치가 완료됩니다" },
    ],
    footnote: "설치 후 홈 화면의 퀀트 장부 아이콘을 탭하세요",
  },
  chrome: {
    subtitle: "Chrome에서 아래 순서대로 설치해주세요",
    steps: [
      { title: "주소창 옆 메뉴 열기", desc: "오른쪽 ⋮ 버튼을 누르세요" },
      { title: "앱 설치 또는 홈 화면에 추가", desc: "메뉴에서 해당 항목을 선택하세요" },
      { title: "설치 완료 후 앱 실행", desc: "홈 화면의 퀀트 장부 아이콘을 탭하세요" },
    ],
  },
  edge: {
    subtitle: "Edge에서 아래 순서대로 설치해주세요",
    steps: [
      { title: "우측 상단 메뉴 열기", desc: "··· 버튼을 누르세요" },
      { title: "앱 → 이 사이트를 앱으로 설치", desc: "메뉴에서 항목을 선택하세요" },
      { title: "설치 후 앱 실행", desc: "설치된 앱에서 퀀트 장부를 여세요" },
    ],
  },
  samsung: {
    subtitle: "삼성 인터넷에서 아래 순서대로 설치해주세요",
    steps: [
      { title: "하단 메뉴 열기", desc: "≡ 버튼을 누르세요" },
      { title: "현재 페이지 추가", desc: "홈 화면에 추가를 선택하세요" },
      { title: "설치 완료 후 앱 실행", desc: "홈 화면의 퀀트 장부 아이콘을 탭하세요" },
    ],
  },
  firefox: {
    subtitle: "Firefox는 PWA 설치가 제한적입니다",
    steps: [
      { title: "Safari 또는 Chrome으로 다시 열기", desc: "권장 브라우저에서 접속해주세요" },
      { title: "iPhone은 Safari", desc: "공유 → 홈 화면에 추가" },
      { title: "Android·PC는 Chrome", desc: "메뉴 → 앱 설치" },
    ],
  },
  other: {
    subtitle: "권장 브라우저에서 다시 열어주세요",
    steps: [
      { title: "iPhone / iPad", desc: "Safari로 접속 후 공유 → 홈 화면에 추가" },
      { title: "Android", desc: "Chrome으로 접속 후 메뉴 → 앱 설치" },
      { title: "PC", desc: "Chrome 또는 Edge에서 주소창 우측 설치 아이콘 클릭" },
    ],
  },
};

function StepList({ steps }: { steps: Step[] }) {
  return (
    <ol className="w-full max-w-xs space-y-2.5">
      {steps.map((s, i) => (
        <li
          key={i}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3.5 flex items-start gap-3 text-left"
        >
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-skku text-white text-xs font-bold flex items-center justify-center mt-0.5">
            {i + 1}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800">{s.title}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.desc}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function PwaGuard() {
  const [blocked, setBlocked] = useState(false);
  const [browser, setBrowser] = useState<Browser>("other");

  useEffect(() => {
    if (!isPwa()) {
      setBrowser(detectBrowser());
      setBlocked(true);
    }
  }, []);

  if (!blocked) return null;

  const guide = GUIDES[browser];

  return (
    <div className="fixed inset-0 z-[999] bg-gray-50 flex flex-col items-center overflow-y-auto px-6 py-10">
      <div className="flex flex-col items-center text-center w-full max-w-xs">
        <Image
          src="/icon-192.png"
          alt="Quant Ledger"
          width={120}
          height={120}
          className="flex-shrink-0"
          style={{ mixBlendMode: "multiply" }}
          priority
        />
        <p className="text-base text-gray-400 font-medium mt-3">Quant Ledger</p>

        <h1 className="text-xl font-bold text-gray-900 mt-8">앱으로 실행해주세요</h1>
        <p className="text-sm text-gray-500 mt-2 mb-6">{guide.subtitle}</p>

        <StepList steps={guide.steps} />

        {guide.footnote && (
          <p className="mt-5 text-xs text-gray-400">{guide.footnote}</p>
        )}
      </div>
    </div>
  );
}
