import Payment from "../model/payment.model.js";
import Order from "../model/order.model.js";

export const getMyOrders = async (req, res) => {
    try {
        const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
        const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
        const total = await Payment.countDocuments({ user: req.user._id });
        const payments = await Payment.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();
        const fulfillments = await Order.find({ payment: { $in: payments.map((p) => p._id) } }).lean();
        const byPayment = new Map(fulfillments.map((f) => [String(f.payment), f]));
        const data = payments.map((payment) => ({
            ...payment,
            fulfillment: byPayment.get(String(payment._id)) ?? null,
        }));
        res.status(200).json({ data, page, limit, total, pages: Math.ceil(total / limit), success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

export const getMyOrder = async (req, res) => {
    try {
        const payment = await Payment.findOne({ _id: req.params.id, user: req.user._id }).lean();
        if (!payment) return res.status(404).json({ message: "Order not found", success: false });
        const fulfillment = await Order.findOne({ payment: payment._id }).lean();
        res.status(200).json({ data: { ...payment, fulfillment }, success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};
