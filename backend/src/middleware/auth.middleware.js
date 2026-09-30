import jwt from "jsonwebtoken";
import userData from "../model/user.model.js";
import { config } from "../config/config.js";

export const authMiddleware = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  if (!accessToken) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
    });
  }
  try {
    const decoded = jwt.verify(accessToken, config.JWT_KEY);
    const legitUser = await userData.findById(decoded.id).select("fullname email contact role avatar addresses preferences.theme");
    if (!legitUser) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }
    req.client = legitUser;
    if (legitUser.role === "buyer") {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }
    req.user = legitUser;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
    });
  }
};


// Any logged-in user, regardless of role (e.g. self-service account actions
// like upgrading buyer -> seller, which buyers must be able to reach).
// Uses the accessToken (1h, JWT_KEY). Expired accessTokens are
export const authenticate = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  if (!accessToken) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
    });
  }
  try {
    const decoded = jwt.verify(accessToken, config.JWT_KEY);
    const legitUser = await userData.findById(decoded.id).select("fullname email contact role avatar addresses preferences.theme");
    if (!legitUser) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }
    req.user = legitUser;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
    });
  }
};
