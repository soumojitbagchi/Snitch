import { useEffect, useRef, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";
import SellerProducts from "./SellerProducts";
import ProductForm from "./ProductForm";
import { useProduct } from "../hooks/useProduct";

const toInitialValues = (product) => ({
  title: product.title,
  description: product.description,
  currency: product.verient?.[0]?.price?.currency ?? "INR",
  images: (product.images ?? []).map((image) => image.url),
  variants: (product.verient ?? []).map((variant) => ({
    size: variant.attributes?.size ?? "",
    color: variant.attributes?.color ?? "",
    price:
      variant.price?.basePrice != null ? String(variant.price.basePrice) : "",
    currency: variant.price?.currency ?? "INR",
    stock:
      variant.stock?.basePrice != null ? String(variant.stock.basePrice) : "0",
  })),
});

function DeleteModal({ product, busy, error, onCancel, onConfirm }) {
  const dialog = useRef(null);

  useEffect(() => {
    const element = dialog.current;
    element.showModal();

    return () => element.close();
  }, []);

  return (
    <dialog
      ref={dialog}
      aria-labelledby="delete-title"
      aria-describedby="delete-description"
      aria-busy={busy}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onCancel();
      }}
      className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-sm border border-neutral-300 bg-white p-6 text-neutral-900 backdrop:bg-black/45"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-red-700">
        Permanent action
      </p>
      <h2 id="delete-title" className="mt-2 text-xl font-semibold">
        Delete product?
      </h2>
      <p
        id="delete-description"
        className="mt-3 break-words text-sm leading-6 text-neutral-700"
      >
        “{product.title}” will be removed from your store. This cannot be undone.
      </p>
      {error && (
        <p role="alert" className="mt-4 border-l-2 border-red-700 pl-3 text-sm leading-6 text-red-700">
          {error}
        </p>
      )}
      <div className="mt-7 flex flex-wrap justify-end gap-3">
        <button
          type="button"
          autoFocus
          disabled={busy}
          onClick={onCancel}
          className="min-h-11 border border-neutral-300 px-4 text-sm font-medium transition-colors hover:border-black hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onConfirm}
          className="min-h-11 bg-red-700 px-4 text-sm font-medium text-white transition-colors hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Deleting…" : "Delete"}
        </button>
      </div>
    </dialog>
  );
}

const sellerNavigation = [
  { to: "/seller", label: "Products", end: true },
  { to: "/seller/new", label: "Add product" },
];

