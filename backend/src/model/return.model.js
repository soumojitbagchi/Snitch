import mongoose from "mongoose";

const returnSchema = new mongoose.Schema({
    payment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "payment",
        required: true,
        index: true,
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    variantId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    reason: {
        type: String,
        required: true,
        maxlength: 1000,
    },
    status: {
        type: String,
        enum: ["requested", "approved", "rejected", "refunded"],
        default: "requested",
        index: true,
    },
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
        index: true,
    },
    decidedAt: { type: Date, default: null },
    decidedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        default: null,
    },
}, { timestamps: true });

returnSchema.index({ payment: 1, productId: 1, variantId: 1, status: 1 });

const ReturnRequest = mongoose.model("ReturnRequest", returnSchema);

export default ReturnRequest;
