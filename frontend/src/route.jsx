import { createBrowserRouter, Navigate } from "react-router-dom";
import AuthPage from "./features/auth/UI/AuthPage.jsx";
import Home from "./features/product/UI/Home.jsx";
import OauthSuccess from "./features/auth/UI/OauthSucess.jsx";

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
    path: "*",
    element: <Navigate to="/signin" replace />,
  },
  {
    path:"/auth/sucess",
    element: <OauthSuccess/>
  }
]);

export default router;
