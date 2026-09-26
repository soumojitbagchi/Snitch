import mongoose from "mongoose";
import Cart from "../model/cart.model.js";
import Product from "../model/product.model.js";
import Coupon from "../model/coupon.model.js";

const checkoutError = (status, message) => Object.assign(new Error(message), { status });

// Loads a coupon and checks usability against a cart subtotal.
// Returns { coupon, discount } where discount is in the same currency units
// as the subtotal. Never mutates stock here — stock is consumed only after
// a payment verifies successfully.
export const validateCoupon = async (couponCode, subtotal) => {
    const code = String(couponCode || "").trim().toUpperCase();
    if (!code) throw checkoutError(400, "Coupon code is required");

    const amount = Number(subtotal);
    if (!Number.isFinite(amount) || amount < 0) {
        throw checkoutError(400, "A valid subtotal is required to validate a coupon");
    }

    const coupon = await Coupon.findOne({ coupon: code });
    if (!coupon) throw checkoutError(404, "Invalid coupon code");
    if (coupon.expiresAt.getTime() < Date.now()) throw checkoutError(400, "Coupon has expired");
    if (coupon.stock < 1) throw checkoutError(400, "Coupon is fully redeemed");
    if (amount < coupon.minAmount) {
        throw checkoutError(400, `Coupon needs a minimum order of ${coupon.minAmount}`);
    }

    let discount = 0;
    if (coupon.discountType === "PERCENT") {
        discount = Math.round((amount * coupon.discountValue) / 100);
        if (coupon.maxDiscount != null) discount = Math.min(discount, coupon.maxDiscount);
    } else {
        discount = coupon.discountValue;
    }
    discount = Math.max(0, Math.min(discount, amount));

    return { coupon, discount };
}

const validateItems = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
        throw checkoutError(400, "At least one checkout item is required");
    }
}

export const getCheckoutItems = async ({ source, items, userId }) => {
    if (source === "cart") {
        const cart = await Cart.findOne({ user: userId });
        if (!cart || cart.items.length === 0) throw checkoutError(400, "Cart is empty");
        return {
            currency: cart.displayCurrency,
            items: cart.items.map((item) => ({
                productId: item.product,
                variantId: item.variant,
                quantity: item.quantity,
            })),
        };
    }

    if (source !== "direct") throw checkoutError(400, "Invalid checkout source");
    validateItems(items);
    return items;
};

export const calculateCheckoutTotal = async ({ items, currency, couponCode } = {}) => {
    validateItems(items);

    let total = 0;
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

        const unitPrice = variant.price.basePrice;
        const lineTotal = unitPrice * quantity;
        total += lineTotal;
        // Snapshot display fields backend-side so the confirmation email /
        // order history stays correct even if the product is edited/deleted later.
        // Never trust title/image/price sent from the frontend — always read from DB.
        const attrs = variant.attributes;
        verifiedItems.push({
            productId: product._id,
            variantId: variant._id,
            quantity,
            unitPrice,
            lineTotal,
            currency,
            title: product.title,
            image: variant.images?.[0]?.url || product.images?.[0]?.url || "",
            size: attrs?.get?.("size") ?? attrs?.size ?? "",
            color: attrs?.get?.("color") ?? attrs?.color ?? "",
        });
    }

    let discount = 0;
    let coupon = null;
    if (couponCode) {
        const result = await validateCoupon(couponCode, total);
        coupon = result.coupon;
        discount = result.discount;
    }

    return {
        items: verifiedItems,
        total,
        discount,
        payable: Math.max(0, total - discount),
        coupon: coupon ? coupon.coupon : null,
        currency,
    };
};

export const reCalculateStock = async (items) => {
    const productDetails = await Product.find({ _id: { $in: items.map((item) => item.productId) } }).select("variant");
    for (const product of productDetails) {
        const variant = product.variant.id(items.find((item) => item.productId === product._id).variantId);
        if (variant.stock - items.find((item) => item.productId === product._id).quantity < 0) {
            throw checkoutError(400, "Requested quantity exceeds available stock");
        }
        variant.stock -= items.find((item) => item.productId === product._id).quantity;
        await variant.save();
    }
    return true;
};