import userData from "../model/user.model.js";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

// Helper: issue JWT for any authed user (local or google)
const issueToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      fullname: user.fullname,
      email: user.email,
    },
    config.JWT_KEY,
    { expiresIn: "1h" },
  );
};

const setTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 1000, // 1h, matches JWT
    path: "/",
  });
};

const signinController = async (req, res) => {
  const { email, password } = req.body;
  const isUserExists = await userData.findOne({ email });
  if (!isUserExists || !isUserExists.password) {
    return res.status(401).json({
      success: false,
      error: "wrong credentials",
    });
  }
  // Prefer model method, fall back to bcrypt directly
  const isMatch = isUserExists.comparePassword
    ? await isUserExists.comparePassword(password)
    : await bcrypt.compare(password, isUserExists.password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      error: "wrong credentials",
    });
  }
  const token = issueToken(isUserExists);
  setTokenCookie(res, token);
  res.status(200).json({ token, success: true });
};

const signupController = async (req, res) => {
  const { email, password, fullname, contact, role } = req.body;
  const isUserExists = await userData.findOne({ email });
  if (isUserExists) {
    return res.status(409).json({
      success: false,
      error: "user already registered, please signin",
    });
  }
  const user = await userData.create({
    email,
    password,
    contact,
    role,
    fullname,
  });
  const token = issueToken(user);
  setTokenCookie(res, token);
  res.status(201).json({
    success: true,
    token,
  });
};
const googleCallback= async ( req,res)=>{

  console.log(req.email)
  res.redirect('http://localhost:5173/')

}
/**
 * Passport verify callback for GoogleStrategy.
 * Reference for `oAuth.service.js`:
 *   passport.use(new GoogleStrategy({ clientID, clientSecret, callbackURL },
 *     authController.googleVerifyCallback))
 *
 * Steps: 1) already linked via googleId -> return it
 *        2) same email exists (local signup) -> link googleId + avatar
 *        3) new user -> create OAuth user (dummy contact/password satisfy
 *           current required schema until model adds googleId/avatar/provider)
 */
const googleVerifyCallback = async (
  accessToken,
  refreshToken,
  profile,
  done,
) => {
  try {
    const email = profile?.emails?.[0]?.value?.toLowerCase();
    if (!email) {
      return done(new Error("Google profile has no email"), null);
    }

    // 1) Already linked via Google before
    let user = await userData.findOne({ googleId: profile.id });
    if (user) return done(null, user);

    // 2) Same email signed up locally before -> link accounts
    user = await userData.findOne({ email });
    if (user) {
      user.googleId = profile.id;
      // These fields are stripped by current strict schema until you add
      // them to user.model.js, but harmless to set now (forward-compatible)
      user.avatar = profile?.photos?.[0]?.value;
      user.provider = "google";
      await user.save({ validateBeforeSave: false });
      return done(null, user);
    }

    // 3) Brand new Google user
    user = await userData.create({
      googleId: profile.id,
      email,
      fullname: profile.displayName || email.split("@")[0],
      avatar: profile?.photos?.[0]?.value,
      provider: "google",
      role: "buyer",
      // Placeholders to satisfy current `required: true` schema.
      // Remove once password/contact become conditional in the model.
      contact: "0000000000",
      password: crypto.randomBytes(32).toString("hex"),
    });
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
};

/**
 * Runs after `passport.authenticate('google', { session: false })`.
 * Expects `req.user` to be set from googleVerifyCallback above.
 * Issues your JWT, sets httpOnly cookie, redirects to Vite frontend.
 */
const googleCallbackController = async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.redirect(`${config.CLIENT_URL}/login?error=oauth_failed`);
  }
  const token = issueToken(user);
  setTokenCookie(res, token);
  // Cookie is httpOnly (frontend can't read it), so also pass token in query
  // for memory storage. Frontend route: /auth/success?token=...
  return res.redirect(`${config.CLIENT_URL}/auth/success?token=${token}`);
};

export { signinController, signupController, googleVerifyCallback, googleCallbackController };

export default {
  signinController,
  signupController,
  googleVerifyCallback,
  googleCallbackController,
};
