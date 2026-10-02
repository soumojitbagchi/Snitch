import { createApiClient } from "../../auth/services/api.client";

const api = createApiClient("/api");

export const fetchMyOrders = async (page = 1, limit = 20, signal) => {
  const response = await api.get("/my-orders", { params: { page, limit }, signal });
  return response.data;
};

export const fetchMyOrder = async (id, signal) => {
  const response = await api.get(`/my-orders/${encodeURIComponent(id)}`, { signal });
  return response.data;
};

const formatDay = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const displayStatusFor = (payment) => {
  const raw = payment.fulfillment?.status || payment.paymentStatus || "pending";
  return STATUS_LABELS[String(raw).toLowerCase()] || "Pending";
};

const STATUS_LABELS = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  "out for delivery": "Out for Delivery",
  delivered: "Delivered",
  completed: "Completed",
  failed: "Failed",
  cancelled: "Cancelled",
};

export const normalizeServerOrder = (payment) => {
  const items = Array.isArray(payment.items) ? payment.items : [];
  const currency = payment.currency || items[0]?.currency || "INR";
  const quantityOf = (item) => Number(item.quantity) || 1;
  return {
    id: String(payment._id),
    source: "server",
    orderId: payment.orderId,
    date: formatDay(payment.createdAt),
    status: displayStatusFor(payment),
    paymentStatus: payment.paymentStatus,
    totalAmount: Number(payment.amount) || 0,
    itemCount: items.reduce((sum, item) => sum + quantityOf(item), 0),
    currency,
    discount: Number(payment.discount) || 0,
    couponCode: payment.coupon || payment.couponCode || "",
    deliveryEstimate: payment.fulfillment?.slaDueAt
      ? `Arriving by ${formatDay(payment.fulfillment.slaDueAt)}`
      : "Delivery expected soon",
    items: items.map((item) => ({
      title: item.title || "Product",
      image: item.image || "",
      size: item.size || "",
      color: item.color || "",
      quantity: quantityOf(item),
      price: Number(item.unitPrice) || 0,
      currency: item.currency || currency,
    })),
  };
};
