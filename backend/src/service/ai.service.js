import { config } from "../config/config.js";
import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const mistralAI = new ChatMistralAI({
    apiKey: config.MISTRAL_API_KEY,
    model: config.MISTRAL_MODEL,
    temperature: 0.4,
});

const responseText = (response) => {
    if (typeof response?.content === "string") return response.content.trim();
    if (Array.isArray(response?.content)) {
        return response.content
            .map((part) => typeof part === "string" ? part : part?.text || "")
            .join(" ")
            .trim();
    }
    return "";
};

export const generateProductDescription = async ({
    title,
    sellerDescription,
    priceAmount,
    priceCurrency,
    size,
    color,
    stockAmount,
}) => {
    const productDetails = JSON.stringify({
        title,
        sellerDescription: sellerDescription || undefined,
        price: priceAmount ? `${priceAmount} ${priceCurrency || "INR"}` : undefined,
        size: size || undefined,
        color: color || undefined,
        stock: stockAmount,
    });

    const response = await mistralAI.invoke([
        new SystemMessage(
            "Write a concise, accurate ecommerce product description in plain text. Use only the supplied facts, do not invent materials or features, and do not mention pricing or stock. Return one paragraph of 30 to 60 words without a heading or markdown.",
        ),
        new HumanMessage(productDetails),
    ]);
    const description = responseText(response);
    if (!description || description.length > 500) {
        throw Object.assign(new Error("Mistral returned an invalid product description"), { code: "AI_DESCRIPTION_FAILED" });
    }
    return description;
};

const aiService = {
    validate: (schema) => (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    chat: async (message) => await mistralAI.invoke(message),
};

export default aiService;
