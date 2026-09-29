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
    updateVariant,
    bulkDeleteProducts,
    toggleSale,
    addToWishlistController,
    removeFromWishlistController,
    viewProductsWishlistController,
    aiSuggestionController,
} from "../controller/product.controller.js";
import { authMiddleware, authenticate } from "../middleware/auth.middleware.js";
import productValidator from "../validation/product.validation.js";
import multer from 'multer'

const productRouter = Router();

const fileFilter = (req, file, cb) => {
    const allowedFile = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
    ];
    if (!allowedFile.includes(file.mimetype)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
}

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter,
})


productRouter.post("/create", authMiddleware, upload.array('images', 5), createProduct);
productRouter.put("/update-image/:id", authMiddleware, upload.array('images', 5), updateProductImage);
productRouter.put("/update-price/:id", authMiddleware, upload.none(), updatePriceInfo);
productRouter.put("/update-title/:id", authMiddleware, upload.none(), updateTitle);
productRouter.put("/update-description/:id", authMiddleware, upload.none(), updateDescription);
productRouter.put("/update-variant/:id", authMiddleware, upload.none(), updateVariant);
productRouter.put("/sale/:id", authMiddleware, upload.none(), toggleSale);
productRouter.post("/bulk-delete", authMiddleware, bulkDeleteProducts);
productRouter.get("/details/:productId", detailsProduct);
productRouter.post("/add-wishlist", authenticate, addToWishlistController);
productRouter.get("/get-wishlist", authenticate, viewProductsWishlistController);
productRouter.delete("/remove-wishlist", authenticate, removeFromWishlistController);
productRouter.delete("/:id", authMiddleware, deleteProduct);
productRouter.get("/all", allProducts);
productRouter.get("/all-by-seller", authMiddleware, allProductsBySeller);
productRouter.get("/search", productValidator.validSearch, searchProduct);
productRouter.get("/ai-suggestion", authenticate, aiSuggestionController);

productRouter.use((err, req, res, next) => {
    if (err instanceof multer.MulterError || err?.message === 'Only image files are allowed!') {
        return res.status(400).json({ message: err.message, success: false });
    }
    next(err);
});

export default productRouter;
