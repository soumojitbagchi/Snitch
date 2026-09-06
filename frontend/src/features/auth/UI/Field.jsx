export default function Field({
  label,
  error,
  children,
  hint,
  htmlFor,
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="mt-1.5 text-xs leading-5 text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs leading-5 text-neutral-400">{hint}</p>
      ) : null}
    </div>
  );
}
