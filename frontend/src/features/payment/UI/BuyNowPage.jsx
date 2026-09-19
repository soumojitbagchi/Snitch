import { Navigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import PaymentPage from "./PaymentPage";
import { clearCart } from "../../redux/cart.slice";
import { clearRemoteCart } from "../../cart/services/cart.api";



function toCheckoutItem({ product, variant, quantity = 1 }) {
  const selectedVariant = variant || product?.variant?.[0];

  return {
    id: `${product._id || product.id}-buy-now`,
    productId: product._id || product.id,
    variantId: selectedVariant?._id,
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
  const dispatch = useDispatch();

  // A direct visit or refresh has no selected product to purchase.
  if (!Array.isArray(state?.items) || state.items.length === 0) {
    return <Navigate to="/" replace />;
  }

  const items = state.items.map((item) =>
    item.productId ? item : toCheckoutItem(item)
  );

  const handleSuccess = async (result) => {
    if (state.source === "cart") {
      await clearRemoteCart();
      dispatch(clearCart());
    }
    return result;
  };

  return (
    <PaymentPage
      order={{
        id: `SN-${Date.now()}`,
        source: state.source || "direct",
        items,
      }}
      onSuccess={handleSuccess}
    />
  );
}
