import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
    product:[{
        required:true,
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product",
    }],
    user:{
        required:true,
        unique:true,
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
    },
    
},{
    timestamps:true
})
const Wishlist = mongoose.model("Wishlist", wishlistSchema)
export default Wishlist
