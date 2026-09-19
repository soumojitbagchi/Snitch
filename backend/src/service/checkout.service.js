import mongoose from "mongoose";
import Cart from "../model/cart.model.js";
import Product from "../model/product.model.js";

const checkoutError = (status, message) => Object.assign(new Error(message), { status });

const validateItems = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
        throw checkoutError(400, "At least one checkout item is required");
    }
}

export const getCheckoutItems = async ({ source, items, userId }) => {
    if (source === "cart") {
        const cart = await Cart.findOne({ user: userId });
        if (!cart || cart.items.length === 0) throw checkoutError(400, "Cart is empty");
        return cart.items.map((item) => ({
            productId: item.product,
            variantId: item.variant,
            quantity: item.quantity,
        }));
    }

    if (source !== "direct") throw checkoutError(400, "Invalid checkout source");
    validateItems(items);
    return items;
};

export const calculateCheckoutTotal = async (items) => {
    validateItems(items);

    let total = 0;
    let currency = null;
    const verifiedItems = [];

    for (const item of items) {
        if (!mongoose.isValidObjectId(item.productId)) throw checkoutError(400, "Invalid product id");
        if (!mongoose.isValidObjectId(item.variantId)) throw checkoutError(400, "Invalid variant id");

        const quantity = Number(item.quantity);
        if (!Number.isSafeInteger(quantity) || quantity < 1) {
            throw checkoutError(400, "Quantity must be a positive whole number");
        }

        const product = await Product.findById(item.productId).select("title images variant");
        if (!product) throw checkoutError(404, "Product not found");

        const variant = product.variant.id(item.variantId);
        if (!variant) throw checkoutError(400, "Variant does not belong to this product");
        if (variant.stock < quantity) throw checkoutError(400, "Requested quantity exceeds available stock");

        const itemCurrency = variant.price.currency;
        if (currency && currency !== itemCurrency) {
            throw checkoutError(400, "All checkout items must use the same currency");
        }
        currency = itemCurrency;

        const unitPrice = variant.price.basePrice;
        const lineTotal = unitPrice * quantity;
        total += lineTotal;
        verifiedItems.push({
            productId: product._id,
            variantId: variant._id,
            quantity,
            unitPrice,
            lineTotal,
            currency: itemCurrency,
        });
    }

    return { items: verifiedItems, total, currency: currency || "INR" };
};
