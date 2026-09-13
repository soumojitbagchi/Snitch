export const mockProducts = [
  {
    _id: "mock-p1",
    category: "T-Shirts",
    title: "Oversized Graphic Tee - Black",
    description: "240 GSM cotton oversized tee with chest graphic. FW26 Drop 02.",
    images: [
      { url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop" },
      { url: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?q=80&w=800&auto=format&fit=crop" },
    ],
    verient: [
      {
        images: [{ url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop" }],
        price: { basePrice: 999, currency: "INR" },
        stock: { basePrice: 50, currency: "INR" },
        attributes: { size: "M", color: "Black" },
      },
      {
        images: [{ url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop" }],
        price: { basePrice: 1099, currency: "INR" },
        stock: { basePrice: 4, currency: "INR" },
        attributes: { size: "L", color: "Black" },
      },
    ],
  },
  {
    _id: "mock-p2",
    category: "Jeans",
    title: "Slim-Fit Denim Jeans - Indigo",
    description: "Stretch denim slim-fit jeans with tapered leg.",
    images: [
      { url: "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800&auto=format&fit=crop" },
    ],
    verient: [
      {
        images: [{ url: "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800&auto=format&fit=crop" }],
        price: { basePrice: 1999, currency: "INR" },
        stock: { basePrice: 20, currency: "INR" },
        attributes: { size: "32", color: "Indigo" },
      },
    ],
  },
  {
    _id: "mock-p3",
    category: "Hoodies",
    title: "Hooded Sweatshirt - Grey",
    description: "Fleece-lined hoodie with kangaroo pocket.",
    images: [
      { url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop" },
    ],
    verient: [
      {
        images: [{ url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop" }],
        price: { basePrice: 1499, currency: "INR" },
        stock: { basePrice: 0, currency: "INR" },
        attributes: { size: "M", color: "Grey" },
      },
    ],
  },
  {
    _id: "mock-p4",
    category: "Shirts",
    title: "Linen Casual Shirt - White",
    description: "Breathable linen casual shirt, relaxed fit.",
    images: [
      { url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop" },
    ],
    verient: [],
  },
  {
    _id: "mock-p5",
    category: "Cargos",
    title: "Cargo Pants - Olive",
    description: "Six-pocket cotton cargo pants with adjustable cuffs.",
    images: [
      { url: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop" },
    ],
    verient: [
      {
        images: [{ url: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop" }],
        price: { basePrice: 1799, currency: "INR" },
        stock: { basePrice: 15, currency: "INR" },
        attributes: { size: "30", color: "Olive" },
      },
      {
        images: [{ url: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop" }],
        price: { basePrice: 1799, currency: "INR" },
        stock: { basePrice: 12, currency: "INR" },
        attributes: { size: "32", color: "Olive" },
      },
    ],
  },
  {
    _id: "mock-p6",
    category: "Shirts",
    title: "Classic Oxford Shirt - Blue",
    description: "Sharp oxford weave shirt for everyday rotation.",
    images: [
      { url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop" },
    ],
    verient: [
      {
        images: [{ url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop" }],
        price: { basePrice: 1299, currency: "INR" },
        stock: { basePrice: 8, currency: "INR" },
        attributes: { size: "M", color: "Blue" },
      },
    ],
  },
];

export const formatPrice = (price) => {
  if (!price || typeof price.basePrice !== "number") return "—";
  const symbol = price.currency === "INR" ? "₹" : `${price.currency} `;
  return `${symbol}${price.basePrice.toLocaleString("en-IN")}`;
};

export const variantPriceRange = (product) => {
  const prices = (product.verient ?? [])
    .map((v) => v.price?.basePrice)
    .filter((p) => typeof p === "number");
  if (prices.length === 0) return null;
  return { min: Math.min(...prices), max: Math.max(...prices), currency: product.verient[0]?.price?.currency ?? "INR" };
};

export const totalStock = (product) =>
  (product.verient ?? []).reduce(
    (sum, v) => sum + (typeof v.stock?.basePrice === "number" ? v.stock.basePrice : 0),
    0,
  );

export const stockState = (product) => {
  if (!product.verient || product.verient.length === 0) return "nostock";
  const total = totalStock(product);
  if (total <= 0) return "out";
  if (total <= 5) return "low";
  return "in";
};

export const sizeList = (product) => {
  const sizes = (product.verient ?? [])
    .map((v) => v.attributes?.size)
    .filter(Boolean);
  return [...new Set(sizes)];
};
