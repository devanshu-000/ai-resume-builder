export default function ResumeSkeleton() {
  return (
    <div className="grid gap-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white border rounded-xl p-5 shadow-sm">
          <div className="flex justify-between">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-1/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-full mb-1" />
              <div className="h-3 bg-gray-100 rounded w-5/6" />
            </div>
            <div className="h-8 w-16 bg-gray-100 rounded-lg ml-4" />
          </div>
        </div>
      ))}
    </div>
  )
}