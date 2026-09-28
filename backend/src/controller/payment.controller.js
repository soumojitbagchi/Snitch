import crypto from "node:crypto";
import razorpayInstance from "../service/razorpay.service.js";
import { config } from "../config/config.js";
import Payment from "../model/payment.model.js";
import Coupon from "../model/coupon.model.js";
import { sendOrderConfirmationEmail } from "../service/email.service.js";
import { calculateCheckoutTotal, getCheckoutItems, reCalculateStock } from "../service/checkout.service.js";

async function executeWithRetry(apiFn, retries = 2, delayMs = 300) {
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt += 1) {
        try {
            return await apiFn();
        } catch (error) {
            lastError = error;
            const status = error?.statusCode || error?.status;
            if (status && status < 500 && status !== 408) throw error;
            if (attempt < retries) {
                await new Promise((resolve) => setTimeout(resolve, delayMs * Math.pow(2, attempt)));
            }
        }
    }
    throw lastError;
}

export const createOrder = async (req, res) => {
    if (!config.RAZORPAY_KEY_ID || !config.RAZORPAY_KEY_SECRET) {
        return res.status(500).json({ success: false, error: "payment provider misconfigured" });
    }

    try {
        const { source = "direct", items = [], orderId, couponCode } = req.body;
        const requestedItems = await getCheckoutItems({ source, items, userId: req.user._id });
        const checkout = await calculateCheckoutTotal({ items: requestedItems.items, currency: requestedItems.currency, couponCode });
        const receipt = String(orderId || `rcpt_${Date.now()}`).slice(0, 40);
        const amountInSubunits = Math.round(checkout.payable * 100);

        if (amountInSubunits < 100) {
            return res.status(400).json({ success: false, error: "amount must be at least 1.00" });
        }

        const razorpayOrder = await executeWithRetry(() => razorpayInstance.orders.create({
            amount: amountInSubunits,
            currency: checkout.currency,
            receipt,
            notes: { order_id: receipt, source },
        }));

        if (!razorpayOrder?.id) {
            return res.status(502).json({ success: false, error: "Payment gateway response contract mismatch" });
        }

        await Payment.create({
            user: req.user._id,
            amount: checkout.payable,
            currency: requestedItems.currency,
            orderId: razorpayOrder.id,
            items: checkout.items,
            couponCode: checkout.coupon || "",
            discount: checkout.discount,
            paymentStatus: "pending",
        });

        return res.status(200).json({
            success: true,
            order_id: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key_id: config.RAZORPAY_KEY_ID,
            subtotal: checkout.total,
            discount: checkout.discount,
            coupon: checkout.coupon,
        });
    } catch (error) {
        const status = error.status || error.statusCode || 503;
        return res.status(status >= 400 && status < 500 ? status : 503).json({
            success: false,
            error: error.message || "Order creation failed",
        });
    }
};

export const verifyPayment = async (req, res) => {
    if (!config.RAZORPAY_KEY_SECRET) {
        return res.status(500).json({ success: false, error: "payment provider misconfigured" });
    }

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        return res.status(400).json({ success: false, error: "Missing payment verification fields" });
    }

    const expectedSignature = crypto
        .createHmac("sha256", config.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");
    const expectedBuffer = Buffer.from(expectedSignature);
    const receivedBuffer = Buffer.from(razorpay_signature);
    const validSignature = expectedBuffer.length === receivedBuffer.length
        && crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
    if (!validSignature) return res.status(400).json({ success: false, error: "Invalid payment signature" });

    try {
        const payment = await Payment.findOne({ orderId: razorpay_order_id, user: req.user._id });
        if (!payment) return res.status(404).json({ success: false, error: "Pending payment not found" });
        if (payment.paymentStatus === "completed") {
            return res.status(200).json({ success: true, message: "Payment already verified", orderId: razorpay_order_id });
        }

        const gatewayOrder = await razorpayInstance.orders.fetch(razorpay_order_id);
        const expectedAmount = Math.round(payment.amount * 100);
        if (gatewayOrder.amount !== expectedAmount || gatewayOrder.currency !== payment.currency) {
            return res.status(400).json({ success: false, error: "Payment amount does not match checkout total" });
        }

        payment.paymentId = razorpay_payment_id;
        payment.signature = razorpay_signature;
        payment.paymentStatus = "completed";
        await payment.save();
        await reCalculateStock(payment.items);

        // Consume one coupon redemption — atomic so concurrent checkouts
        // can't overspend a limited stock. Best-effort: payment is already
        // complete, so a failure here must not fail verification.
        if (payment.couponCode && payment.discount > 0) {
            await Coupon.findOneAndUpdate(
                { coupon: payment.couponCode, stock: { $gt: 0 } },
                { $inc: { stock: -1 } },
            ).catch((error) => console.error("Coupon stock decrement failed:", error.message));
        }

        await payment.populate([
            { path: "user", select: "fullname email" },
            { path: "items.productId", select: "title images variant" },
        ]);
        sendOrderConfirmationEmail({
            name: payment.user.fullname,
            email: payment.user.email,
            orderId: payment.orderId,
            paymentId: payment.paymentId,
            amount: payment.amount,
            currency: payment.currency,
            items: payment.items.map((item) => {
                // Prefer the purchase-time snapshot; fall back to live product
                // data for payments created before snapshots were stored.
                const liveProduct = item.productId && typeof item.productId === "object" ? item.productId : null;
                const liveVariant = liveProduct && item.variantId
                    ? liveProduct.variant?.id?.(item.variantId) ?? liveProduct.variant?.find?.((v) => String(v._id) === String(item.variantId))
                    : null;
                const liveAttrs = liveVariant?.attributes;
                return {
                    title: item.title || liveProduct?.title || "Product",
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    lineTotal: item.lineTotal,
                    currency: item.currency,
                    image: item.image || liveVariant?.images?.[0]?.url || liveProduct?.images?.[0]?.url || "",
                    size: item.size || (liveAttrs?.get?.("size") ?? liveAttrs?.size ?? ""),
                    color: item.color || (liveAttrs?.get?.("color") ?? liveAttrs?.color ?? ""),
                };
            }),
        }).catch((error) => console.error("Order confirmation email failed:", error.message));

        return res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id,
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message || "Payment verification failed" });
    }
};

export const getOrderStatus = async (req, res) => {
    try {
        const payments = await razorpayInstance.orders.fetchPayments(req.params.order_id);
        return res.status(200).json({ success: true, order_id: req.params.order_id, payments });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message || "Failed to fetch order payments" });
    }
};
