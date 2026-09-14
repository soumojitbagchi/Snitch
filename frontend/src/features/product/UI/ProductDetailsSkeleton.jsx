export default function ProductDetailsSkeleton({ className = "" }) {
  return (
    <article
      role="status"
      aria-label="Loading product details"
      className={`mx-auto w-full max-w-[1240px] px-4 py-8 sm:px-6 lg:px-8 ${className}`}
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <div className="flex flex-col-reverse gap-3 lg:flex-row lg:gap-4">
            <div className="flex gap-2 overflow-x-auto pb-1 lg:w-20 lg:flex-col lg:overflow-visible lg:pb-0">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className="aspect-[3/4] w-16 shrink-0 border border-neutral-200 bg-neutral-100 animate-pulse"
                />
              ))}
            </div>

            <div className="relative aspect-[3/4] flex-1 overflow-hidden border border-neutral-200 bg-neutral-100 animate-pulse">
              <div className="absolute right-3.5 top-3.5 h-10 w-10 rounded-full border border-neutral-200 bg-white/90 animate-pulse" />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:col-span-5">
          <div className="border-b border-neutral-200 pb-5">
            <div className="flex items-center justify-between gap-3">
              <div className="h-3 w-28 bg-neutral-100 animate-pulse" />
              <div className="h-5 w-16 bg-neutral-100 animate-pulse" />
            </div>

            <div className="mt-3 space-y-2">
              <div className="h-7 w-4/5 bg-neutral-100 animate-pulse sm:h-8" />
              <div className="h-7 w-2/3 bg-neutral-100 animate-pulse sm:h-8" />
            </div>

            <div className="mt-4 flex items-baseline gap-3">
              <div className="h-7 w-28 bg-neutral-100 animate-pulse sm:h-8" />
              <div className="h-3 w-24 bg-neutral-100 animate-pulse" />
            </div>
          </div>

          <div className="space-y-5 border-b border-neutral-200 py-5">
            <div>
              <div className="flex items-center justify-between">
                <div className="h-3 w-14 bg-neutral-100 animate-pulse" />
                <div className="h-3 w-16 bg-neutral-100 animate-pulse" />
              </div>
            </div>

            <div>
              <div className="mb-2.5 flex items-center justify-between">
                <div className="h-3 w-20 bg-neutral-100 animate-pulse" />
                <div className="h-3 w-16 bg-neutral-100 animate-pulse" />
              </div>

              <div className="flex flex-wrap gap-2.5">
                {[0, 1, 2, 3, 4].map((index) => (
                  <div
                    key={index}
                    className="min-w-12 h-11 border border-neutral-200 bg-neutral-100 animate-pulse"
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-3 w-16 bg-neutral-100 animate-pulse" />
              <div className="h-9 w-28 border border-neutral-200 bg-neutral-100 animate-pulse" />
            </div>
          </div>

          <div className="space-y-3 py-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="min-h-12 w-full border border-neutral-200 bg-neutral-100 animate-pulse" />
              <div className="min-h-12 w-full border border-neutral-300 bg-neutral-200 animate-pulse" />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-neutral-200 text-center">
              {[0, 1, 2].map((index) => (
                <div key={index} className="flex flex-col items-center gap-2 p-2">
                  <div className="h-5 w-5 bg-neutral-100 animate-pulse" />
                  <div className="h-2.5 w-16 bg-neutral-100 animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-neutral-200">
            <div className="border-b border-neutral-200 py-4">
              <div className="flex items-center justify-between">
                <div className="h-3 w-36 bg-neutral-100 animate-pulse" />
                <div className="h-4 w-4 bg-neutral-100 animate-pulse" />
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-3 w-full bg-neutral-100 animate-pulse" />
                <div className="h-3 w-5/6 bg-neutral-100 animate-pulse" />
                <div className="h-3 w-3/4 bg-neutral-100 animate-pulse" />
              </div>
            </div>

            <div className="border-b border-neutral-200 py-4">
              <div className="flex items-center justify-between">
                <div className="h-3 w-32 bg-neutral-100 animate-pulse" />
                <div className="h-4 w-4 bg-neutral-100 animate-pulse" />
              </div>
            </div>

            <div className="border-b border-neutral-200 py-4">
              <div className="flex items-center justify-between">
                <div className="h-3 w-28 bg-neutral-100 animate-pulse" />
                <div className="h-4 w-4 bg-neutral-100 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
