export const formatPrice = (price) => {
  if (!Number.isFinite(price?.basePrice)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: price.currency || "INR",
    maximumFractionDigits: 2,
  }).format(price.basePrice);
};

export const variantPriceRange = (product) => {
  const prices = (product.verient ?? [])
    .map((variant) => variant.price)
    .filter((price) => Number.isFinite(price?.basePrice));
  if (!prices.length) return null;
  // Amounts in different currencies cannot be compared without exchange rates.
  const currency = prices[0].currency || "INR";
  const amounts = prices.filter((price) => (price.currency || "INR") === currency)
    .map((price) => price.basePrice);
  return { min: Math.min(...amounts), max: Math.max(...amounts), currency };
};

export const totalStock = (product) => (product.verient ?? []).reduce(
  (sum, variant) => sum + (Number.isFinite(variant.stock?.basePrice) ? Math.max(0, variant.stock.basePrice) : 0),
  0,
);

export const stockState = (product) => {
  if (!product.verient?.length) return "nostock";
  const total = totalStock(product);
  return total === 0 ? "out" : total <= 5 ? "low" : "in";
};

export const sizeList = (product) => [...new Set(
  (product.verient ?? []).map((variant) => variant.attributes?.size).filter(Boolean),
)];

export const productError = (error, fallback) => {
  if (error?.response?.status === 401 || error?.response?.status === 403) {
    return "A signed-in seller account is required to access products. Please sign in as a seller and try again.";
  }
  const message = error?.response?.data?.message || error?.response?.data?.error;
  return typeof message === "string" ? message : fallback;
};
