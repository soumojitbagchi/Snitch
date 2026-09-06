import mongoose from 'mongoose'
import { config } from './config.js'

const connectToDB = async ( )=>{
   try {
     await mongoose.connect(config.MONGO_URI)
     console.log("connected to DB")
   } catch (error) {
        throw error
   }
}

export default connectToDB