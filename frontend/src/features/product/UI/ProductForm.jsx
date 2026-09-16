import { useEffect, useRef, useState } from "react";
import { inputClass } from "../../auth/UI/inputClass";

const CURRENCIES = ["INR", "USD", "EUR", "GBP"];
const blankVariant = () => ({ size: "", color: "", price: "", stock: "0" });

const controlClass = (hasError, extra = "") =>
  `${inputClass(hasError)} focus-visible:outline-2 focus-visible:outline-offset-2 ${
    hasError ? "focus-visible:outline-red-700" : "focus-visible:outline-black"
  } ${extra}`;

function FormField({ id, label, error, required = false, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 flex items-center gap-1 text-sm font-medium text-neutral-900">
        {label}
        {required && <span aria-hidden="true" className="text-red-700">*</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm leading-5 text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

function SectionHeading({ id, eyebrow, title, description }) {
  return (
    <div className="border-b border-neutral-200 pb-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-600">
        {eyebrow}
      </p>
      <h2 id={id} className="mt-2 text-lg font-semibold">{title}</h2>
      {description && (
        <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
          {description}
        </p>
      )}
    </div>
  );
}

export default function ProductForm({ initialValues = null, onSubmit, onCancel }) {
  const editing = Boolean(initialValues);
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [currency, setCurrency] = useState(initialValues?.currency ?? "INR");
  const [variants, setVariants] = useState(
    initialValues?.variants ?? [blankVariant()]
  );
  const [uploads, setUploads] = useState([]);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const busy = useRef(false);
  const objectUrls = useRef(new Set());
  const errorSummary = useRef(null);
  const existingImages = initialValues?.images ?? [];
  const previews = uploads.length
    ? uploads.map((item) => item.url)
    : existingImages;

  useEffect(() => {
    const urls = objectUrls.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  useEffect(() => {
    if (Object.values(errors).some(Boolean) || serverError) {
      errorSummary.current?.focus();
    }
  }, [errors, serverError]);

  const setVariant = (index, key, value) => {
    setVariants((previous) =>
      previous.map((variant, itemIndex) =>
        itemIndex === index ? { ...variant, [key]: value } : variant
      )
    );
  };

  const pickFiles = (event) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;

    let message = "";
    if (files.length + uploads.length > 5) {
      message = "Choose up to 5 images.";
    } else if (files.some((file) => !file.type.startsWith("image/"))) {
      message = "Choose image files only.";
    } else if (files.some((file) => file.size > 5 * 1024 * 1024)) {
      message = "Each image must be 5 MB or smaller.";
    }

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
    setUploads((previous) => previous.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (busy.current) return;

    const next = {};
    if (!title.trim()) next["product-title"] = "Enter a title.";
    if (!description.trim()) next["product-description"] = "Enter a description.";
    if (!editing && !uploads.length) {
      next["product-images"] = "Choose at least one image.";
    }

    variants.forEach((variant, index) => {
      if (
        !String(variant.price).trim() ||
        !Number.isFinite(Number(variant.price)) ||
        Number(variant.price) < 0
      ) {
        next[`price-${index}`] = "Enter a price of 0 or more.";
      }

      if (
        !editing &&
        (!String(variant.stock).trim() ||
          !Number.isSafeInteger(Number(variant.stock)) ||
          Number(variant.stock) < 0)
      ) {
        next[`stock-${index}`] = "Enter a whole stock quantity of 0 or more.";
      }
    });

    setErrors(next);
    setServerError("");
    if (Object.keys(next).length) return;

    busy.current = true;
    setSubmitting(true);

    try {
      const result = await onSubmit({
        title: title.trim(),
        description: description.trim(),
        currency,
        variants: variants.map((variant) => ({
          ...variant,
          size: variant.size.trim(),
          color: variant.color.trim(),
        })),
        images: uploads.map((item) => item.file),
      });

      if (!result?.ok) {
        setServerError(
          result?.error || "Could not save the product. Please try again."
        );
      }
    } catch {
      setServerError("Could not save the product. Please try again.");
    } finally {
      busy.current = false;
      setSubmitting(false);
    }
  };

  const errorProps = (id) => ({
    "aria-invalid": Boolean(errors[id]),
    "aria-describedby": errors[id] ? `${id}-error` : undefined,
  });
  const visibleErrors = Object.entries(errors).filter(([, message]) => message);

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-busy={submitting}
      className="mx-auto w-full max-w-[760px] px-5 py-10 sm:px-8 sm:py-12"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-600">
        Seller studio
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        {editing ? "Edit product" : "New product"}
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-600">
        {editing
          ? "Update your product details, prices and photos."
          : "Add the details and photos for your product."}
      </p>

      {(visibleErrors.length > 0 || serverError) && (
        <div
          ref={errorSummary}
          tabIndex={-1}
          role="alert"
          className="mt-7 border border-red-200 border-l-2 border-l-red-700 bg-red-50 px-4 py-4 text-sm text-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
        >
          <p className="font-medium">
            {serverError || "Please check the following fields:"}
          </p>
          {visibleErrors.length > 0 && (
            <ul className="mt-2 list-inside list-disc space-y-1">
              {visibleErrors.map(([id, message]) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className="underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
                  >
                    {message}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <fieldset
        disabled={submitting}
        className="mt-8 min-w-0 space-y-10 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <section aria-labelledby="details-heading" className="space-y-5">
          <SectionHeading
            id="details-heading"
            eyebrow="01 / Details"
            title="Product details"
            description="Give customers the essential information before they choose a size."
          />
          <div className="grid gap-5">
            <FormField
              id="product-title"
              label="Title"
              error={errors["product-title"]}
              required
            >
              <input
                id="product-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                autoComplete="off"
                required
                {...errorProps("product-title")}
                className={controlClass(errors["product-title"])}
              />
            </FormField>
            <FormField
              id="product-description"
              label="Description"
              error={errors["product-description"]}
              required
            >
              <textarea
                id="product-description"
                rows={5}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
                {...errorProps("product-description")}
                className={controlClass(
                  errors["product-description"],
                  "h-auto resize-y py-3"
                )}
              />
            </FormField>
          </div>
        </section>

        <section aria-labelledby="images-heading" className="space-y-5">
          <SectionHeading
            id="images-heading"
            eyebrow="02 / Images"
            title="Product images"
            description="Up to 5 images, 5 MB each. The first image is the cover."
          />
          <div>
            <label
              htmlFor="product-images"
              className="mb-2 flex items-center gap-1 text-sm font-medium text-neutral-900"
            >
              {editing ? "Replace images" : "Images"}
              {!editing && <span aria-hidden="true" className="text-red-700">*</span>}
            </label>
            <p
              id="product-images-hint"
              className="mb-4 text-sm leading-6 text-neutral-600"
            >
              {editing &&
                "Choose a new set to replace all existing photos, or leave them unchanged."}
            </p>

            {previews.length > 0 && (
              <div className="mb-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
                {previews.map((url, index) => (
                  <div
                    key={`${url}-${index}`}
                    className="relative aspect-[3/4] overflow-hidden border border-neutral-200 bg-neutral-100"
                  >
                    <img
                      src={url}
                      alt={`Product preview ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    {uploads.length > 0 && (
                      <button
                        type="button"
                        aria-label={`Remove selected image ${index + 1}`}
                        onClick={() => removeUpload(index)}
                        className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center border border-neutral-300 bg-white text-lg font-medium text-neutral-900 transition-colors hover:border-red-700 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <input
              id="product-images"
              type="file"
              accept="image/*"
              multiple
              onChange={pickFiles}
              {...errorProps("product-images")}
              aria-describedby={`product-images-hint${
                errors["product-images"] ? " product-images-error" : ""
              }`}
              className="block min-h-12 w-full min-w-0 border border-neutral-300 bg-white text-sm text-neutral-700 transition-colors hover:border-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black file:mr-3 file:min-h-12 file:border-0 file:border-r file:border-neutral-300 file:bg-neutral-100 file:px-4 file:text-sm file:font-medium file:text-neutral-900"
            />
            {errors["product-images"] && (
              <p
                id="product-images-error"
                className="mt-2 text-sm leading-5 text-red-700"
              >
                {errors["product-images"]}
              </p>
            )}
          </div>
        </section>

        <section aria-labelledby="inventory-heading" className="space-y-5">
          <SectionHeading
            id="inventory-heading"
            eyebrow="03 / Inventory"
            title={editing ? "Pricing and inventory" : "Price and inventory"}
            description={
              editing
                ? "Prices can be edited. Size, color, stock and currency cannot be changed after publishing yet."
                : "Each new product supports one size and color combination."
            }
          />

          {editing ? (
            <p className="sr-only">Currency selection is unavailable while editing.</p>
          ) : (
            <div className="max-w-xs">
              <FormField id="product-currency" label="Currency">
                <select
                  id="product-currency"
                  value={currency}
                  onChange={(event) => setCurrency(event.target.value)}
                  className={controlClass(false)}
                >
                  {CURRENCIES.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </FormField>
            </div>
          )}

          {variants.length === 0 && (
            <p className="text-sm text-neutral-600">
              This product has no variants to price.
            </p>
          )}

          <div className="space-y-4">
            {variants.map((variant, index) => (
              <div
                key={index}
                className="border border-neutral-200 bg-neutral-50/50 p-4 sm:p-5"
              >
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h3 className="text-sm font-semibold">
                    {variants.length > 1 ? `Variant ${index + 1}` : "Variant"}
                  </h3>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-600">
                    {variant.currency || currency}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {[
                    ["size", "Size"],
                    ["color", "Color"],
                    ["price", `Price (${variant.currency || currency})`],
                    ["stock", "Stock"],
                  ].map(([key, label]) => {
                    const id = `${key}-${index}`;
                    const numeric = key === "price" || key === "stock";
                    const disabled = editing && key !== "price";

                    return (
                      <FormField
                        key={key}
                        id={id}
                        label={label}
                        error={errors[id]}
                        required={key === "price" || (!editing && key === "stock")}
                      >
                        <input
                          id={id}
                          type={numeric ? "number" : "text"}
                          min={numeric ? "0" : undefined}
                          step={
                            key === "price"
                              ? "any"
                              : key === "stock"
                                ? "1"
                                : undefined
                          }
                          value={variant[key]}
                          disabled={disabled}
                          onChange={(event) =>
                            setVariant(index, key, event.target.value)
                          }
                          {...errorProps(id)}
                          className={controlClass(
                            errors[id],
                            "disabled:cursor-not-allowed disabled:border-neutral-200 disabled:bg-neutral-100 disabled:text-neutral-700"
                          )}
                        />
                      </FormField>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap justify-end gap-3 border-t border-neutral-900 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-12 border border-neutral-300 px-5 text-sm font-medium text-neutral-900 transition-colors hover:border-black hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="min-h-12 bg-black px-5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            {submitting ? "Saving…" : editing ? "Save changes" : "Publish product"}
          </button>
        </div>
      </fieldset>
    </form>
  );
}
