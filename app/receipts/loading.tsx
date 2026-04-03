export default function ReceiptsLoading() {
  return (
    <div className="h-[calc(100dvh-5rem)] flex flex-col animate-pulse">
      <header className="px-5 pt-12 pb-4 flex-shrink-0">
        <div className="h-6 w-28 bg-gray-200 rounded" />
      </header>

      <div className="px-4 mb-4 flex-shrink-0">
        <div className="h-10 w-36 bg-gray-200 rounded-lg" />
      </div>

      <div className="mx-4 mb-4 px-4 py-3 bg-skku-light/50 rounded-xl flex items-center justify-between flex-shrink-0">
        <div className="h-4 w-10 bg-gray-200 rounded" />
        <div className="h-5 w-24 bg-gray-200 rounded" />
      </div>

      <div className="flex-1 overflow-hidden px-4 pb-4">
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl px-4 py-4 border border-gray-100 flex items-center justify-between">
              <div>
                <div className="h-4 w-28 bg-gray-200 rounded" />
                <div className="h-3 w-20 bg-gray-100 rounded mt-1.5" />
              </div>
              <div className="h-4 w-20 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
