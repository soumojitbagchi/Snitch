import userData from "../model/user.model.js";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { warn } from "console";

const issueToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      fullname: user.fullname,
      email: user.email,
    },
    config.JWT_KEY,
  );
};

const setTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 1000,
    path: "/",
  });
};

const signinController = async (req, res) => {
  const { email, password } = req.body;
  const isUserExists = await userData.findOne({ email });
  if (!isUserExists) {
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
  res.status(200).json({ token, success: true, user: isUserExists });
};

const signupController = async (req, res) => {
  const { email, password, fullname, contact, role } = req.body;
  const isUserExists = await userData.findOne({ email });
  const hash = await bcrypt.hash(password, 10)
  if (isUserExists) {
    return res.status(409).json({
      success: false,
      error: "user already registered, please signin",
    });
  }
  const user = await userData.create({
    email,
    password: hash,
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
const googleVerifyCallback = async (
  accessToken,
  refreshToken,
  profile,
  done,
) => {
  try {
    const email = profile?.emails?.[0]?.value?.toLowerCase();
    if (!email) {
      console.error("[googleVerify] no email in profile:", profile?.id);
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
    console.error("[googleVerify] DB error:", err?.message);
    return done(err, null);
  }
};

const googleCallbackController = async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.redirect(`${config.CLIENT_URL}/signin?error=oauth`);
  }
  const token = issueToken(user);
  setTokenCookie(res, token);
  return res.redirect(`${config.CLIENT_URL}/auth/success?token=${token}`);
};

const getMe = async (req, res) => {
  const user = req.client;
  if (!user) {
    return res.status(401).json({
      warn: "User not found",
    })
  }
  return res.status(200).json({
    success: true,
    user,
  });
}

const updateRoleController = async (req, res) => {
  const { role } = req.body;
  if (role !== "seller") {
    return res.status(400).json({
      success: false,
      error: "Only upgrade to 'seller' is allowed.",
    });
  }
  if (req.user.role === "seller") {
    return res.status(200).json({
      success: true,
      message: "Already a seller.",
      user: req.user,
    });
  }
  req.user.role = "seller";
  await req.user.save();
  return res.status(200).json({
    success: true,
    message: "Store opened. You are now a seller.",
    user: req.user,
  });
};

export { signinController, signupController, googleVerifyCallback, googleCallbackController, getMe, updateRoleController };

export default {
  signinController,
  signupController,
  googleVerifyCallback,
  googleCallbackController,
  getMe,
  updateRoleController
};
