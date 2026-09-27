import { useState } from "react";
import { PRICE_BUCKETS, countActiveFilters } from "../utils/catalogFilters";

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-neutral-200 py-4 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex min-h-11 w-full items-center justify-between text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
      >
        <span>{title}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

export default function CatalogFilters({
  facets,
  filters,
  onToggle,
  onClear,
  resultCount,
  totalCount,
}) {
  const activeCount = countActiveFilters(filters);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggle = (group, value) => onToggle(group, value);

  const body = (
    <div>
      {facets.categories.length > 0 && (
        <FilterSection title={`Category (${facets.categories.length})`}>
          <ul className="space-y-1">
            {facets.categories.map(({ value, count }) => (
              <li key={value}>
                <label className="flex min-h-11 cursor-pointer items-center gap-3 px-1 text-sm text-neutral-800 hover:text-black">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(value)}
                    onChange={() => toggle("categories", value)}
                    className="h-4 w-4 shrink-0 accent-black"
                  />
                  <span className="flex-1">{value}</span>
                  <span className="text-xs tabular-nums text-neutral-500">{count}</span>
                </label>
              </li>
            ))}
          </ul>
        </FilterSection>
      )}

      {facets.sizes.length > 0 && (
        <FilterSection title="Size">
          <div className="flex flex-wrap gap-2">
            {facets.sizes.map(({ value, count }) => {
              const selected = filters.sizes.includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggle("sizes", value)}
                  aria-pressed={selected}
                  title={`${count} product${count === 1 ? "" : "s"}`}
                  className={`flex min-h-11 min-w-11 items-center justify-center border px-3 text-xs font-semibold uppercase tracking-wider transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${
                    selected
                      ? "border-black bg-black text-white"
                      : "border-neutral-300 bg-white text-neutral-800 hover:border-black"
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      <FilterSection title="Price">
        <ul className="space-y-1">
          {PRICE_BUCKETS.map((bucket) => (
            <li key={bucket.id}>
              <label className="flex min-h-11 cursor-pointer items-center gap-3 px-1 text-sm text-neutral-800 hover:text-black">
                <input
                  type="checkbox"
                  checked={filters.prices.includes(bucket.id)}
                  onChange={() => toggle("prices", bucket.id)}
                  className="h-4 w-4 shrink-0 accent-black"
                />
                <span className="flex-1">{bucket.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </FilterSection>

      <FilterSection title="Availability">
        <ul className="space-y-1">
          <li>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 px-1 text-sm text-neutral-800 hover:text-black">
              <input
                type="checkbox"
                checked={filters.availability.includes("in-stock")}
                onChange={() => toggle("availability", "in-stock")}
                className="h-4 w-4 shrink-0 accent-black"
              />
              <span className="flex-1">In stock only</span>
              <span className="text-xs tabular-nums text-neutral-500">
                {facets.availability.in + facets.availability.low}
              </span>
            </label>
          </li>
          <li>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 px-1 text-sm text-neutral-800 hover:text-black">
              <input
                type="checkbox"
                checked={filters.availability.includes("low")}
                onChange={() => toggle("availability", "low")}
                className="h-4 w-4 shrink-0 accent-black"
              />
              <span className="flex-1">Low stock</span>
              <span className="text-xs tabular-nums text-neutral-500">
                {facets.availability.low}
              </span>
            </label>
          </li>
        </ul>
      </FilterSection>
    </div>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-controls="catalog-filter-panel"
          className="inline-flex min-h-11 items-center gap-2 border border-neutral-300 bg-white px-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-900 transition-colors hover:border-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black lg:hidden"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="7" y1="12" x2="17" y2="12" />
            <line x1="10" y1="18" x2="14" y2="18" />
          </svg>
          Filters
          {activeCount > 0 && (
            <span
              aria-label={`${activeCount} filters applied`}
              className="flex h-5 min-w-5 items-center justify-center bg-black px-1.5 text-[10px] font-bold text-white"
            >
              {activeCount}
            </span>
          )}
        </button>

        {activeCount > 0 && (
          <p aria-live="polite" className="text-xs text-neutral-600">
            <strong className="font-semibold text-neutral-900">{resultCount}</strong> of{" "}
            {totalCount} · {activeCount} filter{activeCount === 1 ? "" : "s"} applied
          </p>
        )}

        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex min-h-11 items-center px-2 text-xs font-medium underline underline-offset-4 text-neutral-700 hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            Clear all ({activeCount})
          </button>
        )}
      </div>

      {activeCount > 0 && (
        <ul aria-label="Applied filters" className="mt-3 flex flex-wrap gap-2">
          {[
            ...filters.categories.map((v) => ({ group: "categories", value: v })),
            ...filters.sizes.map((v) => ({ group: "sizes", value: v })),
            ...filters.prices.map((v) => ({
              group: "prices",
              value: PRICE_BUCKETS.find((b) => b.id === v)?.label || v,
              raw: v,
            })),
            ...filters.availability.map((v) => ({ group: "availability", value: v === "in-stock" ? "In stock" : "Low stock", raw: v })),
          ].map((chip) => (
            <li key={`${chip.group}:${chip.raw || chip.value}`}>
              <button
                type="button"
                onClick={() => toggle(chip.group, chip.raw || chip.value)}
                aria-label={`Remove filter ${chip.value}`}
                className="inline-flex min-h-9 items-center gap-1.5 border border-neutral-900 bg-neutral-900 px-2.5 text-[11px] font-medium text-white transition-colors hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
                {chip.value}
                <span aria-hidden="true">×</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {mobileOpen && (
        <div id="catalog-filter-panel" className="mt-4 border border-neutral-200 bg-white p-4 lg:hidden">
          {body}
        </div>
      )}

      <div className="mt-4 hidden border border-neutral-200 bg-white px-4 lg:block">{body}</div>
    </div>
  );
}
