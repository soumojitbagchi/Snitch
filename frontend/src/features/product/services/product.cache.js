export const LIST_TTL_MS = 90 * 1000;
export const DETAILS_TTL_MS = 120 * 1000;

const ALL_KEY = "snitch:products:all:v1";
const DETAILS_PREFIX = "snitch:product:";
const ORDER_KEY = "snitch:product:order:v1";
const DETAILS_CAP = 50;

export const detailsKey = (id) => `${DETAILS_PREFIX}${id}:v1`;
export const isFresh = (ts, ttl) => typeof ts === "number" && Date.now() - ts < ttl;

const read = (key) => {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

const readOrder = () => {
  const entry = read(ORDER_KEY);
  return Array.isArray(entry?.data) ? entry.data.filter((k) => typeof k === "string") : [];
};

const touchOrder = (key) => {
  const prev = readOrder();
  const order = [key, ...prev.filter((k) => k !== key)].slice(0, DETAILS_CAP);
  prev
    .filter((k) => k !== key && !order.includes(k))
    .forEach((dropped) => safeRemove(dropped));
  safeSet(ORDER_KEY, JSON.stringify({ data: order, ts: Date.now() }));
};

const safeSet = (key, value) => {
  try {
    sessionStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};

const safeRemove = (key) => {
  try {
    sessionStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
};

const evictOldest = () => {
  const order = readOrder();
  const victim = order[order.length - 1];
  if (!victim) return;
  safeRemove(victim);
  safeSet(ORDER_KEY, JSON.stringify({ data: order.slice(0, -1), ts: Date.now() }));
};

const write = (key, data, { track = false } = {}) => {
  if (safeSet(key, JSON.stringify({ data, ts: Date.now() }))) {
    if (track) touchOrder(key);
    return;
  }
  evictOldest();
  if (safeSet(key, JSON.stringify({ data, ts: Date.now() })) && track) touchOrder(key);
};

export const readProductsAll = () => read(ALL_KEY);
export const writeProductsAll = (data) => write(ALL_KEY, data);
export const readProductDetails = (id) => {
  const entry = read(detailsKey(id));
  if (entry) touchOrder(detailsKey(id));
  return entry;
};
export const writeProductDetails = (id, data) => write(detailsKey(id), data, { track: true });

export const clearProductCache = (id) => {
  if (id) {
    safeRemove(detailsKey(id));
    return;
  }
  safeRemove(ALL_KEY);
  safeRemove(ORDER_KEY);
  const doomed = [];
  try {
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(DETAILS_PREFIX)) doomed.push(key);
    }
  } catch {
    return;
  }
  doomed.forEach((key) => safeRemove(key));
};
