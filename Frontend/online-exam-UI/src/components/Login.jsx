import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(email, password);
      const { token, role } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      navigate(role === "ADMIN" ? "/admin" : "/student");
    } catch {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-inner">
          <h2 className="auth-title">Sign In</h2>
          <p className="auth-subtitle">
            Welcome back. Let’s get you authenticated.
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div>
              <label className="auth-label">Email</label>
              <div className="auth-input-wrapper">
                <input
                  className="auth-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="auth-label">Password</label>
              <div className="auth-input-wrapper">
                <input
                  className="auth-input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button className="auth-button" type="submit">
              Login
            </button>
          </form>

          <div className="auth-switch">
            New here?{" "}
            <span onClick={() => navigate("/signup")}>
              Create an account
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
