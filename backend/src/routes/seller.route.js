import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
    listSellerOrders,
    getSellerOrder,
    updateOrderStatus,
    getSellerStats,
    getSellerSettlements,
    getAttentionFeed,
    getLowStock,
    restockVariant,
    sendStockAlert,
    getVariantVelocity,
    listSellerReviews,
    replyReview,
    listSellerReturns,
    decideReturn,
    listSellerCoupons,
    createSellerCoupon,
    deleteSellerCoupon,
} from "../controller/seller.controller.js";

const sellerRouter = Router();

sellerRouter.use(authMiddleware);

sellerRouter.get("/orders", listSellerOrders);
sellerRouter.get("/orders/:paymentId", getSellerOrder);
sellerRouter.patch("/orders/:paymentId/status", updateOrderStatus);

sellerRouter.get("/stats", getSellerStats);
sellerRouter.get("/settlements", getSellerSettlements);
sellerRouter.get("/attention", getAttentionFeed);

sellerRouter.get("/inventory/low-stock", getLowStock);
sellerRouter.get("/inventory/velocity", getVariantVelocity);
sellerRouter.post("/inventory/restock", restockVariant);
sellerRouter.post("/inventory/alert", sendStockAlert);

sellerRouter.get("/reviews", listSellerReviews);
sellerRouter.patch("/reviews/:id/reply", replyReview);

sellerRouter.get("/returns", listSellerReturns);
sellerRouter.patch("/returns/:id", decideReturn);

sellerRouter.get("/coupons", listSellerCoupons);
sellerRouter.post("/coupons", createSellerCoupon);
sellerRouter.delete("/coupons/:code", deleteSellerCoupon);

export default sellerRouter;
