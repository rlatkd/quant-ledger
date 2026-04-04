import Link from "next/link";
import { unstable_cache } from "next/cache";
import { supabase } from "./_lib/supabase";
import type { Receipt } from "./_lib/types";

const BUDGET = 3_600_000;

const CATEGORY_COLORS = [
  "#005b36", "#40916c", "#74c69d",
  "#2d6a4f", "#1b4332", "#95d5b2",
  "#52b788", "#d8f3dc",
];

interface CategoryStat {
  name: string;
  total: number;
}

const getDashboardData = unstable_cache(
  async (): Promise<{
    totalSpent: number;
    categoryStats: CategoryStat[];
    recentReceipts: Receipt[];
  }> => {
    const [receiptsRes, recentRes] = await Promise.all([
      supabase.from("receipts").select("total_amount, categories(name)"),
      supabase
        .from("receipts")
        .select("id, store_name, receipt_date, total_amount")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    const receipts = receiptsRes.data ?? [];
    const totalSpent = receipts.reduce((s, r) => s + (r.total_amount ?? 0), 0);

    const map = new Map<string, number>();
    for (const r of receipts) {
      const cat = r.categories as unknown as { name: string } | null;
      const name = cat?.name ?? "미분류";
      map.set(name, (map.get(name) ?? 0) + (r.total_amount ?? 0));
    }
    const categoryStats = Array.from(map.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);

    return { totalSpent, categoryStats, recentReceipts: (recentRes.data ?? []) as Receipt[] };
  },
  ["dashboard"],
  { revalidate: 30 }
);

function formatAmount(amount: number): string {
  return amount.toLocaleString("ko-KR") + "원";
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function donutArc(cx: number, cy: number, r: number, ir: number, start: number, end: number) {
  const s1 = polarToCartesian(cx, cy, r, end);
  const e1 = polarToCartesian(cx, cy, r, start);
  const s2 = polarToCartesian(cx, cy, ir, end);
  const e2 = polarToCartesian(cx, cy, ir, start);
  const large = end - start > 180 ? 1 : 0;
  return `M${s1.x} ${s1.y} A${r} ${r} 0 ${large} 0 ${e1.x} ${e1.y} L${e2.x} ${e2.y} A${ir} ${ir} 0 ${large} 1 ${s2.x} ${s2.y}Z`;
}

function DonutChart({ stats, total }: { stats: CategoryStat[]; total: number }) {
  const cx = 88, cy = 88, r = 72, ir = 46;

  let cumAngle = 0;
  const slices = stats.map((cat, i) => {
    const pct = total > 0 ? cat.total / total : 0;
    const sweep = pct * 359.99; // 359.99 to avoid full-circle edge case
    const start = cumAngle;
    cumAngle += sweep;
    return { ...cat, start, end: cumAngle, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] };
  });

  return (
    <svg width={176} height={176} viewBox="0 0 176 176">
      {total === 0 ? (
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth={r - ir} />
      ) : (
        slices.map((s, i) => (
          <path key={i} d={donutArc(cx, cy, r, ir, s.start, s.end)} fill={s.color} />
        ))
      )}
      <text x={cx} y={cy - 8} textAnchor="middle" fontSize="11" fill="#9ca3af">총지출</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#111827">
        {total === 0 ? "0원" : `${Math.round(total / 10000)}만원`}
      </text>
    </svg>
  );
}

export default async function HomePage() {
  const { totalSpent, categoryStats, recentReceipts } = await getDashboardData();

  const remaining = BUDGET - totalSpent;
  const usedPct = Math.min(100, Math.round((totalSpent / BUDGET) * 100));
  const isOverBudget = totalSpent > BUDGET;

  const cardClass = "bg-white rounded-2xl border border-gray-100";
  const cardHeader = "px-4 py-3 border-b border-gray-100 flex items-center justify-between";

  return (
    <div className="h-[calc(100dvh-5rem)] flex flex-col pt-6">
      {/* 예산 카드 */}
      <div className="px-4 flex-shrink-0">
        <div className={`${cardClass} shadow-sm px-5 py-5`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs text-gray-400 mb-1">총 지원금액</div>
              <div className="text-xl font-bold text-gray-900">{formatAmount(BUDGET)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400 mb-1">잔여금액</div>
              <div className={`text-xl font-bold ${isOverBudget ? "text-red-500" : "text-skku"}`}>
                {isOverBudget ? "초과 " : ""}{formatAmount(Math.abs(remaining))}
              </div>
            </div>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full rounded-full ${isOverBudget ? "bg-red-400" : "bg-skku"}`}
              style={{ width: `${usedPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div>사용 <span className="font-medium text-gray-600">{formatAmount(totalSpent)}</span></div>
            <div>{usedPct}%</div>
          </div>
        </div>
      </div>

      {/* 카테고리별 지출 */}
      <div className="px-4 mt-3 flex-shrink-0">
        <div className={cardClass}>
          <div className={cardHeader}>
            <div className="text-sm font-semibold text-gray-700">카테고리별 지출</div>
          </div>
          {categoryStats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <DonutChart stats={[]} total={0} />
              <div className="text-xs text-gray-300">내역이 없습니다</div>
            </div>
          ) : (
            <div className="flex items-center gap-4 px-4 py-4">
              <div className="flex-shrink-0">
                <DonutChart stats={categoryStats} total={totalSpent} />
              </div>
              <div className="flex-1 space-y-2.5 min-w-0">
                {categoryStats.map((cat, i) => {
                  const pct = totalSpent > 0 ? Math.round((cat.total / totalSpent) * 100) : 0;
                  return (
                    <div key={cat.name}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                          />
                          <div className="text-xs text-gray-600 truncate">{cat.name}</div>
                        </div>
                        <div className="text-xs font-semibold text-gray-800 ml-1 flex-shrink-0">{pct}%</div>
                      </div>
                      <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 최근 내역 */}
      <div className="flex-1 min-h-0 flex flex-col px-4 mt-3 pb-4">
        <div className={`${cardClass} flex-1 min-h-0 flex flex-col`}>
          <div className={`${cardHeader} flex-shrink-0`}>
            <div className="text-sm font-semibold text-gray-700">최근 내역</div>
          </div>
          {recentReceipts.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-gray-300">
              <div className="text-sm">등록된 영수증이 없습니다</div>
            </div>
          ) : (
            <ul className="overflow-y-auto divide-y divide-gray-50 pb-2">
              {recentReceipts.map((receipt) => (
                <li key={receipt.id}>
                  <Link
                    href={`/receipts/${receipt.id}`}
                    className="flex items-center justify-between px-4 py-3.5 active:bg-gray-50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 text-sm truncate">{receipt.store_name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{formatDate(receipt.receipt_date)}</div>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <div className="font-semibold text-gray-800 text-sm">{formatAmount(receipt.total_amount)}</div>
                      <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
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
    </div>
  );
}
