"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import type { Category } from "../../_lib/types";

interface Props {
  categories: Category[];
  current?: string;
}

export default function CategorySelect({ categories, current }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentLabel = categories.find((c) => c.id === current)?.name ?? "전체";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function select(value: string) {
    setOpen(false);
    router.push(value ? `/receipts?category=${value}` : "/receipts");
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700"
      >
        <span>{currentLabel}</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden z-20">
          <ul className="py-1.5 max-h-60 overflow-y-auto">
            {[{ id: "", name: "전체" }, ...categories].map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => select(cat.id)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors
                    ${cat.id === (current ?? "")
                      ? "text-skku font-semibold bg-skku-light"
                      : "text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
