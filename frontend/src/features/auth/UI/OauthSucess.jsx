import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { success } from "../../redux/auth.slice";

const OauthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      navigate("/signin?error=oauth");
      return;
    }

    localStorage.setItem("token", token);
    dispatch(success({ user: null, token }));

    navigate("/");
  }, [searchParams, navigate, dispatch]);

  return <div className="text-6xl">Signing you in...</div>;
};

export default OauthSuccess;
