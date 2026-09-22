import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { success } from "../../redux/auth.slice";
import { getMe } from "../services/auth.api";

const OauthSuccess = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const completeSignIn = async () => {
      try {
        const data = await getMe();
        dispatch(success({ user: data.user }));
        navigate("/");
      } catch {
        navigate("/signin?error=oauth");
      }
    };

    completeSignIn();
  }, [navigate, dispatch]);

  return <div className="text-6xl">Signing you in...</div>;
};

export default OauthSuccess;
