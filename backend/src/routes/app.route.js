import express from 'express'

const appRouter = express.Router();

appRouter.get("/", (req, res) => {
    res.status(200).json({ message: "Server is running" });
});

// Render health check (see render.yaml healthCheckPath).
appRouter.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

export default appRouter