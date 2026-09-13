import { useEffect, useRef, useState } from "react";
import { inputClass } from "../../auth/UI/inputClass";

const CURRENCIES = ["INR", "USD", "EUR", "GBP"];
const blankVariant = () => ({ size: "", color: "", price: "", stock: "0" });

function FormField({ id, label, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium">{label}</label>
      {children}
      {error && <p id={id + "-error"} className="mt-1 text-sm text-red-700">{error}</p>}
    </div>
  );
}

export default function ProductForm({ initialValues = null, onSubmit, onCancel }) {
  const editing = Boolean(initialValues);
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [currency, setCurrency] = useState(initialValues?.currency ?? "INR");
  const [variants, setVariants] = useState(initialValues?.variants ?? [blankVariant()]);
  const [uploads, setUploads] = useState([]);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const busy = useRef(false);
  const objectUrls = useRef(new Set());
  const errorSummary = useRef(null);
  const existingImages = initialValues?.images ?? [];
  const previews = uploads.length ? uploads.map((item) => item.url) : existingImages;

  useEffect(() => {
    const urls = objectUrls.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  useEffect(() => {
    if (Object.values(errors).some(Boolean) || serverError) errorSummary.current?.focus();
  }, [errors, serverError]);

  const setVariant = (index, key, value) => {
    setVariants((previous) => previous.map((variant, i) => i === index ? { ...variant, [key]: value } : variant));
  };

  const pickFiles = (event) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;
    let message = "";
    if (files.length + uploads.length > 5) message = "Choose up to 5 images.";
    else if (files.some((file) => !file.type.startsWith("image/"))) message = "Choose image files only.";
    else if (files.some((file) => file.size > 5 * 1024 * 1024)) message = "Each image must be 5 MB or smaller.";
    setErrors((previous) => ({ ...previous, "product-images": message }));
    if (message) return;
    const picked = files.map((file) => {
      const url = URL.createObjectURL(file);
      objectUrls.current.add(url);
      return { file, url };
    });
    setUploads((previous) => [...previous, ...picked]);
  };

  const removeUpload = (index) => {
    URL.revokeObjectURL(uploads[index].url);
    objectUrls.current.delete(uploads[index].url);
    setUploads((previous) => previous.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (busy.current) return;
    const next = {};
    if (!title.trim()) next["product-title"] = "Enter a title.";
    if (!description.trim()) next["product-description"] = "Enter a description.";
    if (!editing && !uploads.length) next["product-images"] = "Choose at least one image.";
    variants.forEach((variant, index) => {
      if (!String(variant.price).trim() || !Number.isFinite(Number(variant.price)) || Number(variant.price) < 0) {
        next["price-" + index] = "Enter a price of 0 or more.";
      }
      if (!editing && (!String(variant.stock).trim() || !Number.isSafeInteger(Number(variant.stock)) || Number(variant.stock) < 0)) {
        next["stock-" + index] = "Enter a whole stock quantity of 0 or more.";
      }
    });
    setErrors(next);
    setServerError("");
    if (Object.keys(next).length) return;
    busy.current = true;
    setSubmitting(true);
    try {
      const result = await onSubmit({
        title: title.trim(), description: description.trim(), currency,
        variants: variants.map((variant) => ({ ...variant, size: variant.size.trim(), color: variant.color.trim() })),
        images: uploads.map((item) => item.file),
      });
      if (!result?.ok) setServerError(result?.error || "Could not save the product. Please try again.");
    } catch {
      setServerError("Could not save the product. Please try again.");
    } finally {
      busy.current = false;
      setSubmitting(false);
    }
  };

  const errorProps = (id) => ({ "aria-invalid": Boolean(errors[id]), "aria-describedby": errors[id] ? id + "-error" : undefined });
  const visibleErrors = Object.entries(errors).filter(([, message]) => message);

  return (
    <form onSubmit={handleSubmit} noValidate aria-busy={submitting} className="mx-auto w-full max-w-[760px] px-5 py-10 sm:px-8">
      <h1 className="text-2xl font-semibold">{editing ? "Edit product" : "New product"}</h1>
      <p className="mt-2 text-sm leading-6 text-neutral-600">
        {editing ? "Update your product details, prices and photos." : "Add the details and photos for your product."}
      </p>

      {(visibleErrors.length > 0 || serverError) && (
        <div ref={errorSummary} tabIndex={-1} role="alert" className="mt-6 border border-red-200 bg-red-50 p-4 text-sm text-red-800 focus:outline-2">
          {serverError || "Please check the following fields:"}
          {visibleErrors.length > 0 && <ul className="mt-2 list-inside list-disc">
            {visibleErrors.map(([id, message]) => <li key={id}><a href={"#" + id} className="underline">{message}</a></li>)}
          </ul>}
        </div>
      )}

      <fieldset disabled={submitting} className="mt-8 min-w-0 space-y-6 disabled:opacity-70">
        <FormField id="product-title" label="Title" error={errors["product-title"]}>
          <input id="product-title" value={title} onChange={(event) => setTitle(event.target.value)} autoComplete="off" required {...errorProps("product-title")} className={inputClass(errors["product-title"])} />
        </FormField>
        <FormField id="product-description" label="Description" error={errors["product-description"]}>
          <textarea id="product-description" rows={4} value={description} onChange={(event) => setDescription(event.target.value)} required {...errorProps("product-description")} className={inputClass(errors["product-description"]) + " h-auto py-3"} />
        </FormField>

        <div>
          <label htmlFor="product-images" className="mb-2 block text-sm font-medium">{editing ? "Replace images" : "Images"}</label>
          <p id="product-images-hint" className="mb-3 text-sm leading-6 text-neutral-600">
            Up to 5 images, 5 MB each. The first image is the cover.
            {editing && " Choose a new set to replace all existing photos, or leave them unchanged."}
          </p>
          {previews.length > 0 && <div className="mb-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
            {previews.map((url, index) => <div key={url + "-" + index} className="relative aspect-square bg-neutral-100">
              <img src={url} alt={"Product preview " + (index + 1)} className="h-full w-full object-cover" />
              {uploads.length > 0 && <button type="button" aria-label={"Remove selected image " + (index + 1)} onClick={() => removeUpload(index)} className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center bg-white text-xl text-black focus-visible:outline-2">×</button>}
            </div>)}
          </div>}
          <input id="product-images" type="file" accept="image/*" multiple onChange={pickFiles} {...errorProps("product-images")} aria-describedby={"product-images-hint" + (errors["product-images"] ? " product-images-error" : "")} className="block min-h-11 w-full min-w-0 text-sm file:mr-3 file:min-h-11 file:border file:border-neutral-300 file:bg-white file:px-3 file:text-sm file:text-black" />
          {errors["product-images"] && <p id="product-images-error" className="mt-1 text-sm text-red-700">{errors["product-images"]}</p>}
        </div>

        <div className="space-y-4 border-t border-neutral-200 pt-6">
          <h2 className="font-medium">{editing ? "Pricing and inventory" : "Price and inventory"}</h2>
          {editing ? (
            <p className="text-sm leading-6 text-neutral-600">Prices can be edited. Size, color, stock and currency cannot be changed after publishing yet.</p>
          ) : (
            <FormField id="product-currency" label="Currency">
              <select id="product-currency" value={currency} onChange={(event) => setCurrency(event.target.value)} className={inputClass(false)}>
                {CURRENCIES.map((value) => <option key={value}>{value}</option>)}
              </select>
            </FormField>
          )}
          {variants.length === 0 && <p className="text-sm text-neutral-600">This product has no variants to price.</p>}
          {variants.map((variant, index) => (
            <div key={index} className="grid grid-cols-1 gap-4 border border-neutral-200 p-4 sm:grid-cols-2">
              {editing && variants.length > 1 && <h3 className="text-sm font-medium sm:col-span-2">Variant {index + 1}</h3>}
              {[["size", "Size"], ["color", "Color"], ["price", "Price (" + (variant.currency || currency) + ")"], ["stock", "Stock"]].map(([key, label]) => {
                const id = key + "-" + index;
                return <FormField key={key} id={id} label={label} error={errors[id]}>
                  <input id={id} type={key === "price" || key === "stock" ? "number" : "text"} min={key === "price" || key === "stock" ? "0" : undefined} step={key === "price" ? "any" : key === "stock" ? "1" : undefined} value={variant[key]} disabled={editing && key !== "price"} onChange={(event) => setVariant(index, key, event.target.value)} {...errorProps(id)} className={inputClass(errors[id]) + " disabled:bg-neutral-100 disabled:text-neutral-600"} />
                </FormField>;
              })}
            </div>
          ))}
          {!editing && <p className="text-sm text-neutral-600">Each new product supports one size and color combination.</p>}
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-neutral-200 pt-6">
          <button type="button" onClick={onCancel} className="min-h-12 border border-neutral-300 px-5 text-sm font-medium hover:bg-neutral-100 focus-visible:outline-2">Cancel</button>
          <button type="submit" className="min-h-12 bg-black px-5 text-sm font-medium text-white hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2">
            {submitting ? "Saving…" : editing ? "Save changes" : "Publish product"}
          </button>
        </div>
      </fieldset>
    </form>
  );
}
