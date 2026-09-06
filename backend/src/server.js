import dotenv from "dotenv";

dotenv.config()

import app from "./app/app.js"
import connectToDB from "./config/connectDb.js";
import { config } from "./config/config.js";

const startServer = async () => {
    try {
        await connectToDB();
        const PORT = config.PORT

        app.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
};

startServer();