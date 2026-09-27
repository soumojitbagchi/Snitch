import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { config } from "../config/config.js";
import userData from "../model/user.model.js";
import Product from "../model/product.model.js";
import { aiSuggestion } from "../service/ai.service.js";

const getToken = (socket) => {
  if (socket.handshake?.auth?.token) return socket.handshake.auth.token;
  const cookie = socket.handshake?.headers?.cookie || "";
  const m = cookie.match(/(?:^|;\s*)accessToken=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
};

const getUserId = async (socket) => {
  const token = getToken(socket);
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, config.JWT_KEY);
    const user = await userData.findById(decoded.id).select("_id").lean();
    return user ? String(user._id) : null;
  } catch {
    return null;
  }
};

export const attachAiSocket = (httpServer) => {
  const socketOrigins = [config.CLIENT_URL, config.BACKEND_URL].filter(
    (origin, index, all) => origin && all.indexOf(origin) === index,
  );
  const io = new Server(httpServer, {
    cors: { origin: socketOrigins, credentials: true },
  });

  io.on("connection", (socket) => {
    const cancelled = new Set();

    socket.on("ai:suggest:unsubscribe", ({ requestId } = {}) => {
      if (requestId) cancelled.add(requestId);
    });

    socket.on("disconnect", () => cancelled.clear());

    socket.on("ai:suggest:subscribe", async ({ productId, requestId } = {}) => {
      const id = requestId || `${Date.now()}`;
      const t0 = Date.now();
      socket.emit("ai:suggest:started", { requestId: id, productId: productId || null });

      const userId = await getUserId(socket);
      if (!userId) {
        socket.emit("ai:suggest:error", { requestId: id, status: 401, message: "Unauthorized" });
        return;
      }
      if (productId && !mongoose.isValidObjectId(productId)) {
        socket.emit("ai:suggest:error", { requestId: id, status: 400, message: "Invalid productId" });
        return;
      }

      try {
        const result = await aiSuggestion(userId, productId || undefined);
        const recs = Array.isArray(result?.recommendations) ? result.recommendations.slice(0, 8) : [];
        let sent = 0;
        for (let i = 0; i < recs.length; i++) {
          if (cancelled.has(id)) return;
          const rec = recs[i];
          if (!rec?.productId || rec.productId === productId) continue;
          let item = null;
          try {
            const doc = mongoose.isValidObjectId(rec.productId)
              ? await Product.findById(rec.productId).lean()
              : null;
            if (doc) item = { ...doc, _id: String(doc._id), recommendationMeta: rec };
            else if (rec.productName || rec.productImage) {
              item = {
                _id: rec.productId,
                title: rec.productName || "Recommended product",
                images: rec.productImage ? [{ url: rec.productImage }] : [],
                description: rec.reason || "",
                variant: [],
                recommendationMeta: rec,
              };
            }
          } catch {
            item = null;
          }
          if (!item) continue;
          if (cancelled.has(id)) return;
          sent += 1;
          socket.emit("ai:suggest:item", { requestId: id, index: sent - 1, item });
        }
        if (!cancelled.has(id)) {
          socket.emit("ai:suggest:done", { requestId: id, count: sent, totalMs: Date.now() - t0 });
        }
      } catch (err) {
        if (cancelled.has(id)) return;
        socket.emit("ai:suggest:error", {
          requestId: id,
          status: 503,
          message: err?.message || "Recommendation service is unavailable",
        });
      }
    });
  });

  return io;
};
