import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();
dotenv.config({ path: new URL("../.env", import.meta.url).pathname });

const RULES = [
  { category: "t-shirts", tags: ["tee", "t-shirt", "casual", "cotton"], match: /t-shirt|\btee\b|polo/ },
  { category: "shirts", tags: ["shirt", "casual"], match: /shirt|kurta/ },
  { category: "jackets", tags: ["jacket", "layer"], match: /jacket|hoodie/ },
  { category: "jeans", tags: ["jeans", "denim"], match: /jean|denim/ },
  { category: "cargos", tags: ["cargo", "utility"], match: /cargo/ },
  { category: "shorts", tags: ["shorts", "casual"], match: /short|chino/ },
  { category: "suits", tags: ["suit", "formal"], match: /suit|blazer/ },
  { category: "shoes", tags: ["shoes", "casual"], match: /sneaker|shoe/ },
  { category: "watches", tags: ["watch", "accessory"], match: /watch/ },
  { category: "bags", tags: ["bag", "travel"], match: /backpack|bag/ },
];

const main = async () => {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI missing in backend/.env");
  await mongoose.connect(process.env.MONGO_URI);
  const { default: Product } = await import("../src/model/product.model.js");

  const docs = await Product.find({ $or: [{ category: "" }, { category: null }, { category: { $exists: false } }] });
  let updated = 0;
  for (const doc of docs) {
    const text = `${doc.title || ""} ${doc.description || ""}`.toLowerCase();
    const rule = RULES.find((r) => r.match.test(text));
    if (!rule) {
      console.log(`skip (no rule): ${doc.title}`);
      continue;
    }
    const colors = (doc.variant || []).flatMap((v) => {
      const attrs = v?.attributes;
      const values = attrs instanceof Map ? [...attrs.values()] : Object.values(attrs || {});
      return values.map((c) => String(c).toLowerCase());
    });
    const tags = [...new Set([...(doc.tags || []), ...rule.tags, ...colors])];
    doc.category = rule.category;
    doc.tags = tags;
    await doc.save();
    updated++;
    console.log(`ok: ${doc.title} -> ${rule.category} [${tags.join(", ")}]`);
  }
  console.log(`\nDone. scanned=${docs.length} updated=${updated}`);
  await mongoose.disconnect();
};

main().catch(async (e) => { console.error("BACKFILL_FAILED:", e.message); try { await mongoose.disconnect(); } catch {} process.exit(1); });
