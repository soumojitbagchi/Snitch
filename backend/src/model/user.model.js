import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    contact: {
        type: String,
    },
    fullname: {
        type: String,
        required: true
    },
    password: {
        type: String,
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