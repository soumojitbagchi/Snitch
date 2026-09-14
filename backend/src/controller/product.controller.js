import Product from "../model/product.model.js";
import uploadFiles from "../service/imageKit.service.js";

export const createProduct = async (req, res) => {
    try {
        const { title, description, priceAmount, priceCurrency, size, color, stockAmount } = req.body;
        const seller = req.user;
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
            description,
            images: files.map((f) => ({ url: f.url })),
            verient: [
                {
                    images: [],
                    price: {
                        basePrice: Number(priceAmount) || 0,
                        currency: priceCurrency || "INR",
                    },
                    stock: {
                        basePrice: Number(stockAmount) || 0,
                        currency: priceCurrency || "INR",
                    },
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
        if (!data.verient[index]) {
            return res.status(404).json({ message: "Variant not found", success: false });
        }
        data.verient[index].price.basePrice = Number(priceAmount);
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
