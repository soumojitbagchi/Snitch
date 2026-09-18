import { Navigate, useLocation } from "react-router-dom";
import PaymentPage from "./PaymentPage";

function toCheckoutItem({ product, variant, quantity = 1 }) {
  const selectedVariant = variant || product?.variant?.[0];

  return {
    id: `${product._id || product.id}-buy-now`,
    productId: product._id || product.id,
    title: product.title || "Snitch Product",
    size: selectedVariant?.attributes?.size || "Standard",
    color: selectedVariant?.attributes?.color || "Standard",
    price: selectedVariant?.price?.basePrice ?? product.price ?? 0,
    currency: selectedVariant?.price?.currency || "INR",
    quantity: Math.max(1, quantity),
    image: selectedVariant?.images?.[0]?.url || product.images?.[0]?.url || "",
  };
}

export default function BuyNowPage() {
  const { state } = useLocation();

  // A direct visit or refresh has no selected product to purchase.
  if (!state?.product) {
    return <Navigate to="/" replace />;
  }

  const item = toCheckoutItem(state);

  return (
    <PaymentPage
      order={{
        id: `SN-${Date.now()}`,
        items: [item],
      }}
    />
  );
}
