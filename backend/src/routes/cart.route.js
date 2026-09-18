import { authenticate } from "../middleware/auth.middleware.js";
import { Router } from "express";
import { cartProductViewerController ,addToCartController ,deleteFromCartController ,calculateCartTotalController} from "../controller/cart.controller.js";


const CartRouter = Router();

CartRouter.get('/', authenticate, cartProductViewerController)
CartRouter.post('/add', authenticate, addToCartController)
CartRouter.delete('/remove', authenticate, deleteFromCartController)
CartRouter.get('/totalValue',authenticate, calculateCartTotalController)

export default CartRouter;