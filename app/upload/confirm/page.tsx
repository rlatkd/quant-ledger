"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ParsedReceipt, ReceiptItem } from "../../_lib/types";

export default function ConfirmPage() {
  const router = useRouter();
  const [parsed, setParsed] = useState<ParsedReceipt | null>(null);
  const [rawText, setRawText] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("upload_parsed");
    if (!stored) { router.replace("/"); return; }
    const data: ParsedReceipt & { raw_text?: string } = JSON.parse(stored);
    setRawText(data.raw_text ?? "");
    setParsed(data);
  }, [router]);

  function updateItem(index: number, field: keyof ReceiptItem, value: string) {
    if (!parsed) return;
    const items = [...parsed.items];
    const num = Number(value);
    items[index] = {
      ...items[index],
      [field]: isNaN(num) ? value : num,
      total_price:
        field === "quantity"
          ? (isNaN(num) ? items[index].quantity : num) * items[index].unit_price
          : field === "unit_price"
          ? items[index].quantity * (isNaN(num) ? items[index].unit_price : num)
          : items[index].total_price,
    };
    setParsed({ ...parsed, items });
  }

  const itemsTotal = parsed?.items.reduce((s, i) => s + i.total_price, 0) ?? 0;
  const mismatch = parsed && Math.abs(itemsTotal - parsed.total_amount) > 0;

  function handleNext() {
    if (!parsed) return;
    sessionStorage.setItem("upload_parsed", JSON.stringify({ ...parsed, raw_text: rawText }));
    router.push("/upload/category");
  }

  function handleRetake() {
    sessionStorage.removeItem("upload_image");
    sessionStorage.removeItem("upload_parsed");
    router.replace("/");
  }

  if (!parsed) return null;

  return (
    <div className="h-screen flex flex-col max-w-md mx-auto">
      <header className="px-5 pt-12 pb-4 flex items-center justify-between flex-shrink-0">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-base font-bold text-gray-900">내용 확인</h2>
        <button onClick={handleRetake} className="text-sm text-gray-400 active:text-gray-600">
          다시 찍기
        </button>
      </header>

      {/* 고정: 불일치 경고 + 기본 정보 */}
      <div className="px-4 flex-shrink-0 space-y-3 pb-3">
        {mismatch && (
          <div className="flex items-start gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
            </svg>
            <span>항목 합계({itemsTotal.toLocaleString()}원)와 총액({parsed.total_amount.toLocaleString()}원)이 다릅니다</span>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
          <div className="px-4 py-3.5 flex items-center justify-between">
            <span className="text-sm text-gray-500">상호명</span>
            <input
              className="text-sm font-medium text-gray-900 text-right bg-transparent outline-none"
              value={parsed.store_name}
              onChange={(e) => setParsed({ ...parsed, store_name: e.target.value })}
            />
          </div>
          <div className="px-4 py-3.5 flex items-center justify-between">
            <span className="text-sm text-gray-500">날짜</span>
            <input
              type="date"
              className="text-sm font-medium text-gray-900 text-right bg-transparent outline-none"
              value={parsed.receipt_date}
              onChange={(e) => setParsed({ ...parsed, receipt_date: e.target.value })}
            />
          </div>
          <div className="px-4 py-3.5 flex items-center justify-between">
            <span className="text-sm text-gray-500">총액</span>
            <input
              type="number"
              className="text-sm font-bold text-skku text-right bg-transparent outline-none w-32"
              value={parsed.total_amount}
              onChange={(e) => setParsed({ ...parsed, total_amount: Number(e.target.value) })}
            />
          </div>
        </div>
      </div>

      {/* 스크롤: 항목 상세 */}
      <div className="flex-1 min-h-0 px-4 overflow-y-auto pb-4">
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="px-4 py-3 border-b border-gray-50">
            <p className="text-sm font-semibold text-gray-700">항목 상세</p>
          </div>
          <div className="divide-y divide-gray-50">
            {parsed.items.map((item, i) => (
              <div key={i} className="px-4 py-3 space-y-2">
                <input
                  className="text-sm font-medium text-gray-900 w-full bg-transparent outline-none border-b border-transparent focus:border-skku"
                  value={item.menu_name}
                  onChange={(e) => updateItem(i, "menu_name", e.target.value)}
                />
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <input type="number" className="w-10 text-center bg-gray-50 rounded px-1.5 py-1 outline-none" value={item.quantity} onChange={(e) => updateItem(i, "quantity", e.target.value)} />
                  <span>개 ×</span>
                  <input type="number" className="w-20 text-right bg-gray-50 rounded px-1.5 py-1 outline-none" value={item.unit_price} onChange={(e) => updateItem(i, "unit_price", e.target.value)} />
                  <span>원</span>
                  <span className="ml-auto font-semibold text-gray-700">{item.total_price.toLocaleString()}원</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && <p className="mx-4 mb-2 text-sm text-red-500 text-center flex-shrink-0">{error}</p>}
      <div className="px-4 pb-10 pt-4 flex-shrink-0">
        <button
          onClick={handleNext}
          className="w-full py-4 bg-skku text-white font-semibold rounded-2xl active:scale-95 transition-transform"
        >
          다음으로
        </button>
      </div>
    </div>
  );
}
