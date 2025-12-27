import { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ REQUIRED
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
      alert("Signup failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Create Account</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Sign Up</button>
        </form>

        <div
          className="switch-link"
          onClick={() => navigate("/login")}
        >
          Already have an account? <span>Sign in</span>
        </div>
      </div>
    </div>
  );
};

export default Signup;
