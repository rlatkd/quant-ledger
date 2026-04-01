import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "../../_lib/supabase";
import type { Receipt } from "../../_lib/types";
import DeleteButton from "./_components/DeleteButton";
import ReceiptActions from "./_components/ReceiptActions";

async function getReceipt(id: string): Promise<Receipt | null> {
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
        <Link
          href={`/receipts/${id}/edit`}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200 transition-colors"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
          </svg>
        </Link>
        <DeleteButton id={id} />
      </header>

      {/* 고정: 기본 정보 */}
      <div className="px-4 pb-3 flex-shrink-0">
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
      </div>

      {/* 스크롤: 항목 테이블 */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">
        {items.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50">
              <p className="text-sm font-semibold text-gray-700">항목 상세</p>
            </div>
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
