import { authenticate } from "../middleware/auth.middleware.js";
import { Router } from "express";
import { cartProductViewerController ,addToCartController ,deleteFromCartController } from "../controller/cart.controller.js";


const CartRouter = Router();

CartRouter.get('/', authenticate, cartProductViewerController)
CartRouter.post('/add', authenticate, addToCartController)
CartRouter.delete('/remove', authenticate, deleteFromCartController)

export default CartRouter;