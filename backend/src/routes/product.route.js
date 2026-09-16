import { Router } from "express";
import {
    createProduct,
    updateProductImage,
    updatePriceInfo,
    updateTitle,
    updateDescription,
    allProducts,
    allProductsBySeller,
    deleteProduct,
    detailsProduct,
    searchProduct,
} from "../controller/product.controller.js";
import { authMiddleware, authenticate } from "../middleware/auth.middleware.js";
import productValidator from "../validation/product.validation.js";
import multer from 'multer'

const productRouter = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },

})


productRouter.post("/create", authMiddleware, upload.array('images', 5), createProduct);
productRouter.put("/update-image/:id", authMiddleware, upload.array('images', 5), updateProductImage);
productRouter.put("/update-price/:id", authMiddleware, upload.none(), updatePriceInfo);
productRouter.put("/update-title/:id", authMiddleware, upload.none(), updateTitle);
productRouter.put("/update-description/:id", authMiddleware, upload.none(), updateDescription);
productRouter.get("/details/:productId", authenticate, detailsProduct);
productRouter.delete("/:id", authMiddleware, deleteProduct);
productRouter.get("/all", authenticate, allProducts);
productRouter.get("/all-by-seller", authMiddleware, allProductsBySeller);
productRouter.get("/search", productValidator.validSearch, authenticate, searchProduct);

productRouter.use((err, req, res, next) => {
    if (err instanceof multer.MulterError || err?.message === 'Only image files are allowed!') {
        return res.status(400).json({ message: err.message, success: false });
    }
    next(err);
});

export default productRouter;
