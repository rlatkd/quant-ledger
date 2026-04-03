export default function ReceiptDetailLoading() {
  return (
    <div className="h-[calc(100dvh-5rem)] flex flex-col animate-pulse">
      <header className="px-4 pt-12 pb-4 flex items-center gap-3 flex-shrink-0">
        <div className="w-9 h-9 rounded-full bg-gray-200" />
        <div className="h-6 w-32 bg-gray-200 rounded flex-1" />
        <div className="w-9 h-9 rounded-full bg-gray-200" />
        <div className="w-9 h-9 rounded-full bg-gray-200" />
      </header>

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

      <div className="flex-1 min-h-0 px-4 pb-4">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <div className="h-4 w-16 bg-gray-200 rounded" />
          </div>
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid grid-cols-[1fr_auto_auto] gap-x-3 px-4 py-3 items-center">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-4 w-6 bg-gray-100 rounded" />
                <div className="h-4 w-16 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
