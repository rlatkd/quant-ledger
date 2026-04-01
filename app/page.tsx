import Link from "next/link";
import { supabase } from "./_lib/supabase";
import type { Receipt } from "./_lib/types";

async function getMonthlyTotal(): Promise<number> {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];

  const { data } = await supabase
    .from("receipts")
    .select("total_amount")
    .gte("receipt_date", firstDay)
    .lte("receipt_date", lastDay);

  if (!data) return 0;
  return data.reduce((sum, r) => sum + (r.total_amount ?? 0), 0);
}

async function getRecentReceipts(): Promise<Receipt[]> {
  const { data, error } = await supabase
    .from("receipts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) return [];
  return data as Receipt[];
}

function formatAmount(amount: number): string {
  return amount.toLocaleString("ko-KR") + "원";
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default async function HomePage() {
  const [monthlyTotal, recentReceipts] = await Promise.all([
    getMonthlyTotal(),
    getRecentReceipts(),
  ]);

  const now = new Date();
  const monthLabel = `${now.getFullYear()}년 ${now.getMonth() + 1}월`;

  return (
    <div className="h-[calc(100dvh-5rem)] flex flex-col">
      {/* 헤더 */}
      <header className="bg-skku px-5 pt-12 pb-8 flex-shrink-0">
        <p className="text-skku-light text-sm font-medium mb-1">성균관대학교 퀀트응용경제학과</p>
        <h1 className="text-white text-2xl font-bold">총무부 장부</h1>
      </header>

      {/* 이번달 총지출 카드 */}
      <div className="px-4 -mt-4 flex-shrink-0">
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
          <p className="text-gray-500 text-sm">{monthLabel} 총지출</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {formatAmount(monthlyTotal)}
          </p>
          <Link
            href="/receipts"
            className="inline-flex items-center gap-1 text-skku text-sm font-medium mt-3"
          >
            전체 내역 보기
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        </div>
      </div>

      {/* 최근 영수증 — 이 영역만 스크롤 */}
      <div className="flex-1 flex flex-col min-h-0 px-4 mt-6">
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-900">최근 내역</h2>
          <Link href="/receipts" className="text-sm text-gray-400">
            전체보기
          </Link>
        </div>

        {recentReceipts.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-gray-400">
            <svg className="w-12 h-12 mb-3 text-gray-200" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
            </svg>
            <p className="text-sm">등록된 영수증이 없습니다</p>
          </div>
        ) : (
          <ul className="overflow-y-auto space-y-3 pb-4">
            {recentReceipts.map((receipt) => (
              <li key={receipt.id}>
                <Link
                  href={`/receipts/${receipt.id}`}
                  className="flex items-center justify-between bg-white rounded-xl px-4 py-3.5 border border-gray-100 active:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{receipt.store_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(receipt.receipt_date)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800 text-sm">
                      {formatAmount(receipt.total_amount)}
                    </span>
                    <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
                    </svg>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
