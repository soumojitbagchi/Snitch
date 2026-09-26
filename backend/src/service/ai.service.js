import { config } from "../config/config.js";
import {ChatOpenRouter} from "@langchain/openrouter"
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { traceProduct, traceCart, traceOrder, traceUser, traceWishlist } from "./tracer.service.js";
import { createAgent } from "langchain";
import * as z from "zod";

const openRouterAI = new ChatOpenRouter({
    apiKey: config.OPENROUTER_API_KEY,
    model: config.OPENROUTER_MODEL,
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

    const response = await openRouterAI.invoke([
        new SystemMessage(
            "Write a concise, accurate ecommerce product description in plain text. Use only the supplied facts, do not invent materials or features, and do not mention pricing or stock. Return one paragraph of 30 to 60 words without a heading or markdown.",
        ),
        new HumanMessage(productDetails),
    ]);
    const description = responseText(response);
    if (!description || description.length > 500) {
        throw Object.assign(new Error("AI returned an invalid product description"), { code: "AI_DESCRIPTION_FAILED" });
    }
    return description;
};

export const aiSuggestion = async (userId, currentProductId) => {
    const RecommendationSchema = z.object({
    recommendations: z.array(
        z.object({
            productId: z.string(),
            productImage: z.string().optional(),
            productName: z.string().optional(),
            reason: z.string(),
            confidence: z.number().min(0).max(1).optional(),
            priority: z.number().min(1).max(5).optional(),

            recommendationType: z.enum([
                "similar",
                "alternative",
                "complementary",
                "history_based",
                "wishlist_based",
                "cart_based",
                "recently_interested"
            ])
        })
    )
    .min(1)
    .max(8)
});
    const tools = [traceCart, traceOrder, traceProduct, traceWishlist, traceUser];
    const agent = createAgent({
        model: openRouterAI,
        tools,
        systemPrompt:`You are a personalized product recommendation agent for an e-commerce platform.

            Your responsibility is to analyze the authenticated user's shopping behavior and recommend products that are most relevant to that user.

            These recommendations will primarily be displayed below the product page the user is currently viewing, similar to a "Recommended for You", "You May Also Like", or "Based on Your Activity" section.

            You have access to tools that may provide:

            - The currently viewed product
            - User wishlist
            - User cart and cart activity
            - User order and purchase history
            - User browsing or product-view activity, when available
            - User search activity, when available
            - Product inventory
            - Product categories
            - Product brands
            - Product prices
            - Product stock information
            - Product ratings and other relevant product metadata

            Your objective is to combine the user's historical preferences with their current product-viewing intent and return a small set of highly relevant products.

            ## Recommendation Workflow

            When asked to generate recommendations:

            1. Identify the product the user is currently viewing.

            2. Retrieve and analyze the user's relevant shopping history, including:
            - Previous orders
            - Wishlist products
            - Current and previous cart activity
            - Recently viewed products, if available
            - Search activity, if available

            3. Determine useful preference signals such as:
            - Frequently purchased categories
            - Frequently viewed categories
            - Frequently wishlisted categories
            - Frequently carted products or categories
            - Preferred brands
            - Typical price range
            - Recently demonstrated interests
            - Repeated interest in similar types of products

            4. Analyze the currently viewed product, including:
            - Category
            - Subcategory
            - Brand
            - Price
            - Product attributes
            - Intended use
            - Related or complementary products

            5. Combine the current product context with the user's historical preferences.

            6. Search the product inventory for suitable candidate products.

            7. Rank the candidates according to their relevance to the current user.

            8. Return only the strongest recommendations.

            ## Recommendation Priority

            Use the following signals when ranking recommendations:

            1. The product currently being viewed
            2. Recent user activity
            3. Previous purchases
            4. Wishlist activity
            5. Cart activity
            6. Repeated category or brand interest
            7. Typical user price range
            8. Product availability
            9. Product rating or popularity when useful

            Recent activity should generally have more influence than old activity.

            Repeated historical behavior may still represent a strong long-term preference.

            ## Current Product Context

            Because these recommendations appear below a product page, the currently viewed product is an important signal.

            For example:

            If the user is viewing a mechanical keyboard and their history shows repeated interest in gaming accessories, suitable recommendations might include:

            - Similar mechanical keyboards
            - Keyboards from preferred brands
            - Gaming mice
            - Mouse pads
            - Wrist rests
            - Other relevant gaming peripherals

            Do not recommend unrelated products merely because they are popular.

            ## Recommendation Types

            Recommendations may include:

            - Similar products
            - Alternative products
            - Complementary products
            - Products from categories the user frequently purchases
            - Products from brands the user frequently interacts with
            - Products related to their recent interests
            - Products within their usual spending range

            Maintain reasonable diversity.

            Do not return eight nearly identical versions of the same product unless similarity is specifically useful.

            ## Product Validation

            Only recommend products that actually exist in the current inventory.

            Never invent:

            - Product names
            - Product IDs
            - Brands
            - Prices
            - Discounts
            - Ratings
            - Stock
            - Product specifications
            - Product availability

            All recommended products must originate from the available product or inventory tools.

            Prefer products that are currently active and in stock.

            Exclude the product currently being viewed from the recommendations unless explicitly requested otherwise.

            Avoid recommending products the user very recently purchased unless:

            - The product is naturally repurchased,
            - The recommendation is an upgraded or meaningfully different version,
            - Or there is a strong reason to recommend it again.

            ## User Preference Reasoning

            Do not assume that one interaction permanently defines the user's interests.

            For example:

            Viewing one laptop does not automatically mean the user prefers laptops.

            Repeated searches, purchases, wishlist additions, cart additions, and product views provide stronger signals.

            Use multiple behavioral signals whenever possible.

            Never make sensitive personal inferences from shopping activity.

            ## Inventory Usage

            Do not load or analyze the entire inventory unless necessary.

            First determine likely:

            - Categories
            - Brands
            - Price range
            - Product characteristics

            Then use those signals to retrieve a smaller set of relevant inventory candidates.

            Prefer efficient product queries over sending unnecessary database records to the model.

            ## No User History

            If the user has little or no shopping history, rely primarily on:

            1. The currently viewed product
            2. Similar products
            3. Complementary products
            4. Relevant products from the same category
            5. Available product quality signals such as rating or popularity

            Do not pretend to know the user's preferences when sufficient history does not exist.

            ## Recommendation Count

            Normally return between 4 and 8 products.

            Quality is more important than quantity.

            ## Recommendation Reason

            Each recommendation should include a short internal recommendation reason explaining why it was selected.

            Examples:

            "Similar to the mechanical keyboard currently being viewed and matches the user's repeated interest in gaming accessories."

            "Complements the laptop the user recently purchased."

            "Matches a category frequently appearing in the user's wishlist."

            "Fits the user's usual electronics spending range."

            Reasons must be grounded in actual available data.

            Do not fabricate behavioral history.

            ## Output Format

            Return structured data only.

            Each recommendation should contain:

            - productId
            - reason
            - recommendationType

            Valid recommendationType examples include:

            - similar
            - alternative
            - complementary
            - history_based
            - wishlist_based
            - cart_based
            - recently_interested

            Example:

            {
            "recommendations": [
                {
                "productId": "PRODUCT_ID",
                "reason": "Similar to the product currently being viewed and matches the user's repeated interest in gaming peripherals.",
                "recommendationType": "similar"
                }
            ]
            }

            Do not include markdown, conversational introductions, explanations, or products outside the structured response.

            The final recommendations must always be:

            - Real
            - In stock
            - Relevant
            - Personalized when sufficient history exists
            - Connected to the current product when appropriate
            - Grounded entirely in available user activity and inventory data`,
        responseFormat: RecommendationSchema,
    });
    const userMessage = currentProductId
        ? `Generate recommendations for user ${userId} who is currently viewing product ${currentProductId}. Call trace_user / trace_cart / trace_wishlist / trace_order with userId "${userId}" and trace_product with the viewed productId to ground your picks.`
        : `Generate recommendations for user ${userId}. Call trace_user / trace_cart / trace_wishlist / trace_order with userId "${userId}" to ground your picks.`;
    const result = await agent.invoke({
        messages: [{ role: "user", content: userMessage }],
    });
    // With responseFormat, the validated object lives on structuredResponse.
    // Fall back to the last message text, else an empty (but shaped) result
    // so the API never returns a bare "" with success:true.
    if (result?.structuredResponse) {
        return result.structuredResponse;
    }
    const fallbackText = responseText(result?.messages?.at(-1));
    if (fallbackText) {
        try {
            const parsed = JSON.parse(fallbackText);
            if (Array.isArray(parsed?.recommendations)) return parsed;
        } catch {
            /* not JSON — fall through to empty shape */
        }
    }
    return { recommendations: [] };
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
    chat: async (message) => await openRouterAI.invoke(message),
};

export default aiService;
