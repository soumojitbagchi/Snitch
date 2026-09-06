import express from 'express'
import authRouter from '../routes/auth.routes.js'
import morgan from 'morgan'
import cors from "cors";
import cookie from 'cookie-parser'
import { config } from '../config/config.js';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';


const app = express()

app.use(express.json());
app.use(morgan("dev"))
app.use(
  cors({
    origin: config.CLIENT_URL,
    credentials: true,
  }),
);
app.use(passport.initialass())
passport.use(new GoogleStrategy({
    clientID: config.GOOGLE_AUTH_CLIENT_ID,
    clientSecret: config.GOOGLE_AUTH_SECRET_KEY,
    callbackURL: "/api/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}))
app.use(cookie())
app.get("/", ( req, res) => {
    res.status(200).json({ message: "Server is running" });
});
app.use('/api/auth',authRouter)


export default app