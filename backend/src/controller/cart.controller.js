import Cart from "../model/cart.model.js";
import mongoose from "mongoose";

export const cartProductViewerController = async (req, res) => {
    const userId = req.user.id;

    const userCart = await Cart.findById({ user: userId });

    console.log("cart", userCart)



    if (!userCart) {
        return res.status(404).json({
            success: false,
            message: "Cart not found"
        })
    }
    req.status(200).json({
        success: true,
        cart: userCart,
    })

}

export const addToCartController = async (req, res) => {
    const userId = req.user.id;
    const { productId, variantId } = req.body;

if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
        message: "Invalid user id"
    });
}

    const userCart = await Cart.findById({ user: userId });

    if (!userCart) {
        const cart = new Cart({
            user: userId,
            items: [{
                product: productId,
                variant: variantId,
                amount: 1
            }]
        })
        await cart.save();
        return res.status(200).json({
            success: true,
            message: "Product added to cart successfully"
        })
    }

    const productExists = userCart.items.find(item => item.product.toString() === productId);
    if (productExists) {
        if (variantId) {
            const variantExists = userCart.items.find(variant => variant.variant?.toString() === variantId);
            if (variantExists) {
                variantExists.amount += 1
            } else {
                productExists.push({
                    variant: variantId,
                    amount: 1
                })
            }
        }

    } else {
        userCart.items.push({
            product: productId,
            variant: variantId,
            amount: 1
        })
    }

    await userCart.save();

    return res.status(200).json({
        success: true,
        message: "Product added to cart successfully",
        cart: userCart
    })
}

export const deleteFromCartController = async (req, res) => {
    const userId = req.user.id;
    const { productId, variantId } = req.body;
    const userCart = await Cart.findById({ user: userId })

    if (!userCart) {
        return res.status(404).json({
            success: false,
            message: "Cart not found"
        })
    }

    const productExists = userCart.items.find(item => item.product.toString() === productId);
    if (productExists) {
        if (variantId) {
            const variantExists = userCart.items.find(variant => variant.variant?.toString() === variantId);
            if (variantExists) {
                if (productExists.stock === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "Variant not found",
                        cart: userCart
                    })
                }
                productExists.stock -= 1
            }
        }
        if (!variantId && productExists.stock === 0) {
            userCart.items = userCart.items.filter(item => item.product.toString() !== productId);
        }
    }

    await userCart.save();
    return res.status(200).json({
        success: true,
        message: "Product removed from cart successfully",
        cart: userCart
    })
}
