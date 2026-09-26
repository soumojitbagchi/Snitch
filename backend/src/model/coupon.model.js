import mongoose from "mongoose";


const couponSchema = new mongoose.Schema({
    coupon:{
        type:String,
        required:true,
        unique:true,
        uppercase:true,
        trim:true
    },
    stock:{
        type:Number,
        required:true,
        default:0,
        min:0
    },
    minAmount:{
        type:Number,
        required:true,
        default:100,
        min:0
    },
    expiresAt:{
        type:Date,
        required:true
    },
    discountType:{
        type:String,
        required:true,
        enum:["FLAT","PERCENT"],
        default:"FLAT"
    },
    discountValue:{
        type:Number,
        required:true,
        default:0,
        min:0
    },
    // Cap for PERCENT discounts (e.g. 10% off up to 500). Ignored for FLAT.
    maxDiscount:{
        type:Number,
        required:false,
        default:null,
        min:0
    }
},{timestamps:true})

const coupon = mongoose.model("Coupon",couponSchema)

export default coupon