export default function ReceiptsLoading() {
  return (
    <div className="h-[calc(100dvh-5rem)] flex flex-col pt-6 animate-pulse">
      {/* 카테고리 필터 */}
      <div className="px-4 mb-3 flex-shrink-0">
        <div className="h-10 w-32 bg-gray-200 rounded-lg" />
      </div>

      {/* 합계 */}
      <div className="mx-4 mb-3 px-4 py-3 bg-skku-light/50 rounded-xl flex items-center justify-between flex-shrink-0">
        <div className="h-4 w-10 bg-gray-200 rounded" />
        <div className="h-5 w-24 bg-gray-200 rounded" />
      </div>

      {/* 목록 */}
      <div className="flex-1 overflow-hidden px-4 pb-4">
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl px-4 py-4 border border-gray-100 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="h-4 w-28 bg-gray-200 rounded" />
                <div className="h-3 w-20 bg-gray-100 rounded mt-1.5" />
              </div>
              <div className="h-4 w-20 bg-gray-200 rounded ml-3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
