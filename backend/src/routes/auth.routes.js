import { Router } from "express";
import authValidator from "../validation/auth.validation.js"
import authController  from '../controller/auth.controller.js'


const authRouter =Router()

authRouter.post('/signin',authValidator.validateSigninUser,authController.signinController)
authRouter.post('/signup', authValidator.validateSignupUser,authController.signupController)

export default authRouter