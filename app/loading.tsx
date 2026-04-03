export default function HomeLoading() {
  return (
    <div className="h-[calc(100dvh-5rem)] flex flex-col animate-pulse">
      <header className="bg-skku px-5 pt-12 pb-8 flex-shrink-0">
        <div className="h-4 w-40 bg-white/20 rounded mb-2" />
        <div className="h-7 w-28 bg-white/30 rounded" />
      </header>

      <div className="px-4 -mt-4 flex-shrink-0">
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-8 w-36 bg-gray-200 rounded mt-2" />
          <div className="h-4 w-20 bg-gray-100 rounded mt-3" />
        </div>
      </div>

      <div className="flex-1 px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <div className="h-5 w-16 bg-gray-200 rounded" />
          <div className="h-4 w-12 bg-gray-100 rounded" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl px-4 py-3.5 border border-gray-100 flex items-center justify-between">
              <div>
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-3 w-16 bg-gray-100 rounded mt-1.5" />
              </div>
              <div className="h-4 w-16 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
