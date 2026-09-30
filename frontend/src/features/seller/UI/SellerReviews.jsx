import { useCallback, useEffect, useState } from "react";
import { fetchSellerReviews, replySellerReview } from "../services/seller.api";
import {
  EmptyState,
  ErrorBlock,
  LoadingBlock,
  PageHeader,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "./seller.ui";

const RATING_FILTERS = ["", "5", "4", "3", "2", "1"];

function Stars({ value }) {
  return (
    <span aria-label={`Rated ${value} out of 5`} className="inline-flex gap-0.5 text-sm tracking-tight">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} aria-hidden="true" className={star <= value ? "text-black" : "text-neutral-300"}>
          ★
        </span>
      ))}
    </span>
  );
}

function ReplyBox({ review, onSave, busy }) {
  const [draft, setDraft] = useState(review.sellerReply || "");
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-3 border-t border-neutral-100 pt-3">
      {review.sellerReply && !open ? (
        <p className="text-sm leading-6 text-neutral-700">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Your reply —{" "}
          </span>
          {review.sellerReply}
        </p>
      ) : null}
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-2 inline-flex min-h-11 items-center border border-neutral-300 px-4 text-xs font-semibold uppercase tracking-[0.14em] transition-colors hover:border-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          {review.sellerReply ? "Edit reply" : "Reply"}
        </button>
      ) : (
        <div className="mt-2">
          <label htmlFor={`reply-${review._id}`} className="text-xs font-medium text-neutral-600">
            Reply as the seller (visible to buyers)
          </label>
          <textarea
            id={`reply-${review._id}`}
            value={draft}
            disabled={busy}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={2000}
            rows={3}
            className={`${inputClass} mt-1 h-auto min-h-11 py-2 disabled:opacity-60`}
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              disabled={busy || !draft.trim()}
              onClick={() => onSave(review._id, draft.trim())}
              className={primaryButtonClass}
            >
              {busy ? "Saving…" : "Save reply"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setDraft(review.sellerReply || "");
                setOpen(false);
              }}
              className={secondaryButtonClass}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SellerReviews({ setNotice }) {
  const [reviews, setReviews] = useState([]);
  const [perProduct, setPerProduct] = useState([]);
  const [average, setAverage] = useState(0);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [rating, setRating] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyIds, setBusyIds] = useState({});

  const load = useCallback(
    (nextPage, nextRating) =>
      fetchSellerReviews(nextPage, 20, nextRating)
        .then((response) => {
          setReviews(Array.isArray(response?.data) ? response.data : []);
          setPerProduct(Array.isArray(response?.perProduct) ? response.perProduct : []);
          setAverage(Number(response?.average) || 0);
          setTotal(response?.total ?? 0);
          setPage(response?.page ?? nextPage);
          setPages(response?.pages ?? 1);
          setLoading(false);
        })
        .catch((requestError) => {
          setError(requestError?.response?.data?.message || "Could not load reviews.");
          setLoading(false);
        }),
    [],
  );

  useEffect(() => {
    load(page, rating);
  }, [page, rating, load]);

  const pickRating = (option) => {
    if (option === rating && page === 1) return;
    setLoading(true);
    setError("");
    setPage(1);
    setRating(option);
  };

  const goToPage = (nextPage) => {
    setLoading(true);
    setError("");
    setPage(nextPage);
  };

  const retry = () => {
    setLoading(true);
    setError("");
    load(page, rating);
  };

  const saveReply = async (reviewId, text) => {
    setBusyIds((prev) => ({ ...prev, [reviewId]: true }));
    try {
      await replySellerReview(reviewId, text);
      setReviews((prev) => prev.map((item) => (item._id === reviewId ? { ...item, sellerReply: text } : item)));
      if (setNotice) setNotice("Reply saved.");
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Could not save the reply.");
    } finally {
      setBusyIds((prev) => {
        const copy = { ...prev };
        delete copy[reviewId];
        return copy;
      });
    }
  };

  return (
    <section aria-label="Reviews" className="mx-auto w-full max-w-[1100px] px-5 py-10 sm:px-8 sm:py-12">
      <PageHeader
        eyebrow="Seller studio"
        title="Reviews"
        description={
          total > 0
            ? `${total} verified review(s) · average ${average.toFixed(1)} out of 5.`
            : "Verified buyer reviews on your products appear here."
        }
      />

      {perProduct.length > 0 && (
        <div className="mt-8 border border-neutral-200">
          <h2 className="border-b border-neutral-200 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
            Average rating per product
          </h2>
          <ul className="divide-y divide-neutral-100">
            {perProduct.map((row) => (
              <li key={row._id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                <span className="min-w-0 truncate font-medium">{row.title || "Product"}</span>
                <span className="flex shrink-0 items-center gap-2">
                  <Stars value={Math.round(row.avg)} />
                  <span className="tabular-nums text-neutral-600">
                    {Number(row.avg).toFixed(1)} ({row.count})
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Rating filter">
        {RATING_FILTERS.map((option) => (
          <button
            key={option || "all"}
            type="button"
            aria-pressed={rating === option}
            onClick={() => pickRating(option)}
            className={`inline-flex min-h-11 items-center border px-4 text-xs font-semibold uppercase tracking-[0.14em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${
              rating === option
                ? "border-black bg-black text-white"
                : "border-neutral-300 text-neutral-700 hover:border-black hover:text-black"
            }`}
          >
            {option ? `${option} stars` : "All"}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {loading ? (
          <LoadingBlock label="Loading reviews…" />
        ) : error ? (
          <ErrorBlock error={error} onRetry={retry} />
        ) : reviews.length === 0 ? (
          <EmptyState
            title="No reviews yet"
            description="Reviews can only be left by verified purchases, one per order."
          />
        ) : (
          <>
            <ul className="divide-y divide-neutral-200 border-y border-neutral-200">
              {reviews.map((review) => (
                <li key={review._id} className="py-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold">
                      {review.prod?.title || "Product"}{" "}
                      <span className="font-normal text-neutral-500">
                        · {review.author?.fullname || "Verified buyer"}
                      </span>
                    </p>
                    <Stars value={review.rating} />
                  </div>
                  {review.text && (
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-700">{review.text}</p>
                  )}
                  <p className="mt-1 text-xs text-neutral-500">
                    {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                  <ReplyBox review={review} onSave={saveReply} busy={Boolean(busyIds[review._id])} />
                </li>
              ))}
            </ul>
            <div className="mt-6 flex items-center justify-between gap-3">
              <p className="text-sm text-neutral-600" role="status">
                Page {page} of {Math.max(pages, 1)}
              </p>
              <div className="flex gap-3">
                <button type="button" disabled={page <= 1} onClick={() => goToPage(page - 1)} className={secondaryButtonClass}>
                  Previous
                </button>
                <button type="button" disabled={page >= pages} onClick={() => goToPage(page + 1)} className={secondaryButtonClass}>
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
