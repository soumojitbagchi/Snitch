import userData from "../model/user.model.js";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendWelcomeEmail } from "../service/email.service.js";

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
    maxAge: 60 * 60 * 1000,
    path: "/",
  });
};

const clearTokenCookie = (res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
};

const publicUser = (user) => ({
  id: user._id,
  fullname: user.fullname,
  email: user.email,
  contact: user.contact,
  role: user.role,
  avatar: user.avatar,
  addresses: user.addresses,
});

const notifyWelcome = (user) => {
  sendWelcomeEmail({ name: user.fullname, email: user.email })
    .catch((error) => console.error("Welcome email failed:", error.message));
};

const signinController = async (req, res) => {
  const email = req.body.email.trim().toLowerCase();
  const { password } = req.body;
  const isUserExists = await userData.findOne({ email }).select("+password");
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
  res.status(200).json({ success: true, user: publicUser(isUserExists) });
};

const signupController = async (req, res) => {
  const email = req.body.email.trim().toLowerCase();
  const { password, fullname, contact, role } = req.body;
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
    role: role === "seller" ? "seller" : "buyer",
    fullname: fullname.trim(),
  });
  const token = issueToken(user);
  setTokenCookie(res, token);
  notifyWelcome(user);
  res.status(201).json({
    success: true,
    user: publicUser(user),
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
    user.$locals.isNewAccount = true;
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
  if (user.$locals?.isNewAccount) notifyWelcome(user);
  return res.redirect(`${config.CLIENT_URL}/auth/success`);
};

const logoutController = (req, res) => {
  clearTokenCookie(res);
  return res.status(204).send();
};

const getMe = async (req, res) => {
  const user = req.user;
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

const updateProfileController = async (req, res) => {
  const { fullname, contact, addresses } = req.body;

  if (fullname !== undefined) {
    if (typeof fullname !== "string" || !fullname.trim()) {
      return res.status(400).json({ success: false, error: "Full name is required." });
    }
    req.user.fullname = fullname.trim();
  }

  if (contact !== undefined) {
    if (typeof contact !== "string") {
      return res.status(400).json({ success: false, error: "Contact must be a valid phone number." });
    }
    req.user.contact = contact.trim();
  }

  if (addresses !== undefined) {
    if (!Array.isArray(addresses) || addresses.length > 5) {
      return res.status(400).json({ success: false, error: "You can save up to five addresses." });
    }

    const requiredAddressFields = ["recipientName", "line1", "city", "state", "postalCode"];
    const isValidAddress = addresses.every((address) =>
      address && typeof address === "object" && requiredAddressFields.every(
        (field) => typeof address[field] === "string" && address[field].trim(),
      ),
    );
    if (!isValidAddress) {
      return res.status(400).json({ success: false, error: "Complete all required address fields." });
    }

    req.user.addresses = addresses.map((address, index) => ({
      label: typeof address.label === "string" && address.label.trim() ? address.label.trim() : "Home",
      recipientName: address.recipientName.trim(),
      phone: typeof address.phone === "string" ? address.phone.trim() : "",
      line1: address.line1.trim(),
      line2: typeof address.line2 === "string" ? address.line2.trim() : "",
      city: address.city.trim(),
      state: address.state.trim(),
      postalCode: address.postalCode.trim(),
      country: typeof address.country === "string" && address.country.trim() ? address.country.trim() : "India",
      isDefault: index === 0,
    }));
  }

  await req.user.save();
  return res.status(200).json({ success: true, user: publicUser(req.user) });
};



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

export { signinController, signupController, googleVerifyCallback, googleCallbackController, logoutController, getMe, updateProfileController, updateRoleController };

export default {
  signinController,
  signupController,
  googleVerifyCallback,
  googleCallbackController,
  logoutController,
  getMe,
  updateProfileController,
  updateRoleController
};
