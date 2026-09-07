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
  const isMatch = await bcrypt.compare(password, isUserExists.password)
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      error: "wrong credentials",
    });
  }
  const token = issueToken(isUserExists);
  setTokenCookie(res, token);
  res.status(200).json({ token, success: true ,user:isUserExists });
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
    user,
  });
};
const googleCallback = async (req, res) => {

  console.log(req.email)
  res.redirect('http://localhost:5173/')

}
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

    let user = await userData.findOne({ googleId: profile.id });
    if (user) return done(null, user);

    user = await userData.findOne({ email });
    if (user) {
      user.googleId = profile.id;
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
      password: crypto.randomBytes(32).toString("hex"),
    });
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
};

const googleCallbackController = async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.redirect(`${config.CLIENT_URL}/login?error=oauth_failed`);
  }
  const token = issueToken(user);
  setTokenCookie(res, token);
  return res.redirect(`${config.CLIENT_URL}/auth/success?token=${token}`);
};

export { signinController, signupController, googleVerifyCallback, googleCallbackController };

export default {
  signinController,
  signupController,
  googleVerifyCallback,
  googleCallbackController,
};
