import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style.css";
import SignInForm from "./SignIn.tsx";
import SignUpForm from "./SignUp.tsx";

type LoginProps = {
  initialType?: "signIn" | "signUp";
};

export default function Login({ initialType = "signIn" }: LoginProps) {
  const navigate = useNavigate();
  const [type, setType] = useState<"signIn" | "signUp">(initialType);

  useEffect(() => {
    setType(initialType);
  }, [initialType]);

  const handleOnClick = (nextType: "signIn" | "signUp") => {
    if (nextType !== type) {
      setType(nextType);
    }

    navigate(nextType === "signUp" ? "/register" : "/login");
  };
  const containerClass =
    "container " + (type === "signUp" ? "right-panel-active" : "");
  return (
    <div className="Login">
      <div className={containerClass} id="container">
        <SignUpForm />
        <SignInForm />
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>Hi!</h1>
              <p>
                To use our online shop please create an account on the website
              </p>
              <button
                className="ghost"
                id="signIn"
                onClick={() => handleOnClick("signIn")}
              >
                Sign In
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1>Welcome Back!</h1>
              <p>Enter your username and password</p>
              <button
                className="ghost "
                id="signUp"
                onClick={() => handleOnClick("signUp")}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
