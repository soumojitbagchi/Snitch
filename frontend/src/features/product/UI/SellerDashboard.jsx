import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate, useOutletContext, useParams } from "react-router-dom";
import SellerProducts from "./SellerProducts";
import ProductForm from "./ProductForm";
import { mockProducts } from "./mockProducts";

function IconGrid() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="3" width="8" height="8" />
      <rect x="13" y="3" width="8" height="8" />
      <rect x="3" y="13" width="8" height="8" />
      <rect x="13" y="13" width="8" height="8" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

function IconStore() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 9l1.5-5h13L20 9M4 9h16M4 9v11h16V9M9 20v-6h6v6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const toInitialValues = (p) => ({
  title: p.title,
  description: p.description,
  currency: p.verient?.[0]?.price?.currency ?? "INR",
  images: (p.images ?? []).map((i) => i.url),
  variants: (p.verient ?? []).map((v) => ({
    size: v.attributes?.size ?? "",
    color: v.attributes?.color ?? "",
    price: v.price?.basePrice != null ? String(v.price.basePrice) : "",
    stock: v.stock?.basePrice != null ? String(v.stock.basePrice) : "",
  })),
});

const fromFormValues = (v) => ({
  title: v.title,
  description: v.description,
  images: [],
  verient: v.variants
    .filter((row) => row.size.trim() || row.color.trim() || row.price !== "")
    .map((row) => ({
      images: [],
      price: { basePrice: Number(row.price) || 0, currency: v.currency },
      stock: { basePrice: Number(row.stock) || 0, currency: v.currency },
      attributes: { ...(row.size.trim() ? { size: row.size.trim() } : {}), ...(row.color.trim() ? { color: row.color.trim() } : {}) },
    })),
});

function DeleteModal({ product, onCancel, onConfirm }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Delete ${product.title}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-5"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm border border-neutral-200 bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-red-600">
          Delete product
        </p>
        <p className="mt-3 font-serif text-2xl font-light leading-snug">
          Remove “{product.title}”?
        </p>
        <p className="mt-2 text-[14px] leading-6 text-neutral-500">
          This takes it off the store immediately. You can’t undo this.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex h-11 flex-1 items-center justify-center border border-neutral-300 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors hover:border-black active:scale-[0.98]"
          >
            Keep it
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex h-11 flex-1 items-center justify-center bg-red-600 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-red-700 active:scale-[0.98]"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

const NAV = [
  { to: "/seller", end: true, label: "Products", icon: <IconGrid /> },
  { to: "/seller/new", end: false, label: "Add product", icon: <IconPlus /> },
];

export default function SellerDashboard() {
  const [products, setProducts] = useState(mockProducts);
  const [pendingDelete, setPendingDelete] = useState(null);


  const addProduct = (values) => {
    const product = {
      _id: `mock-${Date.now()}`,
      category: "New",
      ...fromFormValues(values),
    };
    setProducts((prev) => [product, ...prev]);
  };

  const updateProduct = (id, values) => {
    setProducts((prev) =>
      prev.map((p) => (p._id === id ? { ...p, ...fromFormValues(values) } : p)),
    );
  };

  const confirmDelete = () => {
    setProducts((prev) => prev.filter((p) => p._id !== pendingDelete._id));
    setPendingDelete(null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900 lg:flex-row">
      {/* Top bar (mobile) / sidebar (desktop) */}
      <aside className="shrink-0 border-b border-neutral-200 bg-white lg:flex lg:min-h-screen lg:w-64 lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex h-16 items-center justify-between px-5 sm:px-8 lg:px-6">
          <Link to="/" className="text-lg font-bold uppercase tracking-[0.3em]">
            Snitch
          </Link>
          <span className="bg-black px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
            Seller
          </span>
        </div>
        <nav aria-label="Seller" className="flex gap-1 overflow-x-auto px-3 pb-3 sm:px-6 lg:flex-col lg:gap-0.5 lg:px-3 lg:pb-0 lg:pt-2">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2.5 px-3 py-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] transition-colors ${
                  isActive ? "bg-black text-white" : "text-neutral-600 hover:bg-neutral-100 hover:text-black"
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2.5 px-3 py-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-black"
          >
            <IconStore />
            View store
          </Link>
        </nav>
        <div className="mt-auto hidden border-t border-neutral-200 p-6 lg:block">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center bg-black text-[13px] font-semibold text-white">
              S
            </span>
            <div className="min-w-0">
              <p className="truncate text-[14px] font-medium">Seller Studio</p>
              <p className="text-[12px] text-neutral-500">FW26 · Drop 02</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="min-w-0 flex-1">
        <Outlet
          context={{ products, addProduct, updateProduct, requestDelete: setPendingDelete }}
        />
      </main>

      {pendingDelete && (
        <DeleteModal
          product={pendingDelete}
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

export function SellerListRoute() {
  const { products, requestDelete } = useOutletContext();
  const navigate = useNavigate();
  return (
    <SellerProducts
      products={products}
      onAdd={() => navigate("/seller/new")}
      onEdit={(p) => navigate(`/seller/${p._id}/edit`)}
      onDelete={(p) => requestDelete(p)}
    />
  );
}

export function SellerNewRoute() {
  const { addProduct } = useOutletContext();
  const navigate = useNavigate();
  return (
    <ProductForm
      submitLabel="Publish product"
      onSubmit={(values) => {
        addProduct(values);
        navigate("/seller");
      }}
      onCancel={() => navigate("/seller")}
    />
  );
}

export function SellerEditRoute() {
  const { id } = useParams();
  const { products, updateProduct } = useOutletContext();
  const navigate = useNavigate();
  const product = products.find((p) => p._id === id);

  if (!product) {
    return (
      <div className="mx-auto w-full max-w-[720px] px-5 py-20 text-center sm:px-8">
        <p className="font-serif text-3xl font-light">Product not found.</p>
        <p className="mt-2 text-[14px] leading-6 text-neutral-500">
          It may have been deleted.
        </p>
        <Link
          to="/seller"
          className="mt-6 inline-flex h-12 items-center bg-black px-6 text-[12px] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-neutral-800"
        >
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <ProductForm
      key={product._id}
      initialValues={toInitialValues(product)}
      submitLabel="Save changes"
      onSubmit={(values) => {
        updateProduct(product._id, values);
        navigate("/seller");
      }}
      onCancel={() => navigate("/seller")}
    />
  );
}

