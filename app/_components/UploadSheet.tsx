"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function UploadSheet({ open, onClose }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [preConfirmOpen, setPreConfirmOpen] = useState(false);
  const [preConfirmVisible, setPreConfirmVisible] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (preConfirmOpen) {
      requestAnimationFrame(() => requestAnimationFrame(() => setPreConfirmVisible(true)));
    }
  }, [preConfirmOpen]);

  function handleClose() {
    setImageFile(null);
    setPreview(null);
    setPreConfirmOpen(false);
    setPreConfirmVisible(false);
    setError(null);
    onClose();
  }

  function handleCancelPreConfirm() {
    setPreConfirmVisible(false);
    setTimeout(() => {
      setPreConfirmOpen(false);
      setImageFile(null);
      setPreview(null);
      setError(null);
    }, 280);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setError(null);
    setPreConfirmVisible(false);
    setPreConfirmOpen(true);
  }

  async function compressImage(file: File): Promise<{ file: File; base64: string }> {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const MAX = 1280;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round((height / width) * MAX); width = MAX; }
          else { width = Math.round((width / height) * MAX); height = MAX; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        const base64 = dataUrl.replace(/^data:image\/jpeg;base64,/, "");
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(url);
          resolve({ file: new File([blob!], file.name, { type: "image/jpeg" }), base64 });
        }, "image/jpeg", 0.85);
      };
      img.src = url;
    });
  }

  async function handleStartParse() {
    if (!imageFile) return;
    try {
      const { base64 } = await compressImage(imageFile);
      sessionStorage.setItem("upload_image", JSON.stringify({ base64, mimeType: "image/jpeg" }));
      setPreConfirmVisible(false);
      setPreConfirmOpen(false);
      onClose();
      router.push("/upload/parsing");
    } catch {
      setError("이미지 처리에 실패했습니다. 다시 시도해주세요.");
    }
  }

  return (
    <>
      {/* ── 이미지 전체보기 ── */}
      {imageViewerOpen && preview && (
        <div
          className="fixed inset-0 z-[70] bg-black flex items-center justify-center"
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

      {/* ── 이미지 분석 모달 ── */}
      {preConfirmOpen && (
        <>
          <div
            className={`fixed inset-0 z-[55] bg-black/50 transition-opacity duration-300 ${preConfirmVisible ? "opacity-100" : "opacity-0"}`}
            onClick={handleCancelPreConfirm}
          />
          <div className={`fixed inset-x-4 top-1/2 z-[60] bg-white rounded-3xl shadow-2xl overflow-hidden max-w-sm mx-auto transition-all duration-300 ease-out
            ${preConfirmVisible ? "-translate-y-1/2 opacity-100" : "-translate-y-[40%] opacity-0"}`}>
            {preview && (
              <button
                className="w-full h-52 block bg-gray-100 overflow-hidden"
                onClick={() => setImageViewerOpen(true)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="영수증" className="w-full h-full object-cover" />
              </button>
            )}
            <div className="px-5 pt-4 pb-5">
              <h2 className="text-base font-bold text-gray-900 mb-1">이미지 분석</h2>
              <p className="text-sm text-gray-400 mb-4">
                영수증을 분석합니다.{" "}
                <span className="text-skku">이미지를 탭하면 크게 볼 수 있어요.</span>
              </p>
              {error && (
                <div className="mb-3 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleCancelPreConfirm}
                  className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-600 active:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleStartParse}
                  className="flex-1 py-3 rounded-2xl bg-skku text-sm font-semibold text-white active:scale-95 transition-transform"
                >
                  분석 시작
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── UploadSheet 딤 배경 ── */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={handleClose}
        />
      )}

      {/* ── UploadSheet 본체 ── */}
      <div
        className={`fixed left-0 right-0 z-50 bg-white bottom-0 rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out
          ${open && !preConfirmOpen ? "translate-y-0" : "translate-y-full"}
        `}
      >
        <div className="max-w-md mx-auto">
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 rounded-full bg-gray-200" />
          </div>
          <div className="px-5 pt-2 pb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-1">영수증 추가</h2>
            <p className="text-sm text-gray-400 mb-5">카메라로 촬영하거나 앨범에서 선택하세요</p>
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

        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>
    </>
  );
}
