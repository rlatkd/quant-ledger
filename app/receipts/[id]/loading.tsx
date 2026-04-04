export default function ReceiptDetailLoading() {
  return (
    <div className="h-[calc(100dvh-5rem)] flex flex-col animate-pulse">
      {/* 헤더 */}
      <div className="px-4 pt-12 pb-4 flex items-center gap-3 flex-shrink-0">
        <div className="w-9 h-9 rounded-full bg-gray-200" />
        <div className="h-6 w-32 bg-gray-200 rounded flex-1" />
        <div className="w-9 h-9 rounded-full bg-gray-200" />
        <div className="w-9 h-9 rounded-full bg-gray-200" />
      </div>

      {/* 기본 정보 */}
      <div className="px-4 pb-3 flex-shrink-0">
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
          <div className="px-4 py-3.5 flex items-center justify-between">
            <div className="h-4 w-10 bg-gray-200 rounded" />
            <div className="h-4 w-28 bg-gray-200 rounded" />
          </div>
          <div className="px-4 py-3.5 flex items-center justify-between">
            <div className="h-4 w-10 bg-gray-200 rounded" />
            <div className="h-5 w-24 bg-gray-200 rounded" />
          </div>
        </div>
      </div>

      {/* 항목 테이블 */}
      <div className="flex-1 min-h-0 px-4 pb-4">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <div className="h-4 w-16 bg-gray-200 rounded" />
          </div>
          <div className="grid grid-cols-[1fr_3rem_5.5rem] gap-x-2 px-4 py-2 bg-gray-50">
            <div className="h-3 w-8 bg-gray-200 rounded" />
            <div className="h-3 w-6 bg-gray-200 rounded mx-auto" />
            <div className="h-3 w-8 bg-gray-200 rounded ml-auto" />
          </div>
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid grid-cols-[1fr_3rem_5.5rem] gap-x-2 px-4 py-3 items-center">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-4 w-6 bg-gray-100 rounded mx-auto" />
                <div className="h-4 w-16 bg-gray-200 rounded ml-auto" />
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex justify-between">
            <div className="h-4 w-10 bg-gray-200 rounded" />
            <div className="h-4 w-20 bg-gray-200 rounded" />
          </div>
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex gap-3 px-4 pb-8 pt-4 flex-shrink-0">
        <div className="flex-1 h-12 bg-gray-200 rounded-2xl" />
        <div className="flex-1 h-12 bg-gray-200 rounded-2xl" />
      </div>
    </div>
  );
}
