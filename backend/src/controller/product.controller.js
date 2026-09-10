import Product from "../model/product.model.js";
import uploadFiles from "../service/imageKit.service.js";

export const createProduct = async (req, res) => {
    try {
        const { title, description, priceAmount, priceCurrency } = req.body;
        const seller = req.user;
        const files = await Promise.all(
            req.files.map(file => {
                return uploadFiles({ buffer: file.buffer, fileName: file.originalname });
            })
        );
        const product = await Product.create({
            title, description, images: files, price: {
                amount: priceAmount,
                currency: priceCurrency || "INR"
            }, seller
        });
        res.status(201).json({ message: "Product created successfully", product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const updatePriceInfo= async(req, res) => {
    const user = req.user;
    const {priceAmount} = req.body;
    const data = await Product.findOne({ _id: req.params.id, seller: user._id });
    if(!data) {
        return res.status(404).json({ message: "Product not found" });
    }
    data.price.basePrice = priceAmount;
    await data.save();
    res.status(200).json({ message: "Price updated successfully", data });
    
}
const updateTitle = async (req,res)=>{
    const user = req.user
    const {title} = req.body
    const data = await Product.findOne({ _id: req.params.id, seller: user._id });
    if(!data) {
        return res.status(404).json({ message: "Product not found" });
    }
    data.title = title;
    await data.save();
    res.status(200).json({ message: "Title updated successfully", data });
}
const updateDescription = async (req,res)=>{
    const user = req.user
    const {description} = req.body
    const data = await Product.findOne({ _id: req.params.id, seller: user._id });
    if(!data) {
        return res.status(404).json({ message: "Product not found" });
    }
    data.description = description;
    await data.save();
    res.status(200).json({ message: "Description updated successfully", data });
}
const updateProductImage = async (req,res)=>{
    const user = req.user
    const file = await Promise.all(
        uploadFiles()
    )
    const data = await Product.findOne({ _id: req.params.id, seller: user._id });
    if(!data) {
        return res.status(404).json({ message: "Product not found" });
    }
    data.description = description;
    await data.save();
    res.status(200).json({ message: "Description updated successfully", data });
}
