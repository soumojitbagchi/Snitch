import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { RouterProvider } from "react-router-dom";
import router from "./route.jsx";
import { getMe } from "./features/auth/services/auth.api.js";
import { setUser } from "./features/redux/auth.slice.jsx";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    let cancelled = false;
    getMe()
      .then(({ user }) => {
        if (!cancelled && user) dispatch(setUser(user));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  return <RouterProvider router={router} />;
}

export default App;
