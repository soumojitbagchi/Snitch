import userData from "../model/user.model.js";
import Cart from "../model/cart.model.js";
import Wishlist from "../model/wishlist.model.js";
import Product from "../model/product.model.js";
import Payment from "../model/payment.model.js";
import { tool } from "langchain";
import * as z from "zod";

export const traceUser = tool(
    async ({ userId }) => {
        const user = await userData
            .findById(userId)
            .select("-password -__v")
            .lean();

        if (!user) {
            return JSON.stringify({ found: false, userId });
        }

        const safeUser = {
            found: true,
            userId: String(user._id),
            fullname: user.fullname,
            email: user.email,
            contact: user.contact || null,
            role: user.role,
            avatar: user.avatar || null,
            provider: user.provider || null,
            addresses: user.addresses || [],
        };

        return JSON.stringify(safeUser);
    },
    {
        name: "trace_user",
        description:
            "Fetch the authenticated user's profile by userId. Use this to get name, email, role, contact, avatar and saved addresses for personalization. Returns JSON string.",
        schema: z.object({
            userId: z.string().describe("MongoDB ObjectId of the user to look up"),
        }),
    }
);

export const traceCart = tool(
    async ({ userId }) => {
        const cart = await Cart.findOne({ user: userId })
            .populate("items.product", "title images variant")
            .lean();
        if (!cart) {
            return JSON.stringify({ found: false, userId });
        }
        return JSON.stringify(cart);
    },
    {
        name: "trace_cart",
        description:
            "Fetch the user's current cart by userId, including items and totalAmount. Use for cart-based recommendations.",
        schema: z.object({
            userId: z.string().describe("MongoDB ObjectId of the cart owner"),
        }),
    }
);

export const traceWishlist = tool(
    async ({ userId }) => {
        const wishlist = await Wishlist.findOne({ user: userId })
            .populate("product", "title images variant")
            .lean();
        if (!wishlist) {
            return JSON.stringify({ found: false, userId });
        }
        return JSON.stringify(wishlist);
    },
    {
        name: "trace_wishlist",
        description:
            "Fetch the user's wishlist by userId. Use for wishlist-based recommendations.",
        schema: z.object({
            userId: z.string().describe("MongoDB ObjectId of the wishlist owner"),
        }),
    }
);

export const traceProduct = tool(
    async ({ productId }) => {
        const product = await Product.findById(productId).lean();
        if (!product) {
            return JSON.stringify({ found: false, productId });
        }
        return JSON.stringify(product);
    },
    {
        name: "trace_product",
        description:
            "Fetch a single product by productId with its category, brand, price, stock and attributes. Use for the currently viewed product.",
        schema: z.object({
            productId: z.string().describe("MongoDB ObjectId of the product to look up"),
        }),
    }
);

export const traceOrder = tool(
    async ({ userId, orderId }) => {
        if (orderId) {
            const order = await Payment.findById(orderId).lean();
            if (!order) {
                return JSON.stringify({ found: false, orderId });
            }
            return JSON.stringify(order);
        }
        const orders = await Payment.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();
        return JSON.stringify({ found: orders.length > 0, count: orders.length, orders });
    },
    {
        name: "trace_order",
        description:
            "Fetch user purchase history from payments. Pass userId for recent orders, or orderId for one specific order. Use for history-based recommendations.",
        schema: z.object({
            userId: z.string().optional().describe("MongoDB ObjectId of the buyer"),
            orderId: z
                .string()
                .optional()
                .describe("MongoDB ObjectId of a single payment/order document"),
        }),
    }
);

export const createRecommandationTool = async (userId) => {
    return [traceCart, traceOrder, traceProduct, traceWishlist, traceUser];
};
