import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, "../../.env") })

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
if(process.env.NODE_ENV === "production" && !process.env.BACKEND_URL){
    throw new Error("backend url isnt defined")
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
if(!process.env.OPENROUTER_API_KEY){
    throw new Error("openrouter api key isnt defined")
}
if(!process.env.OPENROUTER_MODEL){
    throw new Error("openrouter model isnt defined")
}
if(!process.env.JWT_SESSION_KEY){
    throw new Error("session jwt isnt defined")
}
// Managed Redis (Render/Upstash) provides a single REDIS_URL (rediss://...).
// Self-hosted setups can use the split HOST/PORT/USER/PASSWORD vars instead.
if(!process.env.REDIS_URL){
    if(!process.env.REDIS_PORT){
        throw new Error("redis port isnt defined (or set REDIS_URL)")
    }
    if(!process.env.REDIS_PASSWORD){
        throw new Error("redis password isnt defined (or set REDIS_URL)")
    }
    if(!process.env.REDIS_HOST){
        throw new Error("redis host isnt defined (or set REDIS_URL)")
    }
    if(!process.env.REDIS_USER){
        throw new Error("redis user isnt defined (or set REDIS_URL)")
    }
}
export const config={
    MONGO_URI:process.env.MONGO_URI,
    JWT_KEY:process.env.JWT_KEY,
    PORT:process.env.PORT,
    CLIENT_URL:process.env.CLIENT_URL,
    BACKEND_URL:process.env.BACKEND_URL || `http://localhost:${process.env.PORT}`,
    GOOGLE_AUTH_CLIENT_ID:process.env.GOOGLE_AUTH_CLIENT_ID,
    GOOGLE_AUTH_SECRET_KEY:process.env.GOOGLE_AUTH_SECRET_KEY,
    IMAGEKIT_PRIVATE_KEY:process.env.IMAGEKIT_PRIVATE_KEY,
    RAZORPAY_KEY_ID:process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET:process.env.RAZORPAY_KEY_SECRET,
    RATE_EXCHANGE:process.env.RATE_EXCHANGE,
    GOOGLE_USER:process.env.GOOGLE_USER,
    GOOGLE_AUTH_APP_PASSWORD:process.env.GOOGLE_AUTH_APP_PASSWORD,
    MISTRAL_API_KEY:process.env.MISTRAL_API_KEY,
    MISTRAL_MODEL:process.env.MISTRAL_MODEL,
    OPENROUTER_API_KEY:process.env.OPENROUTER_API_KEY,
    OPENROUTER_MODEL:process.env.OPENROUTER_MODEL,
    JWT_SESSION_KEY:process.env.JWT_SESSION_KEY,
    REDIS_URL:process.env.REDIS_URL || "",
    REDIS_PASSWORD:process.env.REDIS_PASSWORD,
    REDIS_HOST:process.env.REDIS_HOST,
    REDIS_PORT:process.env.REDIS_PORT,
    REDIS_USER:process.env.REDIS_USER,
}