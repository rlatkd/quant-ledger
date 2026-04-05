"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function NavigationLoader() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  // 경로가 바뀌면 로딩 종료
  useEffect(() => {
    setLoading(false);
  }, [pathname]);

  // <a> 클릭 감지로 로딩 시작
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("/") || href.startsWith("//")) return;

      // 현재 경로와 동일하면 스킵
      if (href.split("?")[0] === pathname) return;

      setLoading(true);
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [pathname]);

  if (!loading) return null;

  return (
    <>
      <div className="fixed inset-0 z-[500] bg-white/50" />
      <div className="fixed inset-0 z-[501] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-7 h-7 border-2 border-skku border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    </>
  );
}
