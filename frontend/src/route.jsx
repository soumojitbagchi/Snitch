import { createBrowserRouter, Navigate } from "react-router-dom";
import AuthPage from "./features/auth/UI/AuthPage.jsx";
import Home from "./features/product/UI/Home.jsx";
import ProductDetailsPage from "./features/product/UI/ProductDetailsPage.jsx";
import OauthSuccess from "./features/auth/UI/OauthSucess.jsx";
import SellerDashboard, {
  SellerEditRoute,
  SellerListRoute,
  SellerNewRoute,
} from "./features/product/UI/SellerDashboard.jsx";
import PaymentPage from "./features/payment/UI/PaymentPage.jsx";
import BuyNowPage from "./features/payment/UI/BuyNowPage.jsx";
import CartPage from "./features/cart/UI/CartPage.jsx";
import OrdersPage from "./features/orders/UI/OrdersPage.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home/>,
  },
  {
    path: "/cart",
    element: <CartPage />,
  },
  {
    path: "/orders",
    element: <OrdersPage />,
  },
  {
    path: "/product/:id",
    element: <ProductDetailsPage />,
  },
  {
    path: "/signin",
    element: <AuthPage initialMode="signin" />,
  },
  {
    path: "/signup",
    element: <AuthPage initialMode="signup" />,
  },
  {
    path:"/auth/success",
    element: <OauthSuccess/>
  },
  {
    path: "/seller",
    element: <SellerDashboard />,
    children: [
      { index: true, element: <SellerListRoute /> },
      { path: "new", element: <SellerNewRoute /> },
      { path: ":id/edit", element: <SellerEditRoute /> },
    ],
  },
  {
    path: "/buy-now",
    element: <BuyNowPage />,
  },
  {
    path: "/payment",
    element: <PaymentPage />,
  },
  {
    path: "*",
    element: <Navigate to="/signin" replace />,
  },
]);

export default router;
