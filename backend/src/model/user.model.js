import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const addressSchema = new mongoose.Schema({
    label: { type: String, trim: true, default: "Home" },
    recipientName: { type: String, trim: true, required: true },
    phone: { type: String, trim: true },
    line1: { type: String, trim: true, required: true },
    line2: { type: String, trim: true },
    city: { type: String, trim: true, required: true },
    state: { type: String, trim: true, required: true },
    postalCode: { type: String, trim: true, required: true },
    country: { type: String, trim: true, default: "India" },
    isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    contact: {
        type: String,
    },
    addresses: {
        type: [addressSchema],
        default: [],
    },
    fullname: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required:false,
        select: false
    },
    role: {
        type: String,
        enum: ['seller', 'buyer'],
        default: 'buyer'
    },
    googleId: {
        type: String,
        required: false,
        sparse: true,
        unique: true,
    },
    avatar: {
        type: String,
        required: false
    },
    provider: {
        type: String,
        required: false
    }
})

const userData = mongoose.model('user', userSchema)

export default userData
