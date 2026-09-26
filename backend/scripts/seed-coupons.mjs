// Seed demo coupons (upsert by code, so re-runs also patch discount fields).
// Usage: node scripts/seed-coupons.mjs  (run from backend/)
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();
dotenv.config({ path: new URL("../.env", import.meta.url).pathname });

const DAY = 24 * 60 * 60 * 1000;
const now = Date.now();

const COUPONS = [
  { coupon: "SNITCH200", stock: 500, minAmount: 1499, discountType: "FLAT", discountValue: 200, maxDiscount: null, expiresAt: new Date(now + 60 * DAY) },
  { coupon: "FIRST50", stock: 1000, minAmount: 100, discountType: "PERCENT", discountValue: 10, maxDiscount: 500, expiresAt: new Date(now + 30 * DAY) },
  { coupon: "WELCOME100", stock: 1000, minAmount: 499, discountType: "FLAT", discountValue: 100, maxDiscount: null, expiresAt: new Date(now + 90 * DAY) },
  { coupon: "FESTIVE500", stock: 200, minAmount: 2999, discountType: "FLAT", discountValue: 500, maxDiscount: null, expiresAt: new Date(now + 45 * DAY) },
  { coupon: "STUDENT15", stock: 300, minAmount: 999, discountType: "PERCENT", discountValue: 15, maxDiscount: 750, expiresAt: new Date(now + 30 * DAY) },
  // One already-expired, for testing expiry handling
  { coupon: "OLDDEAL", stock: 50, minAmount: 100, discountType: "FLAT", discountValue: 50, maxDiscount: null, expiresAt: new Date(now - 7 * DAY) },
];

const main = async () => {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI missing in backend/.env");
  await mongoose.connect(process.env.MONGO_URI);
  const { default: Coupon } = await import("../src/model/coupon.model.js");

  let inserted = 0, updated = 0;
  for (const c of COUPONS) {
    // $unset drops legacy discountNum/discountPer fields from earlier seeds.
    const res = await Coupon.updateOne(
      { coupon: c.coupon },
      { $set: c, $unset: { discountNum: "", discountPer: "" } },
      { upsert: true },
    );
    if (res.upsertedCount > 0) { inserted++; console.log(`inserted: ${c.coupon} (${c.discountType} ${c.discountValue})`); }
    else { updated++; console.log(`updated: ${c.coupon} (${c.discountType} ${c.discountValue})`); }
  }
  const total = await Coupon.countDocuments({});
  console.log(`\nDone. inserted=${inserted} updated=${updated} total=${total}`);
  await mongoose.disconnect();
};

main().catch(async (e) => { console.error("SEED_FAILED:", e.message); try { await mongoose.disconnect(); } catch {} process.exit(1); });
