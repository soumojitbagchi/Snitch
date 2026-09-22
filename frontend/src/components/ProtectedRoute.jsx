import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getMe } from "../features/auth/services/auth.api";
import { setUser } from "../features/redux/auth.slice";

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    getMe()
      .then(({ user }) => {
        dispatch(setUser(user));
        setStatus("authenticated");
      })
      .catch(() => setStatus("unauthenticated"));
  }, [dispatch]);

  if (status === "checking") return null;
  if (status === "unauthenticated") {
    return <Navigate to="/signin" replace />;
  }
  return children;
};

export default ProtectedRoute;
