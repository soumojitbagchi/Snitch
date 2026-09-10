import { Router } from "express";
import { createProduct } from "../controller/product.controller.js";

const productRouter = Router();



productRouter.post("/create", createProduct);

export default productRouter;