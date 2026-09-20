import { authenticate } from "../middleware/auth.middleware.js";
import { Router } from "express";
import { cartProductViewerController ,addToCartController ,deleteFromCartController ,updateCartQuantityController ,calculateCartTotalController, clearCartController, chnageCurrencyController} from "../controller/cart.controller.js";


const CartRouter = Router();

CartRouter.get('/', authenticate, cartProductViewerController)
CartRouter.post('/add', authenticate, addToCartController)
CartRouter.delete('/remove', authenticate, deleteFromCartController)
CartRouter.patch('/quantity', authenticate, updateCartQuantityController)
CartRouter.delete('/', authenticate, clearCartController)
CartRouter.get('/totalValue',authenticate, calculateCartTotalController)
CartRouter.patch('/currency', authenticate, chnageCurrencyController)

export default CartRouter;
