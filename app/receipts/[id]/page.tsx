import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "../../_lib/supabase";
import type { Receipt } from "../../_lib/types";
import DeleteButton from "./_components/DeleteButton";
import ReceiptActions from "./_components/ReceiptActions";

const DUMMY_RECEIPT: Receipt = {
  id: "dummy-1",
  image_url: "/1차_영수증.jpg",
  store_name: "명륜포차",
  receipt_date: "2026-03-28",
  total_amount: 720000,
  raw_text: "",
  created_at: "2026-03-28T21:36:00Z",
  receipt_items: [
    { id: "d-item-1", receipt_id: "dummy-1", menu_name: "두부김치", quantity: 1, unit_price: 30000, total_price: 30000 },
    { id: "d-item-2", receipt_id: "dummy-1", menu_name: "오뎅(5개)", quantity: 1, unit_price: 8000, total_price: 8000 },
    { id: "d-item-3", receipt_id: "dummy-1", menu_name: "참이슬(360ML)", quantity: 29, unit_price: 5000, total_price: 145000 },
    { id: "d-item-4", receipt_id: "dummy-1", menu_name: "모듬전", quantity: 1, unit_price: 75000, total_price: 75000 },
    { id: "d-item-5", receipt_id: "dummy-1", menu_name: "삼겹살", quantity: 2, unit_price: 55000, total_price: 110000 },
    { id: "d-item-6", receipt_id: "dummy-1", menu_name: "소막창", quantity: 1, unit_price: 95000, total_price: 95000 },
    { id: "d-item-7", receipt_id: "dummy-1", menu_name: "대창구이", quantity: 1, unit_price: 80000, total_price: 80000 },
    { id: "d-item-8", receipt_id: "dummy-1", menu_name: "쏘맥잔", quantity: 2, unit_price: 5000, total_price: 10000 },
    { id: "d-item-9", receipt_id: "dummy-1", menu_name: "감자전", quantity: 1, unit_price: 50000, total_price: 50000 },
    { id: "d-item-10", receipt_id: "dummy-1", menu_name: "모듬김치", quantity: 1, unit_price: 23000, total_price: 23000 },
    { id: "d-item-11", receipt_id: "dummy-1", menu_name: "부가세", quantity: 1, unit_price: 94000, total_price: 94000 },
  ],
};

async function getReceipt(id: string): Promise<Receipt | null> {
  if (id === "dummy-1") return DUMMY_RECEIPT;

  const { data, error } = await supabase
    .from("receipts")
    .select("*, receipt_items(*)")
    .eq("id", id)
    .single();

  if (error) return null;
  return (data as Receipt) ?? null;
}

function formatAmount(amount: number): string {
  return amount.toLocaleString("ko-KR") + "원";
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default async function ReceiptDetailPage(props: PageProps<"/receipts/[id]">) {
  const { id } = await props.params;
  const receipt = await getReceipt(id);

  if (!receipt) notFound();

  const items = receipt.receipt_items ?? [];

  return (
    <div className="h-[calc(100dvh-5rem)] flex flex-col">
      {/* 헤더 */}
      <header className="px-4 pt-12 pb-4 flex items-center gap-3 flex-shrink-0">
        <Link
          href="/receipts"
          className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-gray-900 flex-1 truncate">{receipt.store_name}</h1>
        <DeleteButton id={id} />
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
        {/* 기본 정보 */}
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
          <div className="px-4 py-3.5 flex items-center justify-between">
            <span className="text-sm text-gray-500">날짜</span>
            <span className="text-sm font-medium text-gray-900">{formatDate(receipt.receipt_date)}</span>
          </div>
          <div className="px-4 py-3.5 flex items-center justify-between">
            <span className="text-sm text-gray-500">총액</span>
            <span className="text-base font-bold text-skku">{formatAmount(receipt.total_amount)}</span>
          </div>
        </div>

        {/* 항목 테이블 */}
        {items.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50">
              <p className="text-sm font-semibold text-gray-700">항목 상세</p>
            </div>
            {/* 헤더 */}
            <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 px-4 py-2 bg-gray-50 text-xs text-gray-400 font-medium">
              <span>품명</span>
              <span className="text-center">수량</span>
              <span className="text-right">금액</span>
            </div>
            <div className="divide-y divide-gray-50">
              {items.map((item, i) => (
                <div key={item.id ?? i} className="grid grid-cols-[1fr_auto_auto] gap-x-3 px-4 py-3 items-center">
                  <span className="text-sm text-gray-800 truncate">{item.menu_name}</span>
                  <span className="text-sm text-gray-500 text-center">{item.quantity}</span>
                  <span className="text-sm font-medium text-gray-900 text-right">
                    {formatAmount(item.total_price)}
                  </span>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center bg-gray-50">
              <span className="text-sm text-gray-500">합계</span>
              <span className="text-sm font-bold text-gray-900">
                {formatAmount(items.reduce((s, i) => s + i.total_price, 0))}
              </span>
            </div>
          </div>
        )}


      </div>

      {/* 버튼 고정 */}
      <div className="flex-shrink-0">
        <ReceiptActions receipt={receipt} />
      </div>
    </div>
  );
}
