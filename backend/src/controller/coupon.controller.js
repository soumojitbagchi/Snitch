import { validateCoupon } from "../service/checkout.service.js";
import Cart from "../model/cart.model.js";
import Product from "../model/product.model.js";

// POST /api/coupon/validate  { code, subtotal }
// only check — does NOT consume stock. Stock is decremented in payment controller 
// a payment using the coupon verifies successfully.
export const validateCouponController = async (req, res) => {
    try {
        const { code, subtotal } = req.body;
        const cart = await Cart.findOne({ user: req.user._id }).select("items").lean();
        const productIds = (cart?.items ?? []).map((item) => item.product).filter(Boolean);
        const products = productIds.length > 0
            ? await Product.find({ _id: { $in: productIds } }).select("seller").lean()
            : [];
        const { coupon, discount } = await validateCoupon(
            code,
            Number(subtotal),
            products.map((product) => String(product.seller)),
        );
        return res.status(200).json({
            success: true,
            code: coupon.coupon,
            discount,
            minAmount: coupon.minAmount,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
        });
    } catch (error) {
        const status = error.status || 500;
        return res.status(status >= 400 && status < 500 ? status : 500).json({
            success: false,
            error: error.message || "Coupon validation failed",
        });
    }
};
