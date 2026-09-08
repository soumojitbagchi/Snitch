import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const OauthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
        console.log("error here")
      navigate("/signin?error=oauth");
      return;
    }

    localStorage.setItem("token", token);

    navigate("/");
  }, [searchParams, navigate]);

  return <div className="text-6xl">Signing you in...</div>;
};

export default OauthSuccess;
