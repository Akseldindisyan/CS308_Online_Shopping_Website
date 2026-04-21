import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, storeAuthToken } from "../api/auth";

function SignInForm() {
  const navigate = useNavigate();
  const [state, setState] = React.useState({
    username: "",
    password: ""
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState("");
  const [statusType, setStatusType] = React.useState<"success" | "error" | "">("");

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = evt.target;
    setState((currentState) => ({
      ...currentState,
      [name]: value
    }));
    setStatusMessage("");
    setStatusType("");
  };

  const handleOnSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();

    const username = state.username.trim();
    const password = state.password;

    if (!username || !password) {
      setStatusMessage("Please enter your username and password.");
      setStatusType("error");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await login({ username, password });
      storeAuthToken(response.token);
      setStatusMessage("Login successful. Redirecting...");
      setStatusType("success");
      navigate("/");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed.";
      setStatusMessage(message);
      setStatusType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-container sign-in-container">
      <form onSubmit={handleOnSubmit}>
        <h1>Sign in</h1>
        <input
          type="text"
          placeholder="Username"
          name="username"
          value={state.username}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={state.password}
          onChange={handleChange}
        />
        <a href="#">Forgot your password?</a>
        <p className="login-route-link">
          New here? <Link to="/register">Create an account</Link>
        </p>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing In..." : "Sign In"}
        </button>
        {statusMessage ? (
          <p className={`login-status ${statusType}`}>{statusMessage}</p>
        ) : null}
      </form>
    </div>
  );
}

export default SignInForm;
