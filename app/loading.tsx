export default function HomeLoading() {
  const card = "bg-white rounded-2xl border border-gray-100";

  return (
    <div className="h-[calc(100dvh-5rem)] flex flex-col pt-6 animate-pulse">
      {/* 예산 카드 */}
      <div className="px-4 flex-shrink-0">
        <div className={`${card} shadow-sm px-5 py-5`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="h-3 w-16 bg-gray-200 rounded mb-2" />
              <div className="h-6 w-28 bg-gray-200 rounded" />
            </div>
            <div className="flex flex-col items-end">
              <div className="h-3 w-14 bg-gray-200 rounded mb-2" />
              <div className="h-6 w-24 bg-gray-200 rounded" />
            </div>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full mb-2" />
          <div className="flex items-center justify-between">
            <div className="h-3 w-20 bg-gray-100 rounded" />
            <div className="h-3 w-8 bg-gray-100 rounded" />
          </div>
        </div>
      </div>

      {/* 카테고리별 지출 (헤더 없이) */}
      <div className="px-4 mt-3 flex-shrink-0">
        <div className={card}>
          <div className="flex items-center gap-4 px-4 py-4">
            <div className="w-[176px] h-[176px] rounded-full bg-gray-100 flex-shrink-0" />
            <div className="flex-1 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="h-3 w-16 bg-gray-200 rounded" />
                    <div className="h-3 w-8 bg-gray-200 rounded" />
                  </div>
                  <div className="w-full h-1 bg-gray-100 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 최근 내역 */}
      <div className="flex-1 min-h-0 flex flex-col px-4 mt-3 pb-4">
        <div className={`${card} flex-1 min-h-0 flex flex-col`}>
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="h-4 w-16 bg-gray-200 rounded" />
          </div>
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3.5">
                <div className="min-w-0 flex-1">
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                  <div className="h-3 w-16 bg-gray-100 rounded mt-1.5" />
                </div>
                <div className="h-4 w-20 bg-gray-200 rounded ml-3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
