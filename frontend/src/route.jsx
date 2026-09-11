import { createBrowserRouter, Navigate } from "react-router-dom";
import AuthPage from "./features/auth/UI/AuthPage.jsx";
import Home from "./features/product/UI/Home.jsx";
import OauthSuccess from "./features/auth/UI/OauthSucess.jsx";
import SellerDashboard, {
  SellerEditRoute,
  SellerListRoute,
  SellerNewRoute,
} from "./features/product/UI/SellerDashboard.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home/>,
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
    path: "*",
    element: <Navigate to="/signin" replace />,
  },
]);

export default router;
