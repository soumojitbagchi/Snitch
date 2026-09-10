import { Router } from "express";
import { createProduct , updateProductImage, updatePriceInfo, updateTitle, updateDescription, allProducts, allProductsBySeller } from "../controller/product.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import multer from 'multer'

const productRouter = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }
})


productRouter.post("/create", authMiddleware, upload.array('images', 5), createProduct);
productRouter.put("/update-image/:id", authMiddleware, upload.array('images',5), updateProductImage);
productRouter.put("/update-price/:id", authMiddleware, updatePriceInfo);
productRouter.put("/update-title/:id", authMiddleware, updateTitle);
productRouter.put("/update-description/:id", authMiddleware, updateDescription);
productRouter.get("/all", authMiddleware, allProducts);
productRouter.get("/all-by-seller", authMiddleware, allProductsBySeller);

export default productRouter;