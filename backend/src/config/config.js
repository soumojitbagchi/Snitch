import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 1) default: looks in process.cwd() (backend/.env when run from backend/)
// 2) explicit: backend/.env resolved from this file (works even if cwd is backend/src/)
// 3) legacy fallback: src/.env (your old location)
dotenv.config()
dotenv.config({ path: path.resolve(__dirname, "../../.env") })
dotenv.config({ path: path.resolve(__dirname, "../.env") })

if(!process.env.MONGO_URI){
    throw new Error("mongo uri isnt defined")
}
if(!process.env.JWT_KEY){
    throw new Error("jwt isnt defined")

}
if(!process.env.PORT){
    throw new Error("Port isnt defined")
}
if(!process.env.CLIENT_URL){
    throw new Error("client url isnt defined")

}
if(!process.env.GOOGLE_AUTH_SECRET_KEY){
    throw new Error("oAuth secret isnt defined")

}
if(!process.env.GOOGLE_AUTH_CLIENT_ID){
    throw new Error("client id isnt defined")

}
if(!process.env.IMAGEKIT_PRIVATE_KEY){
    throw new Error("imagekit private key isnt defined")
}
if(!process.env.RAZORPAY_KEY_ID){
    throw new Error("razorpay key id isnt defined")
}
if(!process.env.RAZORPAY_KEY_SECRET){
    throw new Error("razorpay key secret isnt defined")
}
if(!process.env.RATE_EXCHANGE){
    throw new Error("exchange rate api isnt defined")
}
if(!process.env.GOOGLE_AUTH_APP_PASSWORD){
    throw new Error("google auth app password isnt defined")
}
if(!process.env.MISTRAL_API_KEY){
    throw new Error("mistral api key isnt defined")
}
if(!process.env.GOOGLE_USER){
    throw new Error("google user isnt defined")
}
export const config={
    MONGO_URI:process.env.MONGO_URI,
    JWT_KEY:process.env.JWT_KEY,
    PORT:process.env.PORT,
    CLIENT_URL:process.env.CLIENT_URL,
    GOOGLE_AUTH_CLIENT_ID:process.env.GOOGLE_AUTH_CLIENT_ID,
    GOOGLE_AUTH_SECRET_KEY:process.env.GOOGLE_AUTH_SECRET_KEY,
    IMAGEKIT_PRIVATE_KEY:process.env.IMAGEKIT_PRIVATE_KEY,
    RAZORPAY_KEY_ID:process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET:process.env.RAZORPAY_KEY_SECRET,
    RATE_EXCHANGE:process.env.RATE_EXCHANGE,
    GOOGLE_USER:process.env.GOOGLE_USER,
    GOOGLE_AUTH_APP_PASSWORD:process.env.GOOGLE_AUTH_APP_PASSWORD,
    MISTRAL_API_KEY:process.env.MISTRAL_API_KEY,
    MISTRAL_MODEL:process.env.MISTRAL_MODEL || "mistral-small-latest",
}