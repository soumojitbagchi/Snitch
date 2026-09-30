import mongoose from "mongoose";
import Payment from "../model/payment.model.js";
import Product from "../model/product.model.js";
import Order from "../model/order.model.js";
import Review from "../model/review.model.js";
import ReturnRequest from "../model/return.model.js";
import Coupon from "../model/coupon.model.js";
import { sendLowStockAlert } from "../service/sellerAlert.service.js";

const { ObjectId } = mongoose.Types;

const toObjectId = (value) => (ObjectId.isValid(value) ? new ObjectId(value) : null);

const parsePaging = (query, maxLimit = 50) => {
    const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
    const limit = Math.min(maxLimit, Math.max(1, Number.parseInt(query.limit, 10) || 20));
    return { page, limit, skip: (page - 1) * limit };
};

const variantAttr = (attrs, key) => attrs?.get?.(key) ?? attrs?.[key] ?? "";

const sellerProductMap = async (productIds) => {
    const unique = [...new Set(productIds.map(String))].filter((id) => ObjectId.isValid(id));
    if (unique.length === 0) return new Map();
    const products = await Product.find({ _id: { $in: unique } }).select("seller title").lean();
    return new Map(products.map((product) => [String(product._id), product]));
};

const myItemsOf = (payment, sellerId, productMap) => {
    const me = String(sellerId);
    return (payment.items || []).filter((item) => {
        const product = productMap.get(String(item.productId));
        return product && String(product.seller) === me;
    });
};

const myTotals = (items) => items.reduce(
    (sum, item) => ({
        total: sum.total + (Number(item.lineTotal) || 0),
        units: sum.units + (Number(item.quantity) || 0),
    }),
    { total: 0, units: 0 },
);

