// Seed 12 mixed-demo products for seller1@snitch.test
// Usage: node scripts/seed-products.mjs  (run from backend/)
// Idempotent: skips products that already exist for this seller (matched by title).
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();
dotenv.config({ path: new URL("../.env", import.meta.url).pathname });

const SELLER_EMAIL = "seller1@snitch.test";
const img = (seed, w = 600, h = 800) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

const PRODUCTS = [
  { title: "Snitch Oversized Tee - Black", slug: "snitch-oversized-tee", description: "Heavyweight cotton oversized t-shirt with a clean minimal fit. Soft breathable fabric for everyday streetwear.", currency: "INR", variants: [ { size: "M", color: "Black", price: 999, stock: 50 }, { size: "L", color: "Black", price: 999, stock: 40 }, { size: "XL", color: "White", price: 1099, stock: 30 } ] },
  { title: "Snitch Linen Casual Shirt", slug: "snitch-linen-shirt", description: "Breezy linen-blend casual shirt with full sleeves and a relaxed collar. Perfect for summer outings.", currency: "INR", variants: [ { size: "M", color: "Beige", price: 1499, stock: 35 }, { size: "L", color: "Olive", price: 1599, stock: 25 } ] },
  { title: "Snitch Slim-Fit Stretch Jeans", slug: "snitch-slim-jeans", description: "Slim-fit stretch denim jeans in washed indigo. All-day comfort with a sharp tapered look.", currency: "INR", variants: [ { size: "30", color: "Indigo", price: 1999, stock: 30 }, { size: "32", color: "Indigo", price: 1999, stock: 30 }, { size: "34", color: "Black", price: 2099, stock: 20 } ] },
  { title: "Snitch Cargo Pants - Khaki", slug: "snitch-cargo", description: "Utility cargo pants with six pockets and a relaxed tapered fit. Durable cotton ripstop fabric.", currency: "INR", variants: [ { size: "M", color: "Khaki", price: 1799, stock: 28 }, { size: "L", color: "Black", price: 1899, stock: 22 } ] },
  { title: "Snitch Essential Hoodie", slug: "snitch-hoodie", description: "Brushed-fleece pullover hoodie with kangaroo pocket and ribbed cuffs. Warm minimal streetwear staple.", currency: "INR", variants: [ { size: "M", color: "Grey", price: 1699, stock: 40 }, { size: "L", color: "Navy", price: 1799, stock: 32 } ] },
  { title: "Snitch Pique Polo T-Shirt", slug: "snitch-polo", description: "Classic pique-knit polo with ribbed collar and a tailored fit. Smart casual essential.", currency: "INR", variants: [ { size: "M", color: "White", price: 1199, stock: 45 }, { size: "L", color: "Maroon", price: 1299, stock: 30 } ] },
  { title: "Snitch Chino Shorts", slug: "snitch-shorts", description: "Mid-rise chino shorts in soft cotton twill. Clean casual fit for warm days.", currency: "INR", variants: [ { size: "30", color: "Tan", price: 899, stock: 50 }, { size: "32", color: "Navy", price: 949, stock: 40 } ] },
  { title: "Snitch Denim Trucker Jacket", slug: "snitch-denim-jacket", description: "Rugged denim trucker jacket with button front and chest pockets. Timeless layered look.", currency: "INR", variants: [ { size: "M", color: "Blue", price: 2499, stock: 20 }, { size: "L", color: "Black", price: 2599, stock: 15 } ] },
  { title: "Snitch Festive Kurta", slug: "snitch-kurta", description: "Straight-cut festive kurta in breathable cotton with subtle texture. Traditional comfort, modern cut.", currency: "INR", variants: [ { size: "M", color: "Cream", price: 1399, stock: 25 }, { size: "L", color: "Teal", price: 1499, stock: 20 } ] },
  { title: "Snitch Street Sneakers", slug: "snitch-sneakers", description: "Lightweight street sneakers with cushioned sole and breathable knit upper. Everyday comfort shoe.", currency: "USD", variants: [ { size: "9", color: "White", price: 59, stock: 30 }, { size: "10", color: "Black", price: 69, stock: 25 }, { size: "11", color: "Grey", price: 79, stock: 20 } ] },
  { title: "Snitch Minimal Watch", slug: "snitch-watch", description: "Minimal dial watch with genuine leather strap and quartz movement. Understated everyday elegance.", currency: "EUR", variants: [ { size: "Standard", color: "Brown", price: 89, stock: 15 }, { size: "Standard", color: "Black", price: 95, stock: 12 } ] },
  { title: "Snitch Travel Backpack", slug: "snitch-backpack", description: "Water-resistant travel backpack with padded laptop sleeve and 25L capacity. Built for the daily commute.", currency: "GBP", variants: [ { size: "25L", color: "Charcoal", price: 45, stock: 22 }, { size: "25L", color: "Olive", price: 49, stock: 18 } ] },
];

const toDoc = (p, sellerId) => ({
  title: p.title,
  description: p.description,
  seller: sellerId,
  images: [{ url: img(`${p.slug}-1`) }, { url: img(`${p.slug}-2`) }],
  variant: p.variants.map((v, i) => ({
    images: [{ url: img(`${p.slug}-v${i + 1}`, 500, 650) }],
    price: { basePrice: v.price, currency: p.currency },
    stock: v.stock,
    attributes: { size: v.size, color: v.color },
  })),
});

const main = async () => {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI missing in backend/.env");
  await mongoose.connect(process.env.MONGO_URI);
  const { default: userData } = await import("../src/model/user.model.js");
  const { default: Product } = await import("../src/model/product.model.js");

  const seller = await userData.findOne({ email: SELLER_EMAIL }).select("_id email role");
  if (!seller) throw new Error(`Seller ${SELLER_EMAIL} not found`);
  if (seller.role !== "seller") throw new Error(`${SELLER_EMAIL} is not a seller (role=${seller.role})`);

  let inserted = 0, skipped = 0;
  for (const p of PRODUCTS) {
    const exists = await Product.findOne({ title: p.title, seller: seller._id }).select("_id");
    if (exists) { skipped++; console.log(`skip: ${p.title}`); continue; }
    await Product.create(toDoc(p, seller._id));
    inserted++; console.log(`inserted: ${p.title} [${p.currency}]`);
  }
  const total = await Product.countDocuments({ seller: seller._id });
  console.log(`\nDone. inserted=${inserted} skipped=${skipped} seller_total=${total}`);
  await mongoose.disconnect();
};

main().catch(async (e) => { console.error("SEED_FAILED:", e.message); try { await mongoose.disconnect(); } catch {} process.exit(1); });
