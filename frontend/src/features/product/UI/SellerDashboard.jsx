import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useNavigate, useOutletContext, useParams } from "react-router-dom";
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
    price: variant.price?.basePrice != null ? String(variant.price.basePrice) : "",
    currency: variant.price?.currency ?? "INR",
    stock: variant.stock?.basePrice != null ? String(variant.stock.basePrice) : "0",
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
    <dialog ref={dialog} aria-labelledby="delete-title" aria-describedby="delete-description" aria-busy={busy}
      onCancel={(event) => { event.preventDefault(); if (!busy) onCancel(); }}
      className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-sm border border-neutral-200 bg-white p-6 text-neutral-900 backdrop:bg-black/40">
      <h2 id="delete-title" className="text-xl font-semibold">Delete product?</h2>
      <p id="delete-description" className="mt-3 break-words text-sm leading-6 text-neutral-600">
        “{product.title}” will be removed from your store. This cannot be undone.
      </p>
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" autoFocus disabled={busy} onClick={onCancel} className="min-h-11 border border-neutral-300 px-4 text-sm font-medium disabled:opacity-50">Cancel</button>
        <button type="button" disabled={busy} onClick={onConfirm} className="min-h-11 bg-red-700 px-4 text-sm font-medium text-white disabled:opacity-50">{busy ? "Deleting…" : "Delete"}</button>
      </div>
    </dialog>
  );
}

export default function SellerDashboard() {
  const productState = useProduct();
  const { fetchProducts, loading, error, pendingDelete, deleteProduct, cancelDelete, isDeleting, getMutationError } = productState;
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
    <div className="flex min-h-screen flex-col bg-white text-neutral-900 lg:flex-row">
      <aside className="shrink-0 border-b border-neutral-200 lg:min-h-screen lg:w-56 lg:border-r lg:border-b-0">
        <div className="flex h-16 items-center justify-between px-5">
          <Link to="/" className="text-lg font-bold uppercase tracking-[0.2em]">Snitch</Link>
          <span className="text-xs text-neutral-600">Seller</span>
        </div>
        <nav aria-label="Seller" className="flex flex-wrap gap-1 px-3 pb-3 lg:flex-col">
          {[{ to: "/seller", label: "Products", end: true }, { to: "/seller/new", label: "Add product" }].map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) =>
              "flex min-h-11 items-center px-3 text-sm font-medium " + (isActive ? "bg-black text-white" : "text-neutral-600 hover:bg-neutral-100")}>
              {item.label}
            </NavLink>
          ))}
          <Link to="/" className="flex min-h-11 items-center px-3 text-sm text-neutral-600 hover:bg-neutral-100">View store</Link>
        </nav>
      </aside>
      <main className="min-w-0 flex-1">
        {notice && <div role="status" className="mx-5 mt-6 flex items-center justify-between gap-4 border border-neutral-200 p-3 text-sm sm:mx-8">
          <span>{notice}</span><button type="button" onClick={() => setNotice("")} className="min-h-11 px-2 underline">Dismiss</button>
        </div>}
        {error ? (
          <div className="mx-auto max-w-[760px] px-5 py-10 sm:px-8">
            <h1 className="text-2xl font-semibold">Could not load products</h1>
            <p role="alert" className="mt-3 text-sm leading-6 text-red-700">{error}</p>
            <div className="mt-5 flex gap-4">
              <button type="button" disabled={loading} onClick={() => fetchProducts()} className="min-h-11 bg-black px-4 text-sm text-white disabled:opacity-50">Try again</button>
              <Link to="/signin" className="inline-flex min-h-11 items-center text-sm underline">Sign in</Link>
            </div>
          </div>
        ) : <Outlet context={{ ...productState, loading: !ready || loading, setNotice }} />}
      </main>
      {pendingDelete && <DeleteModal product={pendingDelete} busy={isDeleting(pendingDelete._id)} error={getMutationError(pendingDelete._id)} onCancel={cancelDelete} onConfirm={confirmDelete} />}
    </div>
  );
}

export function SellerListRoute() {
  const { products, loading, requestDelete } = useOutletContext();
  const navigate = useNavigate();
  return <SellerProducts products={products} loading={loading} onAdd={() => navigate("/seller/new")}
    onEdit={(product) => navigate("/seller/" + product._id + "/edit")} onDelete={requestDelete} />;
}

export function SellerNewRoute() {
  const { createProduct, setNotice } = useOutletContext();
  const navigate = useNavigate();
  const handleSubmit = async (values) => {
    const variant = values.variants[0];
    const result = await createProduct({
      title: values.title, description: values.description, priceCurrency: values.currency,
      priceAmount: Number(variant.price), stockAmount: Number(variant.stock),
      size: variant.size, color: variant.color, images: values.images,
    });
    if (result.ok) {
      setNotice("Product published.");
      navigate("/seller");
    }
    return result;
  };
  return <ProductForm onSubmit={handleSubmit} onCancel={() => navigate("/seller")} />;
}

export function SellerEditRoute() {
  const { id } = useParams();
  const { products, loading, renameTitle, changeDescription, changePrice, replaceImages, setNotice } = useOutletContext();
  const navigate = useNavigate();
  const product = products.find((item) => item._id === id);

  if (loading) return <p role="status" className="px-5 py-10 text-sm text-neutral-600">Loading product…</p>;
  if (!product) return (
    <div className="mx-auto max-w-[760px] px-5 py-10 sm:px-8">
      <h1 className="text-2xl font-semibold">Product not found</h1>
      <p className="mt-2 text-sm text-neutral-600">It may have been deleted or belong to another seller.</p>
      <Link to="/seller" className="mt-6 inline-flex min-h-11 items-center text-sm underline">Back to products</Link>
    </div>
  );

  const handleSubmit = async (values) => {
    // Each endpoint saves independently. Keep the latest successful response in
    // the store so retries only send changes that have not already been saved.
    const updates = [];
    if (values.title !== product.title) updates.push(() => renameTitle(id, values.title));
    if (values.description !== product.description) updates.push(() => changeDescription(id, values.description));
    values.variants.forEach((variant, index) => {
      if (Number(variant.price) !== product.verient[index]?.price?.basePrice) {
        updates.push(() => changePrice(id, Number(variant.price), index));
      }
    });
    if (values.images.length) updates.push(() => replaceImages(id, values.images));
    let saved = 0;
    for (const update of updates) {
      const result = await update();
      if (!result.ok) return {
        ok: false,
        error: (saved ? "Some changes were saved. " : "") + result.error + " Your remaining edits are still here. Try saving again.",
      };
      saved += 1;
    }
    setNotice(updates.length ? "Product updated." : "No changes to save.");
    navigate("/seller");
    return { ok: true };
  };

  return <ProductForm key={product._id} initialValues={toInitialValues(product)} onSubmit={handleSubmit} onCancel={() => navigate("/seller")} />;
}
