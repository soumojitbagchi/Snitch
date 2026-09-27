import Product from "../model/product.model.js";
import Wishlist from "../model/wishlist.model.js";
import mongoose from "mongoose";
import uploadFiles from "../service/imageKit.service.js";
import { generateProductDescription, aiSuggestion } from "../service/ai.service.js";

export const createProduct = async (req, res) => {
    try {
        const { title, description, priceAmount, priceCurrency, size, color, stockAmount } = req.body;
        const seller = req.user;
        let generatedDescription;
        try {
            generatedDescription = await generateProductDescription({
                title,
                sellerDescription: description,
                priceAmount,
                priceCurrency,
                size,
                color,
                stockAmount,
            });
        } catch (error) {
            console.error("Product description generation failed:", error.message);
            return res.status(503).json({
                message: "Product description service is unavailable",
                success: false,
            });
        }
        const uploads = req.files ?? [];
        const files = await Promise.all(
            uploads.map((file) => {
                return uploadFiles({
                    buffer: file.buffer,
                    fileName: file.originalname,
                    mimeType: file.mimetype,
                });
            }),
        );
        const product = await Product.create({
            title,
            description: generatedDescription,
            images: files.map((f) => ({ url: f.url })),
            variant: [
                {
                    images: [],
                    price: {
                        basePrice: Number(priceAmount) || 0,
                        currency: priceCurrency || "INR",
                    },
                    stock: Number(stockAmount) || 0,
                    attributes: {
                        ...(size ? { size } : {}),
                        ...(color ? { color } : {}),
                    },

                },
            ],
            seller,
        });
        res.status(201).json({ message: "Product created successfully", product, success: true });
    } catch (error) {
        if (error?.name === "ValidationError") {
            return res.status(400).json({ message: error.message, success: false });
        }
        res.status(500).json({ message: error.message, success: false });
    }
};
export const updatePriceInfo = async (req, res) => {
    try {

        const user = req.user;
        const { priceAmount, variantIndex } = req.body;
        const data = await Product.findOne({ _id: req.params.id, seller: user._id });
        if (!data) {
            return res.status(404).json({ message: "Product not found", success: false });
        }
        const index = Number(variantIndex) || 0;
        if (!data.variant[index]) {
            return res.status(404).json({ message: "Variant not found", success: false });
        }
        const amount = Number(priceAmount);
        if (!Number.isFinite(amount) || amount < 0) {
            return res.status(400).json({ message: "Price must be a non-negative number", success: false });
        }
        data.variant[index].price.basePrice = amount;
        await data.save();
        res.status(200).json({ message: "Price updated successfully", data, success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};
export const updateTitle = async (req, res) => {
    try {
        const user = req.user;
        const { title } = req.body;
        const data = await Product.findOne({ _id: req.params.id, seller: user._id });
        if (!data) {
            return res.status(404).json({ message: "Product not found", success: false });
        }
        data.title = title;
        await data.save();
        res.status(200).json({ message: "Title updated successfully", data, success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};
export const updateDescription = async (req, res) => {
    try {
        const user = req.user;
        const { description } = req.body;
        const data = await Product.findOne({ _id: req.params.id, seller: user._id });
        if (!data) {
            return res.status(404).json({ message: "Product not found", success: false });
        }
        data.description = description;
        await data.save();
        res.status(200).json({ message: "Description updated successfully", data, success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};
export const updateProductImage = async (req, res) => {
    try {

        const user = req.user;
        const uploads = req.files || [];
        if (uploads.length === 0) {
            return res.status(400).json({ message: "No files uploaded", success: false });
        }
        const files = await Promise.all(
            uploads.map((file) => {
                return uploadFiles({ buffer: file.buffer, fileName: file.originalname, mimeType: file.mimetype })
            }),
        );
        const data = await Product.findOne({ _id: req.params.id, seller: user._id });
        if (!data) {
            return res.status(404).json({ message: "Product not found", success: false });
        }
        data.images = files.map((f) => ({ url: f.url }))
        await data.save();
        res.status(200).json({ message: "Images updated successfully", data, success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};
export const allProducts = async (req, res) => {
    try {
        const data = await Product.find();
        res.status(200).json({ message: "Products fetched successfully", data, success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};
export const allProductsBySeller = async (req, res) => {
    try {
        const user = req.user;
        const data = await Product.find({ seller: user._id });
        res.status(200).json({ message: "Products fetched successfully", data, success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};
export const deleteProduct = async (req, res) => {
    try {
        const user = req.user;
        const data = await Product.findOneAndDelete({ _id: req.params.id, seller: user._id });
        if (!data) {
            return res.status(404).json({ message: "Product not found", success: false });
        }
        res.status(200).json({ message: "Product deleted successfully", success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};
export const detailsProduct = async (req, res) => {
    try {
        const details = await Product.findById(req.params.productId);

        if (!details) {
            return res.status(404).json({ message: "Product not found", success: false });
        }

        return res.status(200).json({
            message: "Product details fetched successfully",
            data: details,
            success: true,
        });
    } catch (error) {
        if (error?.name === "CastError") {
            return res.status(404).json({ message: "Product not found", success: false });
        }

        return res.status(500).json({ message: error.message, success: false });
    }
};
export const searchProduct = async (req, res) => {
    const query = String(req.query.query || "").trim();
    try {
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const data = await Product.find({ title: { $regex: escapedQuery, $options: "i" } });
        return res.status(200).json({ message: "Products fetched successfully", data, success: true });
    } catch (error) {
        return res.status(500).json({ message: error.message, success: false });
    }
}

export const addToWishlistController = async (req, res) => {
    try {
        const { productId } = req.body;
        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({ message: "Invalid product id", success: false });
        }

        const productExists = await Product.exists({ _id: productId });
        if (!productExists) {
            return res.status(404).json({ message: "Product not found", success: false });
        }

        const userId = req.user._id;
        const updateWishlist = () => Wishlist.updateOne(
            { user: userId },
            { $addToSet: { product: productId } },
            { upsert: true, runValidators: true },
        );

        let updateResult;
        try {
            updateResult = await updateWishlist();
        } catch (error) {
            //create the unique per-user document.
            if (error?.code !== 11000) throw error;
            updateResult = await Wishlist.updateOne(
                { user: userId },
                { $addToSet: { product: productId } },
                { runValidators: true },
            );
        }

        const alreadyExists = updateResult.modifiedCount === 0 && updateResult.upsertedCount === 0;
        const wishlist = await Wishlist.findOne({ user: userId });
        return res.status(200).json({
            message: alreadyExists ? "Product already in wishlist" : "Product added to wishlist",
            data: wishlist,
            success: true,
            alreadyExists,
        });
    } catch (error) {
        console.error("Failed to add product to wishlist:", error);
        return res.status(500).json({ message: "Unable to update wishlist", success: false });
    }
}

export const removeFromWishlistController = async (req, res) => {
    try {
        const { productId } = req.body;
        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({ message: "Invalid product id", success: false });
        }

        const updatedWishlist = await Wishlist.findOneAndUpdate(
            { user: req.user._id },
            { $pull: { product: productId } },
            { new: true },
        );

        return res.status(200).json({
            message: updatedWishlist ? "Product removed from wishlist" : "Product was not in wishlist",
            data: updatedWishlist,
            success: true,
        });
    } catch (error) {
        console.error("Failed to remove product from wishlist:", error);
        return res.status(500).json({ message: "Unable to remove product from wishlist", success: false });
    }
}
export const viewProductsWishlistController = async (req, res) => {
    const userWishlist = await Wishlist.findOne({ user: req.user._id })
    try {
        if (!userWishlist) {
            return res.status(404).json({ message: "wishlist not found", success: false })
        }
        if (userWishlist.product.length === 0) {
            return res.status(200).json({
                products: [],
                message: "add product to wishlist",
                success: true,
            })
        }
        const products = await Promise.all(userWishlist.product.map(async (item) => {
            return await Product.findById(item)
        }))
        return res.status(200).json({
            products: products,
            success: true,
        })

    } catch (error) {
        throw new Error
    }
}

export const aiSuggestionController = async (req, res) => {
    try {
        const userId = String(req.user._id);
        // Product page context: GET /api/product/ai-suggestion?productId=<id>
        const currentProductId = req.query?.productId || req.body?.productId;
        if (currentProductId && !mongoose.isValidObjectId(currentProductId)) {
            return res.status(400).json({ message: "Invalid productId", success: false });
        }
        const suggestions = await aiSuggestion(userId, currentProductId);
        return res.status(200).json({
            suggestions,
            success: true,
        });
    } catch (error) {
        console.error("AI suggestion failed:", error?.stack || error?.message || error);
        return res.status(503).json({
            message: "Recommendation service is unavailable",
            success: false,
        });
    }
}

