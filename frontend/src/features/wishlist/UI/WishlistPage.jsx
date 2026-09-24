import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../../../components/Navbar";
import ProductCard from "../../product/UI/ProductCard";
import {
  fetchWishlist,
  selectWishlistError,
  selectWishlistItems,
  selectWishlistStatus,
} from "../../redux/wishlist.slice";

export default function WishlistPage() {
  const dispatch = useDispatch();
  const products = useSelector(selectWishlistItems);
  const status = useSelector(selectWishlistStatus);
  const error = useSelector(selectWishlistError);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  return (
    <div className="flex min-h-dvh flex-col bg-white text-neutral-900">
      <Navbar />
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-5 py-10 sm:px-8 sm:py-14">
        <header className="mb-8 border-b border-neutral-200 pb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Saved for later</p>
          <div className="mt-2 flex flex-wrap items-baseline justify-between gap-3">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Your wishlist</h1>
            {status === "succeeded" && <p className="text-sm text-neutral-500">{products.length} {products.length === 1 ? "piece" : "pieces"}</p>}
          </div>
        </header>

        {status === "loading" && (
          <div role="status" className="py-14 text-center text-sm text-neutral-500">Loading your wishlist…</div>
        )}

        {status === "failed" && (
          <section className="border border-neutral-200 px-6 py-12 text-center">
            <h2 className="text-lg font-semibold">We couldn’t load your saved pieces.</h2>
            <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>
            <button type="button" onClick={() => dispatch(fetchWishlist())} className="mt-5 min-h-11 bg-black px-5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black">Try again</button>
          </section>
        )}

        {status === "succeeded" && products.length === 0 && (
          <section className="border border-dashed border-neutral-300 px-6 py-16 text-center sm:py-20">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">Nothing saved yet</p>
            <h2 className="mt-2 text-xl font-semibold">Keep the pieces you love close.</h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-neutral-600">Tap the heart on a product to add it here and come back whenever you’re ready.</p>
            <Link to="/" className="mt-7 inline-flex min-h-11 items-center justify-center bg-black px-6 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black">Explore collection</Link>
          </section>
        )}

        {status === "succeeded" && products.length > 0 && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 md:gap-x-5 xl:grid-cols-4 xl:gap-x-6">
            {products.map((product) => <ProductCard key={product._id} product={product} />)}
          </div>
        )}
      </main>
    </div>
  );
}
