export const inputClass = (hasError) =>
  [
    "h-12 w-full rounded-none border bg-white px-3.5 text-[15px] text-neutral-900 placeholder:text-neutral-400",
    "outline-none transition-colors",
    hasError
      ? "border-red-500 focus:border-red-600"
      : "border-neutral-300 hover:border-neutral-500 focus:border-black",
  ].join(" ");
