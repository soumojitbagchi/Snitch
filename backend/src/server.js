import dotenv from "dotenv";

dotenv.config()

import app from "./app/app.js"
import connectToDB from "./config/connectDb.js";
import { config } from "./config/config.js";
import {connectToRedis }from "./config/redis.js";
import http from "http";
import { attachAiSocket } from "./socket/ai.socket.js";
import { sweepStalePayments } from "./controller/payment.controller.js";

const startServer = async () => {
    try {
        await connectToDB();
        await connectToRedis();
        const PORT = config.PORT

        const httpServer = http.createServer(app);
        attachAiSocket(httpServer);
        httpServer.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        });

        const sweepTimer = setInterval(async () => {
            try {
                const swept = await sweepStalePayments();
                if (swept > 0) console.log(`Swept ${swept} stale pending payment(s)`);
            } catch (error) {
                console.error("Stale payment sweep failed:", error.message);
            }
        }, 60 * 60 * 1000);
        sweepTimer.unref?.();
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
};

startServer();