import {config} from '../config/config.js'
import Razorpay from 'razorpay'

const instance = new Razorpay({
    key_id: config.RAZORPAY_KEY_ID,
    key_secret: config.RAZORPAY_KEY_SECRET
})

export default instance