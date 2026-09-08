import express from 'express'

const appRouter = express.Router();

appRouter.get("/", (req, res) => {
    res.status(200).json({ message: "Server is running" });
});

export default appRouter