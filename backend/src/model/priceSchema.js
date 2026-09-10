import mongoose from "mongoose";

const priceSchema = mongoose.Schema({
    basePrice: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true,
        enum: ['USD', 'EUR', 'GBP', 'INR'],
        default: 'INR'
    }
}, {
    _id: false,
    _v: false
});

export default priceSchema