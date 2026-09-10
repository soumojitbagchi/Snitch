import { Router } from "express";
import { createProduct } from "../controller/product.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import multer from 'multer'

const productRouter = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }
})


productRouter.post("/create", authMiddleware, upload.array('images', 5), createProduct);

export default productRouter;