export default function SellerDashboard() {
  const productState = useProduct();
  const {
    fetchProducts,
    loading,
    error,
    pendingDelete,
    deleteProduct,
    cancelDelete,
    isDeleting,
    getMutationError,
  } = productState;
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  const deleteLock = useRef(false);

  useEffect(() => {
    const controller = new AbortController();

    fetchProducts(controller.signal).then(() => {
      if (!controller.signal.aborted) setReady(true);
    });

    return () => controller.abort();
  }, [fetchProducts]);

  const confirmDelete = async () => {
    if (!pendingDelete || deleteLock.current) return;

    deleteLock.current = true;
    const result = await deleteProduct(pendingDelete._id);
    if (result.ok) setNotice("Product deleted.");
    deleteLock.current = false;
  };

  return (
    <div className="flex min-h-dvh flex-col bg-white text-neutral-900 lg:flex-row">
      <aside className="shrink-0 border-b border-neutral-200 bg-white lg:min-h-dvh lg:w-60 lg:border-b-0 lg:border-r">
        <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-5 lg:h-20">
          <Link
            to="/"
            className="text-lg font-bold uppercase tracking-[0.22em] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
          >
            Snitch
          </Link>
          <span className="border border-neutral-300 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-700 lg:hidden">
            Seller
          </span>
        </div>

        <div className="px-3 py-3 lg:px-4 lg:py-6">
          <p className="hidden px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-600 lg:block">
            Seller studio
          </p>
          <nav
            aria-label="Seller"
            className="-mx-3 mt-0 flex gap-1 overflow-x-auto px-3 pb-1 lg:mx-0 lg:mt-3 lg:flex-col lg:overflow-visible lg:px-0"
          >
            {sellerNavigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex min-h-11 shrink-0 items-center border px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black lg:w-full ${
                    isActive
                      ? "border-black bg-black text-white"
                      : "border-transparent text-neutral-700 hover:border-neutral-300 hover:bg-neutral-100 hover:text-black"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to="/"
              className="flex min-h-11 shrink-0 items-center border border-transparent px-3 text-sm text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-100 hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black lg:w-full"
            >
              View store
            </Link>
          </nav>
        </div>

        <div className="mt-auto hidden border-t border-neutral-200 px-7 py-5 lg:block">
          <p className="text-sm font-medium">Manage your collection</p>
          <p className="mt-1 text-sm leading-5 text-neutral-600">
            Publish, price, and maintain products from one place.
          </p>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        {notice && (
          <div
            role="status"
            className="mx-5 mt-6 flex items-center justify-between gap-4 border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-800 sm:mx-8"
          >
            <span>{notice}</span>
            <button
              type="button"
              onClick={() => setNotice("")}
              className="min-h-11 shrink-0 px-2 text-sm font-medium underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            >
              Dismiss
            </button>
          </div>
        )}

        {error ? (
          <div className="mx-auto max-w-[760px] px-5 py-12 sm:px-8 sm:py-16">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-600">
              Seller studio
            </p>
            <h1 className="mt-2 text-2xl font-semibold">Could not load products</h1>
            <p role="alert" className="mt-4 border-l-2 border-red-700 pl-3 text-sm leading-6 text-red-700">
              {error}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={() => fetchProducts()}
                className="min-h-11 bg-black px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                Try again
              </button>
              <Link
                to="/signin"
                className="inline-flex min-h-11 items-center px-2 text-sm font-medium underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
                Sign in
              </Link>
            </div>
          </div>
        ) : (
          <Outlet
            context={{
              ...productState,
              loading: !ready || loading,
              setNotice,
            }}
          />
        )}
      </main>

      {pendingDelete && (
        <DeleteModal
          product={pendingDelete}
          busy={isDeleting(pendingDelete._id)}
          error={getMutationError(pendingDelete._id)}
          onCancel={cancelDelete}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

export function SellerListRoute() {
  const { products, loading, requestDelete } = useOutletContext();
  const navigate = useNavigate();

  return (
    <SellerProducts
      products={products}
      loading={loading}
      onAdd={() => navigate("/seller/new")}
      onEdit={(product) => navigate(`/seller/${product._id}/edit`)}
      onDelete={requestDelete}
    />
  );
}

export function SellerNewRoute() {
  const { createProduct, setNotice } = useOutletContext();
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    const variant = values.variants[0];
    const result = await createProduct({
      title: values.title,
      description: values.description,
      priceCurrency: values.currency,
      priceAmount: Number(variant.price),
      stockAmount: Number(variant.stock),
      size: variant.size,
      color: variant.color,
      images: values.images,
    });

    if (result.ok) {
      setNotice("Product published.");
      navigate("/seller");
    }

    return result;
  };

  return (
    <ProductForm
      onSubmit={handleSubmit}
      onCancel={() => navigate("/seller")}
    />
  );
}

export function SellerEditRoute() {
  const { id } = useParams();
  const {
    products,
    loading,
    renameTitle,
    changeDescription,
    changePrice,
    replaceImages,
    setNotice,
  } = useOutletContext();
  const navigate = useNavigate();
  const product = products.find((item) => item._id === id);

  if (loading) {
    return (
      <div role="status" className="mx-auto max-w-[760px] px-5 py-12 text-sm text-neutral-600 sm:px-8">
        Loading product…
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-[760px] px-5 py-12 sm:px-8 sm:py-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-600">
          Seller studio
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Product not found</h1>
        <p className="mt-3 text-sm leading-6 text-neutral-600">
          It may have been deleted or belong to another seller.
        </p>
        <Link
          to="/seller"
          className="mt-6 inline-flex min-h-11 items-center px-2 text-sm font-medium underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          Back to products
        </Link>
      </div>
    );
  }

  const handleSubmit = async (values) => {
    // Each endpoint saves independently. Keep the latest successful response in
    // the store so retries only send changes that have not already been saved.
    const updates = [];
    if (values.title !== product.title) {
      updates.push(() => renameTitle(id, values.title));
    }
    if (values.description !== product.description) {
      updates.push(() => changeDescription(id, values.description));
    }
    values.variants.forEach((variant, index) => {
      if (Number(variant.price) !== product.verient[index]?.price?.basePrice) {
        updates.push(() => changePrice(id, Number(variant.price), index));
      }
    });
    if (values.images.length) updates.push(() => replaceImages(id, values.images));

    let saved = 0;
    for (const update of updates) {
      const result = await update();
      if (!result.ok) {
        return {
          ok: false,
          error:
            (saved ? "Some changes were saved. " : "") +
            result.error +
            " Your remaining edits are still here. Try saving again.",
        };
      }
      saved += 1;
    }

    setNotice(updates.length ? "Product updated." : "No changes to save.");
    navigate("/seller");
    return { ok: true };
  };

  return (
    <ProductForm
      key={product._id}
      initialValues={toInitialValues(product)}
      onSubmit={handleSubmit}
      onCancel={() => navigate("/seller")}
    />
  );
}
