import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true,
    },
    contact:{
        type:String,
        required:true
    },
    fullname:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:['seller', 'buyer'],
        default:'buyer'
    }
})

userSchema.pre("save",async function(){
    if(!this.isModified("password")){ //check is this modified or not
        return;
    }
    const hash = await bcrypt.hash(this.pasword,10)
    this.password=hash
})

userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password,this.password)
}

const userData = mongoose.model('user',userSchema)

export default userData