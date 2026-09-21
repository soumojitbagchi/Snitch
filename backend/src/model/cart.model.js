import mongoose from "mongoose"


const cartItemSchema = mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,

    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
        min: 1,

    },
    variant: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
    }
}, {
    _id: false,
})

const cartSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    items: [cartItemSchema],
    totalAmount: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    displayCurrency: {
        type: String,
        required: true,
        default: "INR",
        enum: ["INR", "USD", "GBP", "EUR"],
    }
})

const Cart = mongoose.model("Cart", cartSchema);
export default Cart
