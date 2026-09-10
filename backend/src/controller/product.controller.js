import Product from "../model/product.model.js";

export const createProduct = async (req, res) => {
    try {
        const { title, description, images, verient } = req.body;
        const product = await Product.create({ title, description, images, verient });
        res.status(201).json({ message: "Product created successfully", product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
