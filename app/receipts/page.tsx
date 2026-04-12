import Link from "next/link";
import { unstable_cache } from "next/cache";
import { supabase } from "../_lib/supabase";
import type { Receipt, Category } from "../_lib/types";
import CategorySelect from "./_components/CategorySelect";

async function getCategories(): Promise<Category[]> {
  const { data } = await supabase.from("categories").select("*").order("name");
  return (data ?? []) as Category[];
}

function getReceipts(categoryId?: string) {
  return unstable_cache(
    async (): Promise<Receipt[]> => {
      let query = supabase
        .from("receipts")
        .select("id, store_name, receipt_date, total_amount, created_at")
        .order("created_at", { ascending: false });

      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }

      const { data, error } = await query;
      if (error) return [];
      return data as Receipt[];
    },
    ["receipts", categoryId ?? "all"],
    { tags: ["receipts"], revalidate: 60 },
  )();
}

function formatAmount(amount: number): string {
  return amount.toLocaleString("ko-KR") + "원";
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default async function ReceiptsPage(props: PageProps<"/receipts">) {
  const { category } = await props.searchParams as { category?: string };

  const [receipts, categories] = await Promise.all([
    getReceipts(category),
    getCategories(),
  ]);

  const total = receipts.reduce((s, r) => s + r.total_amount, 0);

  return (
    <div className="h-[calc(100dvh-5rem)] flex flex-col pt-6">
      {/* 카테고리 필터 */}
      <div className="px-4 mb-3 flex-shrink-0">
        <CategorySelect categories={categories} current={category} />
      </div>

      {/* 합계 */}
      {receipts.length > 0 && (
        <div className="mx-4 mb-3 px-4 py-3 bg-skku-light rounded-xl flex items-center justify-between flex-shrink-0">
          <div className="text-sm text-gray-600">{receipts.length}건</div>
          <div className="font-bold text-skku-dark">{formatAmount(total)}</div>
        </div>
      )}

      {/* 목록 */}
      {receipts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
          <svg className="w-12 h-12 mb-3 text-gray-200" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
          <div className="text-sm">영수증이 없습니다</div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 pb-4 min-h-0">
          <ul className="space-y-3">
            {receipts.map((receipt) => (
              <li key={receipt.id}>
                <Link
                  href={`/receipts/${receipt.id}`}
                  className="flex items-center justify-between bg-white rounded-xl px-4 py-4 border border-gray-100 active:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-sm truncate">{receipt.store_name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{formatDate(receipt.receipt_date)}</div>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <div className="font-bold text-gray-800 text-sm">
                      {formatAmount(receipt.total_amount)}
                    </div>
                    <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
                    </svg>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
