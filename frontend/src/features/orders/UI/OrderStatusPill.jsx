export default function OrderStatusPill({ status }) {
  const tone =
    status === "Delivered" || status === "completed"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : status === "Out for Delivery" || status === "pending"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : status === "failed" || status === "cancelled"
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-neutral-300 bg-white text-neutral-800";

  return (
    <span
      className={`inline-block border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${tone}`}
    >
      {status}
    </span>
  );
}
