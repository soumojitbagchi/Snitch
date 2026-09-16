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

const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(
  cors({
    origin: config.CLIENT_URL,
    credentials: true,
  }),
);
app.use(passport.initialize());
passport.use(
  new GoogleStrategy(
    {
      clientID: config.GOOGLE_AUTH_CLIENT_ID,
      clientSecret: config.GOOGLE_AUTH_SECRET_KEY,
      callbackURL: `${config.CLIENT_URL}/api/auth/google/callback`,
    },
    authController.googleVerifyCallback,
  ),
);

app.use(cookie());

app.use("/api/auth", authRouter);
app.use("/api/product", productRouter);
app.use("/api/payment", paymentRouter);
app.use("/api", paymentRouter);
app.use("/", appRouter);

export default app;
