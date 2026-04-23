import React from "react";
import { Link } from "react-router-dom";
import { register } from "../api/auth";

function SignUpForm() {
  const [state, setState] = React.useState({
    username: "",
    name: "",
    surname: "",
    email: "",
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
    const name = state.name.trim();
    const surname = state.surname.trim();
    const email = state.email.trim();
    const password = state.password;

    if (!username || !name || !surname || !email || !password) {
      setStatusMessage("Please fill in username, name, surname, email, and password.");
      setStatusType("error");
      return;
    }

    setIsSubmitting(true);

    try {
      await register({ username, name, surname, email, password });
      setStatusMessage("Registration successful. You can now sign in.");
      setStatusType("success");
      setState({
        username: "",
        name: "",
        surname: "",
        email: "",
        password: ""
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed.";
      setStatusMessage(message);
      setStatusType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-container sign-up-container">
      <form onSubmit={handleOnSubmit}>
        <h1>Create Account</h1>

        <input
          type="text"
          name="username"
          value={state.username}
          onChange={handleChange}
          placeholder="Username"
        />
        
        <input
          type="text"
          name="name"
          value={state.name}
          onChange={handleChange}
          placeholder="Name"
        />
        <input
          type="text"
          name="surname"
          value={state.surname}
          onChange={handleChange}
          placeholder="Surname"
        />
        <input
          type="email"
          name="email"
          value={state.email}
          onChange={handleChange}
          placeholder="Email"
        />
        <input
          type="password"
          name="password"
          value={state.password}
          onChange={handleChange}
          placeholder="Password"
        />
        <p className="login-route-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing Up..." : "Sign Up"}
        </button>
        {statusMessage ? (
          <p className={`login-status ${statusType}`}>{statusMessage}</p>
        ) : null}
      </form>
    </div>
  );
}

export default SignUpForm;
