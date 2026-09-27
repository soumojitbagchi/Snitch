const keywords = (text) =>
  String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3);

const stockOf = (product) =>
  Array.isArray(product?.variant)
    ? product.variant.reduce((n, v) => n + (Number(v?.stock) || 0), 0)
    : 0;

const textOf = (product) =>
  `${product?.title || ""} ${product?.description || ""} ${product?.category || ""}`;

export const score = (current, candidate) => {
  if (!candidate || !candidate._id || candidate._id === current?._id) return -Infinity;
  let points = 0;
  if (current?.category && candidate.category && candidate.category === current.category) {
    points += 3;
  }
  const currentTags = new Set((current?.tags || []).map((t) => String(t).toLowerCase()));
  for (const tag of candidate?.tags || []) {
    if (currentTags.has(String(tag).toLowerCase())) points += 2;
  }
  const currentWords = new Set(keywords(textOf(current)));
  if (keywords(textOf(candidate)).some((w) => currentWords.has(w))) points += 1;
  if (stockOf(candidate) > 0) points += 0.5;
  return points;
};

export const rankSimilar = (current, list, limit = 4) =>
  (Array.isArray(list) ? list : [])
    .filter((p) => p?._id && p._id !== current?._id)
    .map((p) => ({ product: p, points: score(current, p) }))
    .filter((row) => row.points > -Infinity)
    .sort((a, b) => b.points - a.points)
    .slice(0, limit)
    .map((row) => ({ ...row.product, isFallback: true }));
