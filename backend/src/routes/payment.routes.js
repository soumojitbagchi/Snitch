import express from "express";
import {
  createOrder,
  verifyPayment,
  getOrderStatus,
} from "../controller/payment.controller.js";
import { getMyOrders, getMyOrder } from "../controller/order.controller.js";
import { validateCouponController } from "../controller/coupon.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const paymentRouter = express.Router();

paymentRouter.post("/create-order", authenticate, createOrder);
paymentRouter.post("/verify-payment", authenticate, verifyPayment);
paymentRouter.post("/verify", authenticate, verifyPayment);
paymentRouter.get("/order-status/:order_id", authenticate, getOrderStatus);
paymentRouter.get("/my-orders", authenticate, getMyOrders);
paymentRouter.get("/my-orders/:id", authenticate, getMyOrder);
paymentRouter.post("/validate-token", authenticate, validateCouponController);

export default paymentRouter;
