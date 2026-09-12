import { useEffect, useState } from "react";
import Field from "../../auth/UI/Field";
import { inputClass } from "../../auth/UI/inputClass";
import { useProduct } from "../hooks/useProduct";

const CURRENCIES = ["INR", "USD", "EUR", "GBP"];

const blankVariant = () => ({ size: "", color: "", price: "", stock: "" });

function IconPlus() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

function IconX() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  );
}

function IconImage() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m4.5 18 5-5 3.5 3.5 2.5-2.5 4 4" strokeLinejoin="round" />
    </svg>
  );
}

export default function ProductForm({
  initialValues = null,
  submitLabel = "Publish product",
  submitting = false,
  onSubmit = () => { },
  onCancel = () => { },
}) {
  const { createProductHandler, submitting: submittingState, error: serverError, success: serverMessage } = useProduct();
  const isSubmitting = submitting || submittingState;
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [currency, setCurrency] = useState(initialValues?.currency ?? "INR");
  const [variants, setVariants] = useState(
    initialValues?.variants?.length ? initialValues.variants : [blankVariant()],
  );
  const [previews, setPreviews] = useState(initialValues?.images ?? []);
  // Real File objects to send as `media` (previews above are only display URLs).
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});

  // Revoke blob preview URLs on unmount to avoid leaking object URLs.
  useEffect(() => {
    return () => {
      setPreviews((current) => {
        current.forEach((src) => {
          if (typeof src === "string" && src.startsWith("blob:")) URL.revokeObjectURL(src);
        });
        return current;
      });
    };
  }, []);

  const setVariant = (index, key) => (e) => {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, [key]: e.target.value } : v)));
  };

  const addVariant = () => setVariants((prev) => [...prev, blankVariant()]);
  const removeVariant = (index) =>
    setVariants((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));

  const addFiles = (e) => {
    const picked = Array.from(e.target.files ?? []).slice(0, 5 - previews.length);
    if (picked.length === 0) return;
    setFiles((prev) => [...prev, ...picked]);
    setPreviews((prev) => [...prev, ...picked.map((f) => URL.createObjectURL(f))]);
    e.target.value = "";
  };

  const removePreview = (index) => {
    setPreviews((prev) => {
      const src = prev[index];
      if (typeof src === "string" && src.startsWith("blob:")) URL.revokeObjectURL(src);
      return prev.filter((_, i) => i !== index);
    });
    // `files` only holds newly picked Files; remote initialValues images have no File.
    // Indices line up while all previews are newly picked (create flow).
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!title.trim()) next.title = "Title is required.";
    if (!description.trim()) next.description = "Description is required.";
    if (variants.some((v) => v.price !== "" && Number.isNaN(Number(v.price))))
      next.variants = "Price must be a number.";
    if (previews.length === 0) next.images = "At least one image is required.";
    const oversized = files.find((f) => f.size > 5 * 1024 * 1024);
    if (oversized) next.images = `"${oversized.name}" exceeds 5 MB.`;
    setErrors(next);
    if (Object.keys(next).length > 0 || isSubmitting) return;
    // Backend create expects flat priceAmount/priceCurrency: use the first priced variant.
    const firstPriced = variants.find((v) => v.price !== "" && !Number.isNaN(Number(v.price)));
    const values = { title: title.trim(), description: description.trim(), currency, variants, imageCount: previews.length };
    const result = await createProductHandler(
      {
        title: values.title,
        description: values.description,
        priceAmount: firstPriced ? Number(firstPriced.price) : 0,
        priceCurrency: currency,
      },
      files,
    );
    if (result.ok) {
      onSubmit(values);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="mx-auto w-full max-w-[720px] px-5 py-10 sm:px-8">
      <h1 className="font-serif text-[34px] font-light leading-tight tracking-tight">
        {initialValues ? "Edit product." : "New product."}
      </h1>
      <p className="mt-2 text-[14px] leading-6 text-neutral-500">
        List it once, sell it everywhere on Snitch.
      </p>

      <div className="mt-8 space-y-5">
        <Field label="Title" htmlFor="product-title" error={errors.title}>
          <input
            id="product-title"
            type="text"
            autoComplete="off"
            placeholder="Oversized Graphic Tee - Black"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass(errors.title)}
          />
        </Field>

        <Field label="Description" htmlFor="product-description" error={errors.description}>
          <textarea
            id="product-description"
            rows={4}
            placeholder="Fabric, fit, care — what the buyer needs to know."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${inputClass(errors.description)} h-auto py-3.5`}
          />
        </Field>

        <div>
          <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
            Images · {previews.length}/5
          </span>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {previews.map((src, i) => (
              <div key={`${src}-${i}`} className="group relative aspect-square overflow-hidden bg-neutral-100">
                <img src={src} alt={`Product preview ${i + 1}`} className="h-full w-full object-cover object-top" />
                <button
                  type="button"
                  aria-label={`Remove image ${i + 1}`}
                  onClick={() => removePreview(i)}
                  className="absolute right-1 top-1 bg-black p-1.5 text-white opacity-0 transition-opacity hover:bg-neutral-800 group-hover:opacity-100"
                >
                  <IconX />
                </button>
              </div>
            ))}
            {previews.length < 5 && (
              <label
                htmlFor="product-images"
                className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 border border-dashed border-neutral-300 text-neutral-500 transition-colors hover:border-black hover:text-black"
              >
                <IconImage />
                <span className="text-[11px] font-medium uppercase tracking-[0.14em]">Upload</span>
                <input
                  id="product-images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={addFiles}
                  className="sr-only"
                />
              </label>
            )}
          </div>
          <p className="mt-1.5 text-xs leading-5 text-neutral-400">First image becomes the cover. JPG or PNG, max 5 MB each.</p>
          {errors.images && (
            <p role="alert" className="mt-1.5 text-xs leading-5 text-red-600">{errors.images}</p>
          )}
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
              Variants
            </span>
            <span className="flex items-center gap-2">
              <label htmlFor="product-currency" className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
                Currency
              </label>
              <select
                id="product-currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="h-9 border border-neutral-300 bg-white px-2 text-[13px] outline-none hover:border-neutral-500 focus:border-black"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </span>
          </div>
          <div className="divide-y divide-neutral-200 border border-neutral-200">
            {variants.map((v, i) => (
              <div key={i} className="grid grid-cols-2 gap-3 p-3.5 sm:grid-cols-[1fr_1fr_1fr_1fr_auto]">
                <input
                  aria-label={`Variant ${i + 1} size`}
                  placeholder="Size"
                  value={v.size}
                  onChange={setVariant(i, "size")}
                  className={inputClass(false)}
                />
                <input
                  aria-label={`Variant ${i + 1} color`}
                  placeholder="Color"
                  value={v.color}
                  onChange={setVariant(i, "color")}
                  className={inputClass(false)}
                />
                <input
                  aria-label={`Variant ${i + 1} price`}
                  placeholder="Price"
                  inputMode="decimal"
                  value={v.price}
                  onChange={setVariant(i, "price")}
                  className={inputClass(errors.variants)}
                />
                <input
                  aria-label={`Variant ${i + 1} stock`}
                  placeholder="Stock"
                  inputMode="numeric"
                  value={v.stock}
                  onChange={setVariant(i, "stock")}
                  className={inputClass(false)}
                />
                <button
                  type="button"
                  aria-label={`Remove variant ${i + 1}`}
                  onClick={() => removeVariant(i)}
                  disabled={variants.length === 1}
                  className="col-span-2 p-2 text-neutral-400 transition-colors hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30 sm:col-span-1"
                >
                  <IconX />
                </button>
              </div>
            ))}
          </div>
          {errors.variants && (
            <p role="alert" className="mt-1.5 text-xs leading-5 text-red-600">{errors.variants}</p>
          )}
          <button
            type="button"
            onClick={addVariant}
            className="mt-3 flex h-10 items-center gap-2 border border-neutral-300 px-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-700 transition-colors hover:border-black hover:text-black active:scale-[0.98]"
          >
            <IconPlus /> Add variant
          </button>
        </div>

        {(serverError || serverMessage) && (
          <p role={serverError ? "alert" : "status"} className={`text-[13px] leading-5 ${serverError ? "text-red-600" : "text-green-700"}`}>
            {serverError || serverMessage}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex h-12 flex-1 items-center justify-center border border-neutral-300 text-[12px] font-semibold uppercase tracking-[0.2em] transition-colors hover:border-black active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-12 flex-[2] items-center justify-center bg-black text-[12px] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
          >
            {isSubmitting ? "Publishing..." : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
