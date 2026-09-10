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

export const config={
    MONGO_URI:process.env.MONGO_URI,
    JWT_KEY:process.env.JWT_KEY,
    PORT:process.env.PORT,
    CLIENT_URL:process.env.CLIENT_URL,
    GOOGLE_AUTH_CLIENT_ID:process.env.GOOGLE_AUTH_CLIENT_ID,
    GOOGLE_AUTH_SECRET_KEY:process.env.GOOGLE_AUTH_SECRET_KEY,
    IMAGEKIT_PRIVATE_KEY:process.env.IMAGEKIT_PRIVATE_KEY
}