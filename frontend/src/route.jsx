import { createBrowserRouter, Navigate } from "react-router-dom";
import AuthPage from "./features/auth/UI/AuthPage.jsx";
import Home from "./features/product/UI/Home.jsx";
import AboutPage from "./features/product/UI/AboutPage.jsx";
import ContactPage from "./features/product/UI/ContactPage.jsx";
import SearchResultsPage from "./features/product/UI/SearchResultsPage.jsx";
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
import ProfilePage from "./features/profile/UI/ProfilePage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import WishlistPage from "./features/wishlist/UI/WishlistPage.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home/>,
  },
  {
    path: "/about",
    element: <AboutPage />,
  },
  {
    path: "/contact",
    element: <ContactPage />,
  },
  {
    path: "/search",
    element: <SearchResultsPage />,
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
    path: "/wishlist",
    element: <ProtectedRoute><WishlistPage /></ProtectedRoute>,
  },
  {
    path: "/profile",
    element: <ProtectedRoute><ProfilePage /></ProtectedRoute>,
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
