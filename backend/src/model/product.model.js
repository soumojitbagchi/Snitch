import mongoose from 'mongoose'

const productSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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
    verient: [
        {
            images: [{
                url: {
                    type: String,
                    required: true
                },
                price:{
                    type: Number,
                    required: true
                },
                stock:{
                    type: priceSchema
                },
                attributes:{
                    type:Map,
                    of:String
                }
            }]
        }
    ]

}, {
    timestamps: true
})

const Product = mongoose.model('Product', productSchema)

export default Product