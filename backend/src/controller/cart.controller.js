import Cart from "../model/cart.model.js";
import mongoose from "mongoose";
import Product from "../model/product.model.js";

const httpError = (status, message) => Object.assign(new Error(message), { status });

const getProductVariant = async (productId, variantId) => {
    const product = await Product.findById(productId);
    if (!product) throw httpError(404, "Product not found");

    const variant = variantId ? product.variant.id(variantId) : product.variant[0];
    if (!variant) throw httpError(404, "Variant not found");
    return { product, variant };
};

const buildCartResponse = async (cartId) => {
    const cart = await Cart.findById(cartId).populate("items.product");
    if (!cart) throw httpError(404, "Cart not found");

    let totalAmount = 0;
    let currency = "INR";
    const items = cart.items.map((item) => {
        const product = item.product;
        const variant = item.variant ? product?.variant.id(item.variant) : product?.variant[0];

        if (!product) throw httpError(404, "Product not found");
        if (!variant) throw httpError(404, "Variant not found");

        totalAmount += variant.price.basePrice * item.quantity;
        currency = variant.price.currency;

        return {
            id: `${product._id}-${variant._id}`,
            productId: product._id,
            variantId: variant._id,
            title: product.title,
            price: variant.price.basePrice,
            currency: variant.price.currency,
            size: variant.attributes?.get?.("size") ?? variant.attributes?.size,
            color: variant.attributes?.get?.("color") ?? variant.attributes?.color,
            image: variant.images?.[0]?.url || product.images?.[0]?.url || "",
            quantity: item.quantity,
        };
    });

    cart.totalAmount = totalAmount;
    await cart.save();

    return { ...cart.toObject(), items, totalAmount, currency };
};

const sendCartError = (res, error) => res.status(error.status || 500).json({
    success: false,
    message: error.message || "Unable to process cart request",
});

export const cartProductViewerController = async (req, res) => {
    try {
        const userCart = await Cart.findOne({ user: req.user._id });
        if (!userCart) {
            return res.status(200).json({
                success: true,
                cart: { items: [], totalAmount: 0, currency: "INR" },
            });
        }

        return res.status(200).json({ success: true, cart: await buildCartResponse(userCart._id) });
    } catch (error) {
        return sendCartError(res, error);
    }
};

export const addToCartController = async (req, res) => {
    try {
        const { productId, variantId, quantity = 1 } = req.body;
        if (!mongoose.isValidObjectId(productId)) throw httpError(400, "Invalid product id");
        if (variantId && !mongoose.isValidObjectId(variantId)) throw httpError(400, "Invalid variant id");

        const amount = Number(quantity);
        if (!Number.isSafeInteger(amount) || amount < 1) {
            throw httpError(400, "Quantity must be a positive whole number");
        }

        const { variant } = await getProductVariant(productId, variantId);
        let userCart = await Cart.findOne({ user: req.user._id });
        if (!userCart) userCart = new Cart({ user: req.user._id, items: [] });

        const existingItem = userCart.items.find((item) =>
            item.product.toString() === productId &&
            (item.variant?.toString() ?? null) === (variantId ?? null)
        );
        const nextQuantity = (existingItem?.quantity ?? 0) + amount;
        if (nextQuantity > variant.stock) throw httpError(400, "Requested quantity exceeds available stock");

        if (existingItem) {
            existingItem.quantity = nextQuantity;
        } else {
            userCart.items.push({ product: productId, variant: variantId, quantity: amount });
        }

        await userCart.save();
        return res.status(200).json({
            success: true,
            message: "Product added to cart successfully",
            cart: await buildCartResponse(userCart._id),
        });
    } catch (error) {
        return sendCartError(res, error);
    }
};

export const deleteFromCartController = async (req, res) => {
    try {
        const { productId, variantId } = req.body;
        if (!mongoose.isValidObjectId(productId)) throw httpError(400, "Invalid product id");
        if (variantId && !mongoose.isValidObjectId(variantId)) throw httpError(400, "Invalid variant id");

        const userCart = await Cart.findOne({ user: req.user._id });
        if (!userCart) throw httpError(404, "Cart not found");

        const item = userCart.items.find((cartItem) =>
            cartItem.product.toString() === productId &&
            (cartItem.variant?.toString() ?? null) === (variantId ?? null)
        );
        if (!item) throw httpError(404, "Cart item not found");

        item.quantity -= 1;
        if (item.quantity <= 0) userCart.items = userCart.items.filter((cartItem) => cartItem !== item);

        await userCart.save();
        return res.status(200).json({
            success: true,
            message: "Product removed from cart successfully",
            cart: await buildCartResponse(userCart._id),
        });
    } catch (error) {
        return sendCartError(res, error);
    }
};

export const calculateCartTotalController = async (req, res) => {
    try {
        const userCart = await Cart.findOne({ user: req.user._id });
        if (!userCart) {
            return res.status(200).json({
                success: true,
                total: 0,
                cart: { items: [], totalAmount: 0, currency: "INR" },
            });
        }

        const cart = await buildCartResponse(userCart._id);
        return res.status(200).json({ success: true, total: cart.totalAmount, cart });
    } catch (error) {
        return sendCartError(res, error);
    }
};
