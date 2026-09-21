import { useSelector, useDispatch } from "react-redux";
import {
  selectCartItems,
  selectCartCount,
  selectCartTotal,
  selectCartCurrency,
  clearCart,
  setCart,
} from "../../redux/cart.slice";
import { useCallback } from "react";
import { getCart, addProductToCart, removeProductFromCart, updateCartQuantity, totalValueFromCart , changeCurrency} from "../services/cart.api";

export function useCart() {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const count = useSelector(selectCartCount);
  const total = useSelector(selectCartTotal);
  const currency = useSelector(selectCartCurrency);

  const fetchCart = useCallback(async () => {
    const response = await getCart();
    if (response.success && response.cart) dispatch(setCart(response.cart));
    return response;
  }, [dispatch]);

  const handelAddProduct = useCallback(async (product, variant, quantity) => {
    try {
      const response = await addProductToCart(product?._id, variant?._id, quantity);
      if (response.success && response.cart) dispatch(setCart(response.cart));
      return response;
    } catch (error) {
      console.error("Error adding product to cart:", error);
    }
  }, [dispatch]);

  const handelRemoveProduct = useCallback(async (product, variant) => {
    try {
      const response = await removeProductFromCart(product?._id ?? product, variant?._id || variant);
      if (response.success && response.cart) dispatch(setCart(response.cart));
      return response;
    } catch (error) {
      console.error("Error removing product from cart:", error);
      return { success: false, message: "Could not remove product from cart" };
    }
  }, [dispatch]);

  const handelTotalValue = useCallback(async () => {
    try {
      const total = await totalValueFromCart();
      if (total.success && total.cart) dispatch(setCart(total.cart));
      return total;
    } catch (error) {
      console.error("Error getting total value from cart:", error);
    }
  }, [dispatch]);

  const setQuantity = useCallback(async (productId, variantId, quantity) => {
    const response = await updateCartQuantity(productId, variantId, quantity);
    if (response.success && response.cart) dispatch(setCart(response.cart));
    return response;
  }, [dispatch]);

  const handelCurrency = useCallback(async (currency) => {
    const response = await changeCurrency(currency);
    if (response.success && response.cart) dispatch(setCart(response.cart));
    return response;
  }, [dispatch]);

  return {
    items,
    count,
    total,
    currency,
    addItem: handelAddProduct,
    removeItem: handelRemoveProduct,
    cartProducts: fetchCart,
    setQuantity,
    clearAll: () => dispatch(clearCart()),
    totalValue: handelTotalValue,
    changeCurrency: handelCurrency,
  };
}

export default useCart;
