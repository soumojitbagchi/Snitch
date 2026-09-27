import mongoose from 'mongoose'
import priceSchema from './priceSchema.js'

const productSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    description: {
        type: String,
        required: true,
    },
    images: [
        {
            url: {
                type: String,
                required: true
            }
        }
    ],
    variant: [
        {
            images: [{
                url: {
                    type: String,
                    required: true
                }
            }],
            price: {
                type: priceSchema
            },
            stock: {
                type: Number,
                required: true,
                default: 0,
                min: 0,
            },
            attributes: {
                type: Map,
                of: String
            }
        }
    ],
    category:{
        type: String,
        index:true,
        default: '',
    },
    tags:{
        type:[String],
        default:[]
    }
}, {
    timestamps: true
})
productSchema.index({title:'text', description:'text', category:'text'})

const Product = mongoose.model('Product', productSchema)

export default Product
