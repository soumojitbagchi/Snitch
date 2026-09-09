import { Router } from "express";
import authValidator from "../validation/auth.validation.js";
import authController from "../controller/auth.controller.js";
import passport from "passport";
import { config } from "../config/config.js";

const authRouter = Router();

authRouter.post(
  "/signin",
  authValidator.validateSigninUser,
  authController.signinController,
);
authRouter.post(
  "/signup",
  authValidator.validateSignupUser,
  authController.signupController,
);
authRouter.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);
authRouter.get("/google/callback", (req, res, next) => {
  passport.authenticate("google", { session: false }, (err, user) => {
    if (err) {
      console.error("[google/callback] auth failed:", err?.message);
      return res.redirect(
        `${config.CLIENT_URL}/signin?error=${encodeURIComponent(err.message || "oauth")}`,
      );
    }
    if (!user) {
      return res.redirect(`${config.CLIENT_URL}/signin?error=oauth_no_user`);
    }
    req.user = user;
    return authController.googleCallbackController(req, res);
  })(req, res, next);
});

export default authRouter;
