import express from "express";
import authRouter from "../routes/auth.routes.js";
import morgan from "morgan";
import cors from "cors";
import cookie from "cookie-parser";
import { config } from "../config/config.js";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import authController from "../controller/auth.controller.js";
import appRouter from "../routes/app.route.js";
import productRouter from "../routes/product.route.js";
import paymentRouter from "../routes/payment.routes.js";
import CartRouter from "../routes/cart.route.js";

const app = express();

// Required on Render (behind a proxy) for Secure cross-site cookies.
app.set("trust proxy", 1);

app.use(express.json());
app.use(morgan("dev"));
const allowedOrigins = [config.CLIENT_URL, config.BACKEND_URL].filter(
  (origin, index, all) => origin && all.indexOf(origin) === index,
);
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(passport.initialize());
passport.use(
  new GoogleStrategy(
    {
      clientID: config.GOOGLE_AUTH_CLIENT_ID,
      clientSecret: config.GOOGLE_AUTH_SECRET_KEY,
      // OAuth callback must hit the backend, not the frontend.
      callbackURL: `${config.BACKEND_URL}/api/auth/google/callback`,
    },
    authController.googleVerifyCallback,
  ),
);

app.use(cookie());

app.use("/api/auth", authRouter);
app.use("/api/product", productRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/cart", CartRouter);
app.use("/api", paymentRouter);
app.use("/", appRouter);

// Keep unexpected async/controller failures from becoming HTML responses.
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  console.error("Unhandled request error:", error);
  return res.status(error.statusCode || error.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === "production" ? "Internal server error" : error.message,
  });
});

export default app;
