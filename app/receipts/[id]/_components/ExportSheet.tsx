"use client";

import { useState, useRef, useEffect } from "react";
import type { Receipt } from "../../../_lib/types";
import type { ExportInfo } from "../../../_lib/generateDocx";

type Step = "form" | "preview";

interface Props {
  receipt: Receipt;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}.`;
}

function formatAmount(n: number) {
  return n.toLocaleString("ko-KR");
}

function SignaturePad({ onChange }: { onChange: (dataUrl: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  function getPos(e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function start(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawing.current = true;
    const ctx = canvas.getContext("2d")!;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  function move(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#111";
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }

  function end() {
    drawing.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    onChange(canvas.toDataURL("image/png"));
  }

  function clear() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange("");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-medium text-gray-500">서명</label>
        <button type="button" onClick={clear} className="text-xs text-gray-400">
          지우기
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={600}
        height={160}
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={end}
        onMouseLeave={end}
        onTouchStart={start}
        onTouchMove={move}
        onTouchEnd={end}
        className="w-full h-24 border border-gray-200 rounded-xl bg-white touch-none"
        style={{ cursor: "crosshair" }}
      />
      <p className="text-xs text-gray-400 mt-1">손가락이나 마우스로 서명하세요</p>
    </div>
  );
}

const MAX_DETAIL_LINES = 3;

function DetailLines({ storeName, items }: { storeName: string; items: NonNullable<Receipt["receipt_items"]> }) {
  const shown = items.slice(0, MAX_DETAIL_LINES);
  const remaining = items.length - MAX_DETAIL_LINES;
  return (
    <div>
      <p>{storeName}</p>
      {shown.map((item, i) => (
        <p key={i}>- {item.menu_name}/{item.quantity}/{formatAmount(item.total_price)}</p>
      ))}
      {remaining > 0 && <p>이하 {remaining}건</p>}
    </div>
  );
}

export default function ExportSheet({ receipt }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [info, setInfo] = useState<ExportInfo>({ name: "", studentId: "", cardNumber: "", reason: "" });
  const [signature, setSignature] = useState("");
  const [loaded, setLoaded] = useState(false);

  const items = receipt.receipt_items ?? [];

  useEffect(() => {
    if (!open || loaded) return;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((user: { student_id?: string; name?: string; card_number?: string }) => {
        setInfo((prev) => ({
          ...prev,
          name: user.name ?? prev.name,
          studentId: user.student_id ?? prev.studentId,
          cardNumber: user.card_number ?? prev.cardNumber,
        }));
        setLoaded(true);
      })
      .catch(() => {});
  }, [open, loaded]);

  function handleClose() {
    setOpen(false);
    setStep("form");
  }

  function handlePdfDownload() {
    window.print();
  }

  const canProceed = info.name && info.studentId && info.cardNumber && info.reason;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-skku text-sm font-semibold text-white active:scale-95 transition-transform"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
        파일 내보내기
      </button>

      {open && <div className="fixed inset-0 bg-black/40 z-40 print:hidden" onClick={handleClose} />}

      {open && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col print:static print:block">
          {/* 헤더 */}
          <header className="flex items-center justify-between px-5 pt-12 pb-4 flex-shrink-0 print:hidden">
            <button
              onClick={step === "preview" ? () => setStep("form") : handleClose}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-base font-bold text-gray-900">
              {step === "form" ? "내보내기 정보 입력" : "미리보기"}
            </h2>
            <button onClick={handleClose} className="text-sm text-gray-400">닫기</button>
          </header>

          {/* ── STEP 1: 정보 입력 ── */}
          {step === "form" && (
            <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-4">
              <p className="text-sm text-gray-400">양식에 들어갈 추가 정보를 입력해주세요.</p>

              {[
                { label: "이름", key: "name", placeholder: "홍길동" },
                { label: "학번", key: "studentId", placeholder: "2026000000" },
                { label: "카드번호", key: "cardNumber", placeholder: "현대 0000-0000-0000-0000" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
                  <input
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-skku"
                    placeholder={placeholder}
                    value={info[key as keyof ExportInfo]}
                    onChange={(e) => setInfo({ ...info, [key]: e.target.value })}
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">개인카드 사용 사유</label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-skku resize-none"
                  rows={3}
                  placeholder="예) 퀀트응용경제학과 7기 개강총회 파티"
                  value={info.reason}
                  onChange={(e) => setInfo({ ...info, reason: e.target.value })}
                />
              </div>

              <SignaturePad onChange={setSignature} />
            </div>
          )}

          {/* ── STEP 2: 미리보기 ── */}
          {step === "preview" && (
            <div className="flex-1 overflow-y-auto px-4 pb-4 print:overflow-visible print:p-0">
              <div
                className="bg-white border border-gray-200 rounded-2xl text-[11px] leading-relaxed
                  print:border-none print:rounded-none print:shadow-none print:text-sm print:leading-normal"
                style={{ padding: "24px" }}
                id="print-area"
              >
                {/* 이름 학번 */}
                <p className="text-right mb-6 print:mb-8">{info.name} {info.studentId}</p>

                {/* 제목 */}
                <h1 className="text-center text-xl font-bold tracking-widest mb-8 print:text-3xl print:mb-10">
                  개인카드&nbsp;&nbsp;사용&nbsp;&nbsp;사유서
                </h1>

                {/* 섹션1 */}
                <p className="font-bold mb-1.5 print:mb-2">□&nbsp;&nbsp;개인카드 사용 내역</p>
                <table className="w-full border-collapse mb-5 text-center print:mb-6">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-500 px-1 py-1.5 w-8">연번</th>
                      <th className="border border-gray-500 px-1 py-1.5 w-20">카드사용일</th>
                      <th className="border border-gray-500 px-1 py-1.5 w-16">금액</th>
                      <th className="border border-gray-500 px-1 py-1.5">카드번호</th>
                      <th className="border border-gray-500 px-1 py-1.5 w-20">사용처</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-500 px-1 py-1.5">1</td>
                      <td className="border border-gray-500 px-1 py-1.5">{formatDate(receipt.receipt_date)}</td>
                      <td className="border border-gray-500 px-1 py-1.5">{formatAmount(receipt.total_amount)}</td>
                      <td className="border border-gray-500 px-1 py-1.5">{info.cardNumber}</td>
                      <td className="border border-gray-500 px-1 py-1.5 text-left px-2">{receipt.store_name}</td>
                    </tr>
                    <tr><td className="border border-gray-500 py-3" colSpan={5} /></tr>
                    <tr>
                      <td className="border border-gray-500 px-1 py-1.5 font-bold" colSpan={2}>합계</td>
                      <td className="border border-gray-500 px-1 py-1.5 font-bold">{formatAmount(receipt.total_amount)}</td>
                      <td className="border border-gray-500 py-1.5" colSpan={2} />
                    </tr>
                  </tbody>
                </table>

                {/* 섹션2 */}
                <p className="font-bold mb-1.5 print:mb-2">□&nbsp;&nbsp;개인카드 사용 사유</p>
                <div className="border border-gray-500 px-3 py-3 mb-5 min-h-[60px] print:min-h-[80px] print:mb-6">
                  {info.reason}
                </div>

                {/* 섹션3 */}
                <p className="font-bold mb-1.5 print:mb-2">□&nbsp;&nbsp;사용상세내역&nbsp;&nbsp;(사용처가 식사/음주 관련 업종일 경우 작성)</p>
                <div className="border border-gray-500 px-3 py-3 mb-8 min-h-[60px] print:min-h-[80px] print:mb-12">
                  <DetailLines storeName={receipt.store_name} items={items} />
                </div>

                {/* 날짜 */}
                <p className="text-center mb-8 print:mb-12">
                  {formatDate(receipt.receipt_date).replace(/\./g, " . ").replace(/ \. $/, "")}
                </p>

                {/* 서명 */}
                <div className="flex justify-center">
                  <div className="flex items-end gap-3">
                    <span className="font-bold text-sm print:text-base">사용자 :</span>
                    <span className="border-b border-gray-500 w-24 text-center pb-0.5 print:w-32">{info.name}</span>
                    <div className="relative w-10 h-10 flex items-center justify-center print:w-14 print:h-14">
                      <span className="text-gray-500 text-sm select-none">(인)</span>
                      {signature && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={signature}
                          alt="서명"
                          className="absolute inset-0 w-full h-full object-contain"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 하단 버튼 */}
          <div className="flex-shrink-0 px-5 pb-8 pt-3 print:hidden">
            {step === "form" ? (
              <button
                onClick={() => {
                  fetch("/api/auth/me", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: info.name, card_number: info.cardNumber }),
                  }).catch(() => {});
                  setStep("preview");
                }}
                disabled={!canProceed}
                className="w-full py-4 bg-skku text-white font-semibold rounded-2xl disabled:opacity-40 active:scale-95 transition-transform"
              >
                미리보기
              </button>
            ) : (
              <button
                onClick={handlePdfDownload}
                className="w-full py-4 bg-skku text-white font-semibold rounded-2xl active:scale-95 transition-transform"
              >
                PDF 저장
              </button>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body > * { display: none !important; }
          .fixed.inset-0.z-50 { display: block !important; position: static !important; }
          #print-area { padding: 40px !important; }
        }
      `}</style>
    </>
  );
}
