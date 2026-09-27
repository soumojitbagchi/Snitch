const img = (id) => `https://images.unsplash.com/${id}?q=80&w=600&h=800&auto=format&fit=crop`;

const entry = (_id, title, photoId, description, basePrice, category, tags, attributes) => ({
  _id,
  title,
  images: [{ url: img(photoId) }],
  description,
  variant: [
    {
      price: { basePrice, currency: "INR" },
      stock: 10,
      attributes: attributes || {},
    },
  ],
  category,
  tags,
  isFallback: true,
});

const FALLBACK_PRODUCTS = [
  entry(
    "fallback-1",
    "Essential White Tee",
    "photo-1521572163474-6864f9cf17ab",
    "A clean everyday white tee that pairs with everything in your rotation.",
    799,
    "t-shirts",
    ["tee", "white", "casual", "cotton"],
    { size: "M", color: "White" },
  ),
  entry(
    "fallback-2",
    "Tailored Navy Blazer",
    "photo-1594938298603-c8148c4dae35",
    "A sharp single-breasted blazer that dresses up any shirt and trouser combo.",
    4999,
    "blazers",
    ["blazer", "formal", "layer"],
    { size: "M", color: "Navy" },
  ),
  entry(
    "fallback-3",
    "Olive Field Jacket",
    "photo-1591047139829-d91aecb6caea",
    "A rugged utility jacket built for layering through the season.",
    3499,
    "jackets",
    ["jacket", "olive", "layer", "casual"],
    { size: "M", color: "Olive" },
  ),
  entry(
    "fallback-4",
    "Checked Casual Shirt",
    "photo-1602810318383-e386cc2a3ccf",
    "A breathable checked shirt for easy daytime fits.",
    1499,
    "shirts",
    ["shirt", "checked", "casual", "cotton"],
    { size: "M", color: "Blue" },
  ),
  entry(
    "fallback-5",
    "Classic Black Suit",
    "photo-1490578474895-699cd4e2cf59",
    "A timeless two-piece suit cut for weddings, work and everything formal.",
    8999,
    "suits",
    ["suit", "formal", "black"],
    { size: "M", color: "Black" },
  ),
];

export default FALLBACK_PRODUCTS;
