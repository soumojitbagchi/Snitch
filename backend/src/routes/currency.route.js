import { Router } from "express";
import {
    supportedCurrenciesController,
    convertCurrencyController,
} from "../controller/currency.controller.js";

const currencyRouter = Router();

currencyRouter.get("/supported", supportedCurrenciesController);
currencyRouter.post("/convert", convertCurrencyController);

export default currencyRouter;
