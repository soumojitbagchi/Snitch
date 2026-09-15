import mongoose from 'mongoose'

const paymentSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: false
    },
    amount: {
        type: Number,
        required: true
    },
    orderId: {
        type: String,
        required: true
    },
    currency: {
        type: String,
        required: true,
        default: 'INR'
    },
    paymentId: {
        type: String,
        default: ''
    },
    signature: {
        type: String,
        default: ''
    },
    paymentStatus: {
        type: String,
        required: true,
        default: 'pending',
        enum: ['pending', 'completed', 'failed']
    }
},{timestamps:true})

const Payment = mongoose.model('payment', paymentSchema)

export default Payment
