import mongoose from "mongoose";
import ReturnRequest from "../model/return.model.js";
import Product from "../model/product.model.js";
import Payment from "../model/payment.model.js";

export const createReturnRequest = async (req, res) => {
    try {
        const { paymentId, productId, variantId, quantity, reason } = req.body;
        if (![paymentId, productId, variantId].every((id) => mongoose.isValidObjectId(id))) {
            return res.status(400).json({ message: "Invalid payment, product or variant id", success: false });
        }
        const qty = Number(quantity) || 1;
        if (!Number.isInteger(qty) || qty < 1) {
            return res.status(400).json({ message: "Quantity must be a positive integer", success: false });
        }
        if (typeof reason !== "string" || !reason.trim() || reason.length > 1000) {
            return res.status(400).json({ message: "Reason must be 1-1000 characters", success: false });
        }

        const payment = await Payment.findOne({
            _id: paymentId,
            user: req.user._id,
            paymentStatus: "completed",
        }).lean();
        if (!payment) return res.status(403).json({ message: "Only completed purchases can be returned", success: false });

        const line = (payment.items || []).find(
            (item) => String(item.productId) === String(productId) && String(item.variantId) === String(variantId),
        );
        if (!line) return res.status(404).json({ message: "Item not found in this order", success: false });
        if (qty > line.quantity) {
            return res.status(400).json({ message: "Quantity exceeds purchased quantity", success: false });
        }

        const product = await Product.findById(productId).select("seller").lean();
        if (!product) return res.status(404).json({ message: "Product not found", success: false });

        const doc = await ReturnRequest.create({
            payment: paymentId,
            productId,
            variantId,
            quantity: qty,
            reason: reason.trim(),
            requestedBy: req.user._id,
            seller: product.seller,
        });
        res.status(201).json({ message: "Return requested", data: doc, success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

export const listMyReturns = async (req, res) => {
    try {
        const data = await ReturnRequest.find({ requestedBy: req.user._id })
            .sort({ createdAt: -1 })
            .populate("productId", "title images")
            .populate("payment", "orderId amount currency")
            .lean();
        res.status(200).json({ data, success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};
