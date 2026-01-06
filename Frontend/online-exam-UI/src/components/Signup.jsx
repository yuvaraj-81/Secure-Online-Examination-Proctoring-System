import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../services/authService";

const Signup = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(name, email, password);
      alert("Signup successful. Please login.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data || "Signup failed. Please try again.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-inner">
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">
            Secure access starts here.
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div>
              <label className="auth-label">Name</label>
              <div className="auth-input-wrapper">
                <input
                  className="auth-input"
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

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
              Sign Up
            </button>
          </form>

          <div className="auth-switch">
            Already have an account?{" "}
            <span onClick={() => navigate("/login")}>
              Sign in
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
