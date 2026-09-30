import mongoose from "mongoose";
import Review from "../model/review.model.js";
import Product from "../model/product.model.js";
import Payment from "../model/payment.model.js";

export const listProductReviews = async (req, res) => {
    try {
        const productId = req.params.id;
        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({ message: "Invalid product id", success: false });
        }
        const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
        const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));
        const match = { product: new mongoose.Types.ObjectId(productId), status: "visible" };

        const total = await Review.countDocuments(match);
        const data = await Review.find(match)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("user", "fullname avatar")
            .lean();
        const [agg] = await Review.aggregate([
            { $match: match },
            { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
        ]);

        res.status(200).json({
            data,
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            average: agg?.avg ? Math.round(agg.avg * 10) / 10 : 0,
            success: true,
        });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

export const createProductReview = async (req, res) => {
    try {
        const productId = req.params.id;
        const { rating, text, paymentId } = req.body;
        if (!mongoose.isValidObjectId(productId) || !mongoose.isValidObjectId(paymentId)) {
            return res.status(400).json({ message: "Invalid product or payment id", success: false });
        }
        const numericRating = Number(rating);
        if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
            return res.status(400).json({ message: "Rating must be an integer from 1 to 5", success: false });
        }

        const productExists = await Product.exists({ _id: productId });
        if (!productExists) return res.status(404).json({ message: "Product not found", success: false });

        const payment = await Payment.findOne({
            _id: paymentId,
            user: req.user._id,
            paymentStatus: "completed",
            "items.productId": new mongoose.Types.ObjectId(productId),
        }).select("_id");
        if (!payment) {
            return res.status(403).json({ message: "Only verified purchases can be reviewed", success: false });
        }

        const review = await Review.create({
            product: productId,
            user: req.user._id,
            payment: paymentId,
            rating: numericRating,
            text: String(text || "").slice(0, 2000),
        });
        res.status(201).json({ message: "Review submitted", data: review, success: true });
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(409).json({ message: "You already reviewed this purchase", success: false });
        }
        res.status(500).json({ message: error.message, success: false });
    }
};
