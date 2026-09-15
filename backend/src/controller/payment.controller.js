import crypto from "node:crypto";
import razorpayInstance from "../service/razorpay.service.js";
import { config } from "../config/config.js";
import Payment from "../model/payment.model.js";

async function executeWithRetry(apiFn, retries = 2, delayMs = 300) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await apiFn();
    } catch (err) {
      lastError = err;
      const status = err?.statusCode || err?.status;
      if (status && status < 500 && status !== 408) {
        throw err;
      }
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * Math.pow(2, attempt)));
      }
    }
  }
  throw lastError;
}

export const createOrder = async (req, res) => {
  if (!config.RAZORPAY_KEY_ID || !config.RAZORPAY_KEY_SECRET) {
    console.error("Payment provider misconfigured: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing.");
    return res.status(500).json({ error: "payment provider misconfigured" });
  }

  const { amount, currency = "INR", receipt, notes = {}, isSubunits = false } = req.body;

  if (amount === undefined || amount === null) {
    return res.status(400).json({ error: "amount is required" });
  }

  const numericAmount = Number(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ error: "amount must be a valid positive number" });
  }

  const amountInSubunits = isSubunits ? Math.round(numericAmount) : Math.round(numericAmount * 100);
  if (amountInSubunits < 100) {
    return res.status(400).json({ error: "amount must be at least 100 subunits (1.00)" });
  }

  const upperCurrency = String(currency).trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(upperCurrency)) {
    return res.status(400).json({ error: "currency must be a valid 3-letter ISO 4217 code" });
  }

  const safeReceipt = String(receipt || `rcpt_${Date.now()}`).slice(0, 40);

  try {
    const razorpayOrder = await executeWithRetry(() =>
      razorpayInstance.orders.create({
        amount: amountInSubunits,
        currency: upperCurrency,
        receipt: safeReceipt,
        notes: {
          ...notes,
          order_id: notes?.order_id || req.body.orderId || safeReceipt,
        },
      })
    );

    if (!razorpayOrder?.id) {
      return res.status(502).json({ error: "Payment gateway response contract mismatch" });
    }

    try {
      await Payment.create({
        user: req.user?._id || null,
        amount: amountInSubunits / 100,
        currency: upperCurrency,
        orderId: razorpayOrder.id,
        paymentStatus: "pending",
      });
    } catch (dbErr) {
      console.error("Database save warning during createOrder:", dbErr.message);
    }

    return res.status(200).json({
      success: true,
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key_id: config.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    const status = err?.statusCode || err?.status || 500;
    const description = err?.error?.description || err?.message || "Order creation failed";

    if (status === 401) {
      console.error("Payment gateway unauthorized: check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET");
      return res.status(500).json({ error: "payment provider misconfigured" });
    }

    if (status >= 400 && status < 500) {
      return res.status(400).json({ error: description });
    }

    console.error("Razorpay order creation error:", description);
    return res.status(503).json({ error: "Payment gateway temporarily unavailable. Please retry." });
  }
};

export const verifyPayment = async (req, res) => {
  if (!config.RAZORPAY_KEY_SECRET) {
    console.error("Payment provider misconfigured: RAZORPAY_KEY_SECRET is missing.");
    return res.status(500).json({ error: "payment provider misconfigured" });
  }

  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return res.status(400).json({
      success: false,
      error: "Missing required verification fields: razorpay_payment_id, razorpay_order_id, razorpay_signature",
    });
  }

  const expectedSignature = crypto
    .createHmac("sha256", config.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature, "utf-8");
  const receivedBuffer = Buffer.from(razorpay_signature, "utf-8");

  const isSignatureValid =
    expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

  if (!isSignatureValid) {
    return res.status(400).json({
      success: false,
      error: "Invalid payment signature",
    });
  }

  try {
    const existingPayment = await Payment.findOne({ orderId: razorpay_order_id });

    if (existingPayment) {
      if (existingPayment.paymentStatus === "completed") {
        return res.status(200).json({
          success: true,
          message: "Payment already verified",
          paymentId: existingPayment.paymentId,
          orderId: razorpay_order_id,
        });
      }

      existingPayment.paymentId = razorpay_payment_id;
      existingPayment.signature = razorpay_signature;
      existingPayment.paymentStatus = "completed";
      await existingPayment.save();
    } else {
      await Payment.create({
        user: req.user?._id || null,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        amount: req.body.amount || 0,
        currency: req.body.currency || "INR",
        paymentStatus: "completed",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });
  } catch (err) {
    console.error("Payment verification persistence error:", err.message);
    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });
  }
};

export const getOrderStatus = async (req, res) => {
  const { order_id } = req.params;

  if (!order_id) {
    return res.status(400).json({ error: "order_id parameter is required" });
  }

  try {
    const payments = await razorpayInstance.orders.fetchPayments(order_id);
    return res.status(200).json({
      success: true,
      order_id,
      payments,
    });
  } catch (err) {
    const status = err?.statusCode || 500;
    const description = err?.error?.description || err?.message || "Failed to fetch order payments";
    return res.status(status >= 400 && status < 500 ? 400 : 500).json({ error: description });
  }
};
