import { Router } from "express";
import authValidator from "../validation/auth.validation.js"
import authController from '../controller/auth.controller.js'
import passport from "passport";
import { config } from "../config/config.js";


const authRouter = Router()

authRouter.post('/signin', authValidator.validateSigninUser, authController.signinController)
authRouter.post('/signup', authValidator.validateSignupUser, authController.signupController)
authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }))
authRouter.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: `${config.CLIENT_URL}/signin?error=oauth` }), authController.googleCallbackController)

export default authRouter