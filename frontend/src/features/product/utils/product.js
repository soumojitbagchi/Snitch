export const formatPrice = (price) => {
  if (!Number.isFinite(price?.basePrice)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: price.currency || "INR",
    maximumFractionDigits: 2,
  }).format(price.basePrice);
};

export const variantPriceRange = (product) => {
  const variants = product?.verient || product?.variant || [];
  const prices = variants
    .map((variant) => variant.price)
    .filter((price) => Number.isFinite(price?.basePrice));
  if (!prices.length) return null;
  // Amounts in different currencies cannot be compared without exchange rates. (todo)
  const currency = prices[0].currency || "INR";
  const amounts = prices.filter((price) => (price.currency || "INR") === currency)
    .map((price) => price.basePrice);
  return { min: Math.min(...amounts), max: Math.max(...amounts), currency };
};

export const totalStock = (product) => {
  const variants = product?.verient || product?.variant || [];
  return variants.reduce(
    (sum, variant) => sum + (Number.isFinite(variant.stock) ? Math.max(0, variant.stock) : 0),
    0,
  );
};

export const stockState = (product) => {
  const variants = product?.verient || product?.variant || [];
  if (!variants.length) return "nostock";
  const total = totalStock(product);
  return total === 0 ? "out" : total <= 5 ? "low" : "in";
};

export const sizeList = (product) => {
  const variants = product?.verient || product?.variant || [];
  return [...new Set(
    variants.map((variant) => variant.attributes?.size).filter(Boolean),
  )];
};

export const productError = (error, fallback) => {
  if (error?.response?.status === 401 || error?.response?.status === 403) {
    return "A signed-in seller account is required to access products. Please sign in as a seller and try again.";
  }
  const message = error?.response?.data?.message || error?.response?.data?.error;
  return typeof message === "string" ? message : fallback;
};
