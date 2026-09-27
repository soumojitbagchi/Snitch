import { useEffect, useRef } from "react";

const TOPS_ROWS = [
  { size: "S", chest: "38", length: "27", shoulder: "17", sleeve: "8.5" },
  { size: "M", chest: "40", length: "28", shoulder: "17.5", sleeve: "9" },
  { size: "L", chest: "42", length: "29", shoulder: "18", sleeve: "9.5" },
  { size: "XL", chest: "44", length: "30", shoulder: "18.5", sleeve: "10" },
  { size: "XXL", chest: "46", length: "31", shoulder: "19", sleeve: "10.5" },
];

const BOTTOMS_ROWS = [
  { size: "28", waist: "28", hip: "36", inseam: "30" },
  { size: "30", waist: "30", hip: "38", inseam: "30.5" },
  { size: "32", waist: "32", hip: "40", inseam: "31" },
  { size: "34", waist: "34", hip: "42", inseam: "31.5" },
  { size: "36", waist: "36", hip: "44", inseam: "32" },
];

export default function SizeGuideModal({ open, onClose, category = "" }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const previousFocus = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    previousFocus.current = document.activeElement;
    const timer = setTimeout(() => closeRef.current?.focus(), 30);

    const handleKey = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
      if (event.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKey, true);
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", handleKey, true);
      document.body.style.overflow = "";
      previousFocus.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const normalized = String(category || "").toLowerCase();
  const isBottom = /jean|denim|cargo|trouser|pant|short|bottom/.test(normalized);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/55" aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="size-guide-title"
        className="relative flex max-h-[88dvh] w-full max-w-2xl flex-col bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 py-4 sm:px-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Fit help
            </p>
            <h2 id="size-guide-title" className="mt-1 text-lg font-bold tracking-tight">
              Size Guide
              <span className="ml-2 align-middle text-xs font-medium text-neutral-500">
                in inches
              </span>
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close size guide"
            className="flex h-11 w-11 shrink-0 items-center justify-center border border-neutral-300 text-neutral-700 transition-colors hover:border-black hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5 sm:px-6">
          <p className="text-sm leading-6 text-neutral-600">
            Measured flat on the garment. If you are between sizes, we recommend taking the larger size for a relaxed Snitch fit.
          </p>

          {!isBottom ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-sm">
                <caption className="sr-only">Tops measurements in inches</caption>
                <thead>
                  <tr className="bg-neutral-950 text-white">
                    {["Size", "Chest", "Length", "Shoulder", "Sleeve"].map((h) => (
                      <th key={h} scope="col" className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TOPS_ROWS.map((row, idx) => (
                    <tr key={row.size} className={idx % 2 === 0 ? "bg-white" : "bg-neutral-50"}>
                      <th scope="row" className="border border-neutral-200 px-3 py-2.5 text-left font-bold">{row.size}</th>
                      <td className="border border-neutral-200 px-3 py-2.5 tabular-nums">{row.chest}</td>
                      <td className="border border-neutral-200 px-3 py-2.5 tabular-nums">{row.length}</td>
                      <td className="border border-neutral-200 px-3 py-2.5 tabular-nums">{row.shoulder}</td>
                      <td className="border border-neutral-200 px-3 py-2.5 tabular-nums">{row.sleeve}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-sm">
                <caption className="sr-only">Bottoms measurements in inches</caption>
                <thead>
                  <tr className="bg-neutral-950 text-white">
                    {["Size", "Waist", "Hip", "Inseam"].map((h) => (
                      <th key={h} scope="col" className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {BOTTOMS_ROWS.map((row, idx) => (
                    <tr key={row.size} className={idx % 2 === 0 ? "bg-white" : "bg-neutral-50"}>
                      <th scope="row" className="border border-neutral-200 px-3 py-2.5 text-left font-bold">{row.size}</th>
                      <td className="border border-neutral-200 px-3 py-2.5 tabular-nums">{row.waist}</td>
                      <td className="border border-neutral-200 px-3 py-2.5 tabular-nums">{row.hip}</td>
                      <td className="border border-neutral-200 px-3 py-2.5 tabular-nums">{row.inseam}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-5 border border-neutral-200 bg-neutral-50 p-4 text-xs leading-6 text-neutral-600">
            <p className="font-semibold uppercase tracking-[0.14em] text-neutral-900">How to measure</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><strong className="text-neutral-900">Chest:</strong> around the fullest part, tape level under arms.</li>
              <li><strong className="text-neutral-900">Waist:</strong> around the natural waistline, one finger of ease.</li>
              <li><strong className="text-neutral-900">Length / Inseam:</strong> flat from shoulder (or crotch) to hem.</li>
            </ul>
            <p className="mt-2">Still unsure? Check the model fit notes in Description & Details or pick your usual Snitch size.</p>
          </div>
        </div>

        <div className="border-t border-neutral-200 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-11 w-full items-center justify-center bg-black px-5 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