export const listSellerOrders = async (req, res) => {
    try {
        const sellerId = toObjectId(req.user._id);
        const { page, limit, skip } = parsePaging(req.query);
        const { status } = req.query;

        const pipeline = [
            { $match: { sellers: sellerId } },
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "buyer",
                    pipeline: [{ $project: { fullname: 1, email: 1, contact: 1 } }],
                },
            },
            { $unwind: { path: "$buyer", preserveNullAndEmptyArrays: true } }, 
            {
                $lookup: {
                    from: "orders",  // takes orders collection
                    localField: "_id", //compare against the collection
                    foreignField: "payment", //take current data's property
                    as: "fulfillment", //puts what data lookup found with upper attributes informations
                },
            },
            { $unwind: { path: "$fulfillment", preserveNullAndEmptyArrays: true } },  //if the path(buyer) not exists then keep original data
        ];
        if (status) {
            pipeline.push({
                $match: status === "pending"
                    ? { $or: [{ "fulfillment.status": "pending" }, { fulfillment: null }] }
                    : { "fulfillment.status": status },
            });
        }
        pipeline.push({
            $facet: {
                data: [{ $skip: skip }, { $limit: limit }],
                total: [{ $count: "count" }],
            },
        });

        const [result] = await Payment.aggregate(pipeline);
        const payments = result?.data ?? [];
        const total = result?.total?.[0]?.count ?? 0;

        const productMap = await sellerProductMap(payments.flatMap((p) => p.items.map((i) => i.productId)));
        const data = payments.map((payment) => {
            const items = myItemsOf(payment, sellerId, productMap);
            return { ...payment, items, ...myTotals(items), fulfillment: payment.fulfillment ?? null };
        });

        res.status(200).json({ data, page, limit, total, pages: Math.ceil(total / limit), success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

export const getSellerOrder = async (req, res) => {
    try {
        const sellerId = toObjectId(req.user._id);
        const paymentId = toObjectId(req.params.paymentId);
        if (!paymentId) return res.status(400).json({ message: "Invalid payment id", success: false });

        const payment = await Payment.findOne({ _id: paymentId, sellers: sellerId })
            .populate("user", "fullname email contact addresses")
            .lean();
        if (!payment) return res.status(404).json({ message: "Order not found", success: false });

        const productMap = await sellerProductMap(payment.items.map((i) => i.productId));
        const items = myItemsOf(payment, sellerId, productMap);
        const fulfillment = await Order.findOne({ payment: payment._id }).lean();

        res.status(200).json({ data: { ...payment, items, ...myTotals(items), fulfillment }, success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

const NEXT_STATUS = {
    pending: ["processing", "cancelled"],
    processing: ["shipped", "cancelled"],
    shipped: ["delivered", "cancelled"],
    delivered: [],
    cancelled: [],
};

export const updateOrderStatus = async (req, res) => {
    try {
        const sellerId = toObjectId(req.user._id);
        const paymentId = toObjectId(req.params.paymentId);
        const { status, reason } = req.body;
        if (!paymentId) return res.status(400).json({ message: "Invalid payment id", success: false });

        const payment = await Payment.findOne({ _id: paymentId, sellers: sellerId }).lean();
        if (!payment) return res.status(404).json({ message: "Order not found", success: false });

        const fulfillment = await Order.findOneAndUpdate(
            { payment: payment._id },
            { $setOnInsert: { payment: payment._id, status: "pending", statusHistory: [{ status: "pending", at: new Date() }] } },
            { upsert: true, new: true },
        );
        if (!NEXT_STATUS[fulfillment.status]?.includes(status)) {
            return res.status(400).json({ message: `Cannot move order from ${fulfillment.status} to ${status}`, success: false });
        }

        if (status === "cancelled") {
            const productMap = await sellerProductMap(payment.items.map((i) => i.productId));
            const items = myItemsOf(payment, sellerId, productMap);
            await Promise.all(items.map((item) => Product.updateOne(
                { _id: item.productId, "variant._id": item.variantId },
                { $inc: { "variant.$.stock": Number(item.quantity) || 0 } },
            )));
        }

        fulfillment.status = status;
        fulfillment.statusHistory.push({ status, at: new Date() });
        if (status === "processing" && !fulfillment.slaDueAt) {
            fulfillment.slaDueAt = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
        }
        if (reason) fulfillment.cancelReason = String(reason).slice(0, 500);
        await fulfillment.save();

        res.status(200).json({ message: `Order ${status}`, data: fulfillment, success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

const PLATFORM_FEE_RATE = 0.05;
const TCS_RATE = 0.01;

export const getSellerStats = async (req, res) => {
    try {
        const sellerId = toObjectId(req.user._id);
        const days = Math.min(90, Math.max(7, Number.parseInt(req.query.days, 10) || 30));
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const perPayment = await Payment.aggregate([
            { $match: { sellers: sellerId, paymentStatus: "completed", createdAt: { $gte: since } } },
            { $addFields: { paymentTotal: { $sum: "$items.lineTotal" } } },
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "products",
                    localField: "items.productId",
                    foreignField: "_id",
                    as: "prod",
                    pipeline: [{ $project: { seller: 1, title: 1 } }],
                },
            },
            { $unwind: "$prod" },
            { $match: { "prod.seller": sellerId } },
            {
                $group: {
                    _id: "$_id",
                    myTotal: { $sum: "$items.lineTotal" },
                    units: { $sum: "$items.quantity" },
                    paymentTotal: { $first: "$paymentTotal" },
                    discount: { $first: "$discount" },
                    createdAt: { $first: "$createdAt" },
                    lines: {
                        $push: {
                            productId: "$items.productId",
                            title: { $ifNull: ["$items.title", "$prod.title"] },
                            units: "$items.quantity",
                            revenue: "$items.lineTotal",
                        },
                    },
                },
            },
        ]);

        let gross = 0;
        let discountShare = 0;
        let units = 0;
        const daily = new Map();
        const productMap = new Map();
        for (const row of perPayment) {
            const share = row.paymentTotal > 0 ? row.myTotal / row.paymentTotal : 0;
            gross += row.myTotal;
            discountShare += (Number(row.discount) || 0) * share;
            units += row.units;
            const day = row.createdAt.toISOString().slice(0, 10);
            const bucket = daily.get(day) ?? { date: day, revenue: 0, orders: 0, units: 0 };
            bucket.revenue += row.myTotal;
            bucket.orders += 1;
            bucket.units += row.units;
            daily.set(day, bucket);
            for (const line of row.lines) {
                const key = String(line.productId);
                const entry = productMap.get(key) ?? { productId: key, title: line.title, units: 0, revenue: 0 };
                entry.units += line.units;
                entry.revenue += line.revenue;
                productMap.set(key, entry);
            }
        }

        const net = gross - discountShare;
        const fees = net * PLATFORM_FEE_RATE;
        const tcs = net * TCS_RATE;
        const payable = net - fees - tcs;
        const dailySeries = [...daily.values()].sort((a, b) => (a.date < b.date ? -1 : 1));
        const topProducts = [...productMap.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 10);

        const completedCount = await Payment.countDocuments({ sellers: sellerId, paymentStatus: "completed" });
        const settledCount = await Payment.countDocuments({ sellers: sellerId });
        const conversion = settledCount > 0 ? completedCount / settledCount : 0;

        res.status(200).json({
            data: {
                gross: Math.round(gross * 100) / 100,
                discounts: Math.round(discountShare * 100) / 100,
                net: Math.round(net * 100) / 100,
                fees: Math.round(fees * 100) / 100,
                tcs: Math.round(tcs * 100) / 100,
                payable: Math.round(payable * 100) / 100,
                units,
                orders: perPayment.length,
                conversion: Math.round(conversion * 1000) / 10,
                dailySeries,
                topProducts,
            },
            success: true,
        });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

export const getSellerSettlements = async (req, res) => {
    try {
        const sellerId = toObjectId(req.user._id);
        const rows = await Payment.aggregate([
            { $match: { sellers: sellerId, paymentStatus: "completed" } },
            { $addFields: { paymentTotal: { $sum: "$items.lineTotal" } } },
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "products",
                    localField: "items.productId",
                    foreignField: "_id",
                    as: "prod",
                    pipeline: [{ $project: { seller: 1 } }],
                },
            },
            { $unwind: "$prod" },
            { $match: { "prod.seller": sellerId } },
            {
                $group: {
                    _id: {
                        year: { $isoWeekYear: "$createdAt" },
                        week: { $isoWeek: "$createdAt" },
                    },
                    gross: { $sum: "$items.lineTotal" },
                    units: { $sum: "$items.quantity" },
                    orders: { $addToSet: "$_id" },
                    latest: { $max: "$createdAt" },
                },
            },
            { $sort: { "_id.year": -1, "_id.week": -1 } },
            { $limit: 12 },
        ]);

        const data = rows.map((row, index) => {
            const net = row.gross;
            const fees = net * PLATFORM_FEE_RATE;
            const tcs = net * TCS_RATE;
            return {
                id: `${row._id.year}-W${row._id.week}`,
                date: row.latest,
                gross: Math.round(row.gross * 100) / 100,
                fees: Math.round(fees * 100) / 100,
                tcs: Math.round(tcs * 100) / 100,
                payable: Math.round((net - fees - tcs) * 100) / 100,
                orders: row.orders.length,
                units: row.units,
                status: index === 0 ? "processing" : "paid",
            };
        });

        res.status(200).json({ data, success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

export const getAttentionFeed = async (req, res) => {
    try {
        const sellerId = toObjectId(req.user._id);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const [newOrders, returnRequests, lowRatings] = await Promise.all([
            Payment.countDocuments({ sellers: sellerId, paymentStatus: "completed", createdAt: { $gte: weekAgo } }),
            ReturnRequest.countDocuments({ seller: sellerId, status: "requested" }),
            Review.countDocuments({ status: "visible", rating: { $lte: 2 }, createdAt: { $gte: weekAgo } }),
        ]);

        const products = await Product.find({ seller: sellerId }).select("title variant").lean();
        let outOfStock = 0;
        let lowStock = 0;
        for (const product of products) {
            for (const variant of product.variant ?? []) {
                if (variant.stock === 0) outOfStock += 1;
                else if (variant.stock < 5) lowStock += 1;
            }
        }

        const feed = [];
        if (newOrders > 0) feed.push({ type: "orders", label: `${newOrders} new order(s) this week`, severity: "info" });
        if (returnRequests > 0) feed.push({ type: "returns", label: `${returnRequests} return request(s) awaiting decision`, severity: "warn" });
        if (outOfStock > 0) feed.push({ type: "stockout", label: `${outOfStock} variant(s) out of stock`, severity: "urgent" });
        if (lowStock > 0) feed.push({ type: "lowstock", label: `${lowStock} variant(s) running low`, severity: "warn" });
        if (lowRatings > 0) feed.push({ type: "ratings", label: `${lowRatings} low rating(s) this week`, severity: "warn" });

        res.status(200).json({
            data: {
                feed,
                counts: { newOrders, returnRequests, outOfStock, lowStock, lowRatings },
            },
            success: true,
        });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

export const getLowStock = async (req, res) => {
    try {
        const sellerId = toObjectId(req.user._id);
        const threshold = Math.max(1, Number.parseInt(req.query.threshold, 10) || 5);
        const products = await Product.find({ seller: sellerId }).select("title images variant").lean();
        const rows = [];
        for (const product of products) {
            for (const variant of product.variant ?? []) {
                if (variant.stock < threshold) {
                    rows.push({
                        productId: String(product._id),
                        title: product.title,
                        image: product.images?.[0]?.url || "",
                        variantId: String(variant._id),
                        size: variantAttr(variant.attributes, "size"),
                        color: variantAttr(variant.attributes, "color"),
                        price: variant.price,
                        stock: variant.stock,
                        status: variant.stock === 0 ? "out" : "low",
                    });
                }
            }
        }
        rows.sort((a, b) => a.stock - b.stock);
        res.status(200).json({ data: rows, threshold, success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

export const restockVariant = async (req, res) => {
    try {
        const sellerId = toObjectId(req.user._id);
        const { productId, variantId, quantity } = req.body;
        const qty = Number(quantity);
        if (!ObjectId.isValid(productId) || !ObjectId.isValid(variantId)) {
            return res.status(400).json({ message: "Invalid product or variant id", success: false });
        }
        if (!Number.isInteger(qty) || qty < 1 || qty > 10000) {
            return res.status(400).json({ message: "Quantity must be an integer between 1 and 10000", success: false });
        }
        const result = await Product.updateOne(
            { _id: productId, seller: sellerId, "variant._id": toObjectId(variantId) },
            { $inc: { "variant.$.stock": qty } },
        );
        if (result.modifiedCount !== 1) {
            return res.status(404).json({ message: "Product or variant not found", success: false });
        }
        res.status(200).json({ message: `Restocked ${qty} unit(s)`, success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

export const sendStockAlert = async (req, res) => {
    try {
        const seller = req.user;
        const products = await Product.find({ seller: seller._id }).select("title variant").lean();
        const lows = [];
        for (const product of products) {
            for (const variant of product.variant ?? []) {
                if (variant.stock < 5) {
                    lows.push(`${product.title} (${variantAttr(variant.attributes, "size")}${variantAttr(variant.attributes, "color") ? `/${variantAttr(variant.attributes, "color")}` : ""}): ${variant.stock} left`);
                }
            }
        }
        if (lows.length === 0) {
            return res.status(200).json({ message: "No low-stock variants", data: [], success: true });
        }
        sendLowStockAlert({ email: seller.email, name: seller.fullname, items: lows }).catch(
            (error) => console.error("Low-stock alert failed:", error.message),
        );
        res.status(200).json({ message: `Alert queued for ${lows.length} variant(s)`, data: lows, success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

export const getVariantVelocity = async (req, res) => {
    try {
        const sellerId = toObjectId(req.user._id);
        const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const rows = await Payment.aggregate([
            { $match: { sellers: sellerId, paymentStatus: "completed", createdAt: { $gte: since } } },
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "products",
                    localField: "items.productId",
                    foreignField: "_id",
                    as: "prod",
                    pipeline: [{ $project: { seller: 1 } }],
                },
            },
            { $unwind: "$prod" },
            { $match: { "prod.seller": sellerId } },
            {
                $group: {
                    _id: { product: "$items.productId", variant: "$items.variantId" },
                    units30: { $sum: "$items.quantity" },
                },
            },
        ]);
        const velocity = {};
        for (const row of rows) {
            velocity[`${row._id.product}:${row._id.variant}`] = {
                units30: row.units30,
                perDay: row.units30 / 30,
            };
        }
        res.status(200).json({ data: velocity, success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

export const listSellerReviews = async (req, res) => {
    try {
        const sellerId = toObjectId(req.user._id);
        const { page, limit, skip } = parsePaging(req.query);
        const match = {};
        if (req.query.rating) {
            const rating = Number(req.query.rating);
            if (rating >= 1 && rating <= 5) match.rating = rating;
        } 

        const [result] = await Review.aggregate([
            {
                $lookup: {
                    from: "products",
                    localField: "product",
                    foreignField: "_id",
                    as: "prod",
                    pipeline: [{ $project: { seller: 1, title: 1, images: 1 } }],
                },
            },
            { $unwind: "$prod" },
            { $match: { "prod.seller": sellerId, ...match } },
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "author",
                    pipeline: [{ $project: { fullname: 1 } }],
                },
            },
            { $unwind: { path: "$author", preserveNullAndEmptyArrays: true } },
            {
                $facet: {
                    data: [{ $skip: skip }, { $limit: limit }],
                    total: [{ $count: "count" }],
                    avg: [{ $group: { _id: null, rating: { $avg: "$rating" }, count: { $sum: 1 } } }],
                    perProduct: [
                        {
                            $group: {
                                _id: "$product",
                                title: { $first: "$prod.title" },
                                avg: { $avg: "$rating" },
                                count: { $sum: 1 },
                            },
                        },
                        { $sort: { count: -1 } },
                        { $limit: 20 },
                    ],
                },
            },
        ]);

        res.status(200).json({
            data: result?.data ?? [],
            page,
            limit,
            total: result?.total?.[0]?.count ?? 0,
            pages: Math.ceil((result?.total?.[0]?.count ?? 0) / limit),
            average: result?.avg?.[0]?.rating ? Math.round(result.avg[0].rating * 10) / 10 : 0,
            perProduct: result?.perProduct ?? [],
            success: true,
        });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

export const replyReview = async (req, res) => {
    try {
        const sellerId = toObjectId(req.user._id);
        const reviewId = toObjectId(req.params.id);
        const { sellerReply } = req.body;
        if (!reviewId) return res.status(400).json({ message: "Invalid review id", success: false });
        if (typeof sellerReply !== "string" || !sellerReply.trim() || sellerReply.length > 2000) {
            return res.status(400).json({ message: "Reply must be 1-2000 characters", success: false });
        }

        const review = await Review.findById(reviewId);
        if (!review) return res.status(404).json({ message: "Review not found", success: false });
        const product = await Product.findOne({ _id: review.product, seller: sellerId }).select("_id").lean();
        if (!product) return res.status(403).json({ message: "Not your product review", success: false });

        review.sellerReply = sellerReply.trim();
        await review.save();
        res.status(200).json({ message: "Reply saved", data: review, success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

export const listSellerReturns = async (req, res) => {
    try {
        const sellerId = toObjectId(req.user._id);
        const { page, limit, skip } = parsePaging(req.query);
        const match = { seller: sellerId };
        if (req.query.status) match.status = req.query.status;

        const total = await ReturnRequest.countDocuments(match);
        const data = await ReturnRequest.find(match)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("payment", "orderId amount currency paymentStatus createdAt")
            .populate("productId", "title images")
            .populate("requestedBy", "fullname email")
            .lean();

        const top = await ReturnRequest.aggregate([
            { $match: { seller: sellerId } },
            { $group: { _id: { product: "$productId", variant: "$variantId" }, count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: "products",
                    localField: "_id.product",
                    foreignField: "_id",
                    as: "prod",
                    pipeline: [{ $project: { title: 1 } }],
                },
            },
            { $unwind: { path: "$prod", preserveNullAndEmptyArrays: true } },
        ]);

        res.status(200).json({
            data,
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            topReturned: top,
            success: true,
        });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

export const decideReturn = async (req, res) => {
    try {
        const sellerId = toObjectId(req.user._id);
        const returnId = toObjectId(req.params.id);
        const { status } = req.body;
        if (!returnId) return res.status(400).json({ message: "Invalid return id", success: false });

        const request = await ReturnRequest.findOne({ _id: returnId, seller: sellerId });
        if (!request) return res.status(404).json({ message: "Return request not found", success: false });

        const allowed = {
            requested: ["approved", "rejected"],
            approved: ["refunded"],
            rejected: [],
            refunded: [],
        };
        if (!allowed[request.status]?.includes(status)) {
            return res.status(400).json({ message: `Cannot move return from ${request.status} to ${status}`, success: false });
        }

        if (status === "refunded") {
            await Product.updateOne(
                { _id: request.productId, "variant._id": request.variantId },
                { $inc: { "variant.$.stock": Number(request.quantity) || 0 } },
            );
        }

        request.status = status;
        request.decidedAt = new Date();
        request.decidedBy = sellerId;
        await request.save();

        res.status(200).json({ message: `Return ${status}`, data: request, success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

export const listSellerCoupons = async (req, res) => {
    try {
        const data = await Coupon.find({ seller: req.user._id }).sort({ createdAt: -1 }).lean();
        res.status(200).json({ data, success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

export const createSellerCoupon = async (req, res) => {
    try {
        const { coupon, stock, minAmount, expiresAt, discountType, discountValue, maxDiscount, currency } = req.body;
        if (!coupon || !expiresAt || !discountType || discountValue == null) {
            return res.status(400).json({ message: "coupon, expiresAt, discountType and discountValue are required", success: false });
        }
        if (!["FLAT", "PERCENT"].includes(discountType)) {
            return res.status(400).json({ message: "discountType must be FLAT or PERCENT", success: false });
        }
        const doc = await Coupon.create({
            coupon,
            stock: stock ?? 100,
            minAmount: minAmount ?? 0,
            expiresAt,
            discountType,
            discountValue,
            maxDiscount: maxDiscount ?? null,
            currency: currency || "INR",
            seller: req.user._id,
        });
        res.status(201).json({ message: "Coupon created", data: doc, success: true });
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(409).json({ message: "Coupon code already exists", success: false });
        }
        res.status(500).json({ message: error.message, success: false });
    }
};

export const deleteSellerCoupon = async (req, res) => {
    try {
        const data = await Coupon.findOneAndDelete({ coupon: String(req.params.code || "").toUpperCase(), seller: req.user._id });
        if (!data) return res.status(404).json({ message: "Coupon not found", success: false });
        res.status(200).json({ message: "Coupon deleted", success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};
