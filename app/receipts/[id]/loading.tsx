const sk = "text-transparent select-none bg-gray-200 rounded";
const skSub = "text-transparent select-none bg-gray-100 rounded";

export default function ReceiptDetailLoading() {
  return (
    <div className="h-[calc(100dvh-5rem)] flex flex-col animate-pulse">
      {/* 헤더 */}
      <header className="px-4 pt-12 pb-4 flex items-center gap-3 flex-shrink-0">
        <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0" />
        <div className={`text-xl font-bold flex-1 w-fit ${sk}`}>가게이름예시</div>
        <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0" />
      </header>

      {/* 기본 정보 */}
      <div className="px-4 pb-3 flex-shrink-0">
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
          <div className="px-4 py-3.5 flex items-center justify-between">
            <div className={`text-sm w-fit ${sk}`}>날짜</div>
            <div className={`text-sm font-medium w-fit ${sk}`}>2026년 3월 28일</div>
          </div>
          <div className="px-4 py-3.5 flex items-center justify-between">
            <div className={`text-sm w-fit ${sk}`}>총액</div>
            <div className={`text-base font-bold w-fit ${sk}`}>000,000원</div>
          </div>
        </div>
      </div>

      {/* 항목 테이블 */}
      <div className="flex-1 min-h-0 px-4 pb-4">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <div className={`text-sm font-semibold w-fit ${sk}`}>항목 상세</div>
          </div>
          <div className="grid grid-cols-[1fr_3rem_5.5rem] gap-x-2 px-4 py-2 bg-gray-50">
            <div className={`text-xs font-medium w-fit ${skSub}`}>품명</div>
            <div className={`text-xs font-medium w-fit mx-auto ${skSub}`}>수량</div>
            <div className={`text-xs font-medium w-fit ml-auto ${skSub}`}>금액</div>
          </div>
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid grid-cols-[1fr_3rem_5.5rem] gap-x-2 px-4 py-3 items-center">
                <div className={`text-sm w-fit ${sk}`}>메뉴이름예시</div>
                <div className={`text-sm w-fit mx-auto ${sk}`}>0</div>
                <div className={`text-sm font-medium w-fit ml-auto ${sk}`}>00,000원</div>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
            <div className={`text-sm w-fit ${skSub}`}>합계</div>
            <div className={`text-sm font-bold w-fit ${skSub}`}>000,000원</div>
          </div>
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex gap-3 px-4 pb-8 pt-4 flex-shrink-0">
        <div className="flex-1 py-3.5 border border-gray-200 rounded-2xl flex items-center justify-center gap-2 bg-white">
          <div className="w-4 h-4 bg-gray-200 rounded" />
          <div className={`text-sm font-semibold ${sk}`}>원본 이미지</div>
        </div>
        <div className="flex-1 py-3.5 bg-gray-200 rounded-2xl flex items-center justify-center gap-2">
          <div className="w-4 h-4 bg-gray-300 rounded" />
          <div className={`text-sm font-semibold ${skSub}`}>파일 내보내기</div>
        </div>
      </div>
    </div>
  );
}
