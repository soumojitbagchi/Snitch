import express from "express";
import {
  createOrder,
  verifyPayment,
  getOrderStatus,
} from "../controller/payment.controller.js";

const paymentRouter = express.Router();

paymentRouter.post("/create-order", createOrder);
paymentRouter.post("/verify-payment", verifyPayment);
paymentRouter.post("/verify", verifyPayment);
paymentRouter.get("/order-status/:order_id", getOrderStatus);

export default paymentRouter;
