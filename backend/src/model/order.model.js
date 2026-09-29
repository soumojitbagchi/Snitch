import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    payment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "payment",
        required: true,
        unique: true,
    },
    status: {
        type: String,
        enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
        default: "pending",
        index: true,
    },
    statusHistory: [{
        status: {
            type: String,
            enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
            required: true,
        },
        at: { type: Date, default: Date.now },
    }],
    slaDueAt: { type: Date, default: null },
    cancelReason: { type: String, default: "" },
}, { timestamps: true });

orderSchema.index({ status: 1, updatedAt: 1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;
