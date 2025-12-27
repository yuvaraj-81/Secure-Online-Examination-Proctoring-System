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

      // role-based redirect
      navigate(role === "ADMIN" ? "/admin" : "/student");
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
  <div className="auth-page">
    <div className="auth-container">
      <h2>Sign In</h2>

      <form onSubmit={handleSubmit}>
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

        <button type="submit">Login</button>
      </form>

      <div className="switch-link" onClick={() => navigate("/signup")}>
        New user? <span>Create an account</span>
      </div>
    </div>
  </div>
);

};

export default Login;
