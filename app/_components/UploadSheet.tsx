"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ParsedReceipt, ReceiptItem } from "../_lib/types";

type Step = "select" | "pre-confirm" | "parsing" | "confirm";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function UploadSheet({ open, onClose }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("select");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [rawText, setRawText] = useState("");
  const [parsed, setParsed] = useState<ParsedReceipt | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);

  function handleClose() {
    setStep("select");
    setImageFile(null);
    setPreview(null);
    setRawText("");
    setParsed(null);
    setError(null);
    setSaving(false);
    onClose();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setError(null);
    setStep("pre-confirm");
  }

  async function handleStartParse() {
    if (!imageFile) return;
    setStep("parsing");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      const res = await fetch("/api/parse", { method: "POST", body: formData });
      if (!res.ok) throw new Error();

      const data: ParsedReceipt & { raw_text?: string } = await res.json();
      setRawText(data.raw_text ?? "");
      setParsed(data);
      setStep("confirm");
    } catch {
      setError("분석에 실패했습니다. 다시 시도해주세요.");
      setStep("pre-confirm");
    }
  }

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

  async function handleSave() {
    if (!parsed) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...parsed, raw_text: rawText, image_url: preview ?? "" }),
      });
      if (!res.ok) throw new Error();
      handleClose();
      router.push("/receipts");
      router.refresh();
    } catch {
      setError("저장에 실패했습니다. 다시 시도해주세요.");
      setSaving(false);
    }
  }

  const isFullScreen = step === "confirm";

  return (
    <>
      {/* 이미지 전체보기 */}
      {imageViewerOpen && preview && (
        <div
          className="fixed inset-0 z-[60] bg-black flex items-center justify-center"
          onClick={() => setImageViewerOpen(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="영수증 원본" className="max-w-full max-h-full object-contain" />
          <button
            className="absolute top-12 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-white/20 text-white"
            onClick={() => setImageViewerOpen(false)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={step === "select" ? handleClose : undefined}
        />
      )}

      <div
        className={`fixed left-0 right-0 z-50 bg-white transition-transform duration-300 ease-out
          ${isFullScreen ? "inset-0 rounded-none" : "bottom-0 rounded-t-3xl shadow-2xl h-[420px] flex flex-col overflow-hidden"}
          ${open ? "translate-y-0" : "translate-y-full"}
        `}
      >
        {/* ── SELECT ── */}
        {step === "select" && (
          <div className="max-w-md mx-auto w-full flex flex-col h-full">
            <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>
            <div className="flex-1 flex flex-col justify-center px-5 pb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-1">영수증 추가</h2>
              <p className="text-sm text-gray-400 mb-5">카메라로 촬영하거나 앨범에서 선택하세요</p>
              {error && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
              )}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => { fileInputRef.current?.setAttribute("capture", "environment"); fileInputRef.current?.click(); }}
                  className="flex items-center gap-4 bg-gray-50 rounded-2xl px-5 py-4 active:bg-gray-100 transition-colors text-left"
                >
                  <div className="w-11 h-11 rounded-full bg-skku-light flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-skku" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">카메라로 촬영</p>
                    <p className="text-xs text-gray-400 mt-0.5">지금 바로 영수증을 찍어요</p>
                  </div>
                </button>
                <button
                  onClick={() => { fileInputRef.current?.removeAttribute("capture"); fileInputRef.current?.click(); }}
                  className="flex items-center gap-4 bg-gray-50 rounded-2xl px-5 py-4 active:bg-gray-100 transition-colors text-left"
                >
                  <div className="w-11 h-11 rounded-full bg-skku-light flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-skku" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">앨범에서 선택</p>
                    <p className="text-xs text-gray-400 mt-0.5">저장된 사진을 불러와요</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── PRE-CONFIRM ── */}
        {step === "pre-confirm" && (
          <div className="max-w-md mx-auto w-full flex flex-col h-full">
            <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>
            {preview && (
              <button
                className="flex-1 mx-5 mb-3 rounded-2xl overflow-hidden bg-gray-50 min-h-0"
                onClick={() => setImageViewerOpen(true)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="영수증" className="w-full h-full object-cover" />
              </button>
            )}
            <div className="flex-shrink-0 px-5 pb-6">
              <h2 className="text-base font-bold text-gray-900 mb-0.5">이미지 분석</h2>
              <p className="text-sm text-gray-400 mb-4">이미지를 탭하면 크게 볼 수 있어요. 분석을 시작할까요?</p>
              {error && (
                <div className="mb-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => { setImageFile(null); setPreview(null); setError(null); setStep("select"); }}
                  className="flex-1 py-3.5 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-600 active:bg-gray-50"
                >
                  취소
                </button>
                <button onClick={handleStartParse} className="flex-1 py-3.5 rounded-2xl bg-skku text-sm font-semibold text-white active:scale-95 transition-transform">분석 시작</button>
              </div>
            </div>
          </div>
        )}

        {/* ── PARSING ── */}
        {step === "parsing" && (
          <div className="max-w-md mx-auto flex flex-col items-center justify-center gap-4 h-full px-5">
            <div className="w-7 h-7 border-2 border-skku border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600 font-medium text-sm">영수증을 분석하는 중...</p>
          </div>
        )}

        {/* ── CONFIRM ── */}
        {step === "confirm" && parsed && (
          <div className="max-w-md mx-auto flex flex-col h-full">
            <header className="px-5 pt-12 pb-4 flex items-center justify-between flex-shrink-0">
              <button
                onClick={() => { setStep("pre-confirm"); setParsed(null); }}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-base font-bold text-gray-900">내용 확인</h2>
              <button
                onClick={() => { setStep("select"); setParsed(null); setPreview(null); setRawText(""); }}
                className="text-sm text-gray-400 active:text-gray-600"
              >
                다시 찍기
              </button>
            </header>

            <div className="flex-1 px-4 overflow-y-auto space-y-4 pb-4">
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
                  <input className="text-sm font-medium text-gray-900 text-right bg-transparent outline-none" value={parsed.store_name} onChange={(e) => setParsed({ ...parsed, store_name: e.target.value })} />
                </div>
                <div className="px-4 py-3.5 flex items-center justify-between">
                  <span className="text-sm text-gray-500">날짜</span>
                  <input type="date" className="text-sm font-medium text-gray-900 text-right bg-transparent outline-none" value={parsed.receipt_date} onChange={(e) => setParsed({ ...parsed, receipt_date: e.target.value })} />
                </div>
                <div className="px-4 py-3.5 flex items-center justify-between">
                  <span className="text-sm text-gray-500">총액</span>
                  <input type="number" className="text-sm font-bold text-skku text-right bg-transparent outline-none w-32" value={parsed.total_amount} onChange={(e) => setParsed({ ...parsed, total_amount: Number(e.target.value) })} />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100">
                <div className="px-4 py-3 border-b border-gray-50">
                  <p className="text-sm font-semibold text-gray-700">항목 상세</p>
                </div>
                <div className="divide-y divide-gray-50">
                  {parsed.items.map((item, i) => (
                    <div key={i} className="px-4 py-3 space-y-2">
                      <input className="text-sm font-medium text-gray-900 w-full bg-transparent outline-none border-b border-transparent focus:border-skku" value={item.menu_name} onChange={(e) => updateItem(i, "menu_name", e.target.value)} />
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
            <div className="px-4 pb-8 pt-2 flex-shrink-0">
              <button onClick={handleSave} disabled={saving} className="w-full py-4 bg-skku text-white font-semibold rounded-2xl active:scale-95 transition-transform disabled:opacity-60">
                {saving ? "저장 중..." : "저장하기"}
              </button>
            </div>
          </div>
        )}

        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>
    </>
  );
}
