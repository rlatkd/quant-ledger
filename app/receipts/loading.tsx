const sk = "text-transparent select-none bg-gray-200 rounded";
const skSub = "text-transparent select-none bg-gray-100 rounded";

export default function ReceiptsLoading() {
  return (
    <div className="h-[calc(100dvh-5rem)] flex flex-col pt-6 animate-pulse">
      {/* 카테고리 필터 */}
      <div className="px-4 mb-3 flex-shrink-0">
        <div className="h-10 w-32 bg-gray-200 rounded-lg" />
      </div>

      {/* 합계 */}
      <div className="mx-4 mb-3 px-4 py-3 bg-gray-100 rounded-xl flex items-center justify-between flex-shrink-0">
        <div className={`text-sm w-fit ${sk}`}>00건</div>
        <div className={`font-bold w-fit ${sk}`}>000,000원</div>
      </div>

      {/* 목록 */}
      <div className="flex-1 overflow-hidden px-4 pb-4">
        <ul className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="bg-white rounded-xl px-4 py-4 border border-gray-100 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-semibold w-fit ${sk}`}>가게이름예시</div>
                <div className={`text-xs mt-0.5 w-fit ${skSub}`}>2026.03.28</div>
              </div>
              <div className="flex items-center gap-2 ml-3">
                <div className={`text-sm font-bold w-fit ${sk}`}>000,000원</div>
                <div className="w-4 h-4 bg-gray-200 rounded" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
