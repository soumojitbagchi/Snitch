import { validateCoupon } from "../service/checkout.service.js";

// POST /api/coupon/validate  { code, subtotal }
// only check — does NOT consume stock. Stock is decremented in payment controller 
// a payment using the coupon verifies successfully.
export const validateCouponController = async (req, res) => {
    try {
        const { code, subtotal } = req.body;
        const { coupon, discount } = await validateCoupon(code, Number(subtotal));
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
