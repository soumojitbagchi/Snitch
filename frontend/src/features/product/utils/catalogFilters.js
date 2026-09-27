export function getVariantStock(variant) {
  if (!variant) return 0;
  if (typeof variant.stock === "number") return Math.max(0, variant.stock);
  if (typeof variant.stock?.basePrice === "number")
    return Math.max(0, variant.stock.basePrice);
  if (typeof variant.stockAmount === "number")
    return Math.max(0, variant.stockAmount);
  return 0;
}

export function getVariantPrice(variant) {
  if (typeof variant?.price?.basePrice === "number")
    return variant.price.basePrice;
  if (typeof variant?.price === "number") return variant.price;
  return null;
}

export function getVariantSize(variant) {
  if (!variant?.attributes) return "";
  if (variant.attributes instanceof Map)
    return variant.attributes.get("size") || "";
  return variant.attributes.size || "";
}

export function getProductMinPrice(product) {
  const variants = product?.variant || product?.variants || [];
  const prices = variants.map(getVariantPrice).filter((p) => Number.isFinite(p));
  if (prices.length === 0) {
    if (Number.isFinite(product?.price)) return product.price;
    return null;
  }
  return Math.min(...prices);
}

export function getProductTotalStock(product) {
  const variants = product?.variant || product?.variants || [];
  if (variants.length === 0) return 0;
  return variants.reduce((sum, v) => sum + getVariantStock(v), 0);
}

export function getProductAvailability(product) {
  const total = getProductTotalStock(product);
  if (total === 0) return "out";
  if (total <= 5) return "low";
  return "in";
}

export const PRICE_BUCKETS = [
  { id: "under-1000", label: "Under ₹1,000", test: (p) => p < 1000 },
  { id: "1000-1499", label: "₹1,000 – ₹1,499", test: (p) => p >= 1000 && p <= 1499 },
  { id: "1500-1999", label: "₹1,500 – ₹1,999", test: (p) => p >= 1500 && p <= 1999 },
  { id: "2000-plus", label: "₹2,000 & above", test: (p) => p >= 2000 },
];

export function getCatalogFacets(products) {
  const categories = new Map();
  const sizes = new Map();
  const availability = { in: 0, low: 0, out: 0 };

  for (const product of products) {
    const category = String(product?.category || "").trim();
    if (category) categories.set(category, (categories.get(category) || 0) + 1);

    const variants = product?.variant || product?.variants || [];
    const seenSizes = new Set();
    for (const v of variants) {
      const size = String(getVariantSize(v) || "").trim();
      if (size && !seenSizes.has(size)) {
        seenSizes.add(size);
        sizes.set(size, (sizes.get(size) || 0) + 1);
      }
    }

    const avail = getProductAvailability(product);
    availability[avail] += 1;
  }

  return {
    categories: [...categories.entries()]
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => a.value.localeCompare(b.value)),
    sizes: [...sizes.entries()]
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => a.value.localeCompare(b.value, undefined, { numeric: true })),
    availability,
  };
}

export const EMPTY_FILTERS = {
  categories: [],
  sizes: [],
  prices: [],
  availability: [],
};

export function countActiveFilters(filters) {
  return (
    (filters.categories?.length || 0) +
    (filters.sizes?.length || 0) +
    (filters.prices?.length || 0) +
    (filters.availability?.length || 0)
  );
}

export function filterProducts(products, filters) {
  if (!filters || countActiveFilters(filters) === 0) return products;

  return products.filter((product) => {
    if (filters.categories?.length > 0) {
      const category = String(product?.category || "").trim();
      if (!filters.categories.includes(category)) return false;
    }

    if (filters.sizes?.length > 0) {
      const variants = product?.variant || product?.variants || [];
      const productSizes = variants
        .map((v) => String(getVariantSize(v) || "").trim())
        .filter(Boolean);
      if (!filters.sizes.some((s) => productSizes.includes(s))) return false;
    }

    if (filters.prices?.length > 0) {
      const minPrice = getProductMinPrice(product);
      if (minPrice == null) return false;
      const buckets = PRICE_BUCKETS.filter((b) => filters.prices.includes(b.id));
      if (!buckets.some((b) => b.test(minPrice))) return false;
    }

    if (filters.availability?.length > 0) {
      const avail = getProductAvailability(product);
      if (filters.availability.includes("in-stock")) {
        if (avail !== "in" && avail !== "low") return false;
      } else if (!filters.availability.includes(avail)) {
        return false;
      }
    }

    return true;
  });
}
