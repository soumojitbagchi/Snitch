import Product from "../model/product.model.js";
import uploadFiles from "../service/imageKit.service.js";

export const createProduct = async (req, res) => {
    try {
        const { title, description, priceAmount, priceCurrency } = req.body;
        const seller = req.user;
        const files = await Promise.all(
            req.files.map((file) => {
                return uploadFiles({
                    buffer: file.buffer,
                    fileName: file.originalname,
                });
            }),
        );
        const product = await Product.create({
            title,
            description,
            images: files,
            verient: {
                price:{
                    basePrice: priceAmount,
                    currency: priceCurrency || "INR",
                }
            },
            seller,
        });
        res.status(201).json({ message: "Product created successfully", product, success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};
export const updatePriceInfo = async (req, res) => {
    try {

        const user = req.user;
        const { priceAmount } = req.body;
        const data = await Product.findOne({ _id: req.params.id, seller: user._id });
        if (!data) {
            return res.status(404).json({ message: "Product not found", success: false });
        }
        data.verient.price.basePrice = priceAmount;
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
        const files = await Promise.all(
            req.files.map((file) => {
                return uploadFiles({ buffer: file.buffer, fileName: file.originalname })
            }),
        );
        const data = await Product.findOne({ _id: req.params.id, seller: user._id });
        if (!data) {
            return res.status(404).json({ message: "Product not found", success: false });
        }
        data.images = files
        await data.save();
        res.status(200).json({ message: "Description updated successfully", data, success: true });
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