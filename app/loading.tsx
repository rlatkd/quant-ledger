const sk = "text-transparent select-none bg-gray-200 rounded";
const skSub = "text-transparent select-none bg-gray-100 rounded";

export default function HomeLoading() {
  const card = "bg-white rounded-2xl border border-gray-100";
  const cardHeader = "px-4 py-3 border-b border-gray-100 flex items-center justify-between";

  return (
    <div className="h-[calc(100dvh-5rem)] flex flex-col pt-6 animate-pulse">
      {/* 예산 카드 */}
      <div className="px-4 flex-shrink-0">
        <div className={`${card} px-5 py-5`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className={`text-xs mb-1 w-fit ${sk}`}>총 지원금액</div>
              <div className={`text-xl font-bold w-fit ${sk}`}>3,600,000원</div>
            </div>
            <div className="text-right">
              <div className={`text-xs mb-1 w-fit ${sk}`}>잔여금액</div>
              <div className={`text-xl font-bold w-fit ${sk}`}>3,600,000원</div>
            </div>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full mb-2" />
          <div className="flex items-center justify-between">
            <div className={`text-xs w-fit ${skSub}`}>사용 3,600,000원</div>
            <div className={`text-xs w-fit ${skSub}`}>100%</div>
          </div>
        </div>
      </div>

      {/* 카테고리별 지출 */}
      <div className="px-4 mt-3 flex-shrink-0">
        <div className={card}>
          <div className={cardHeader}>
            <div className={`text-sm font-semibold w-fit ${sk}`}>카테고리별 지출</div>
          </div>
          <div className="flex items-center gap-4 px-4 py-2">
            <div className="w-[176px] h-[176px] rounded-full bg-gray-100 flex-shrink-0" />
            <div className="flex-1 space-y-2.5 min-w-0">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-gray-200 flex-shrink-0" />
                      <div className={`text-xs w-fit ${sk}`}>카테고리명</div>
                    </div>
                    <div className={`text-xs font-semibold w-fit ${sk}`}>00%</div>
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
          <div className={`${cardHeader} flex-shrink-0`}>
            <div className={`text-sm font-semibold w-fit ${sk}`}>최근 내역</div>
          </div>
          <ul className="divide-y divide-gray-50">
            {Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className="flex items-center justify-between px-4 py-3.5">
                <div className="min-w-0 flex-1">
                  <div className={`text-sm font-medium w-fit ${sk}`}>가게이름예시</div>
                  <div className={`text-xs mt-0.5 w-fit ${skSub}`}>3월 28일</div>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <div className={`text-sm font-semibold w-fit ${sk}`}>000,000원</div>
                  <div className="w-4 h-4 bg-gray-200 rounded" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
