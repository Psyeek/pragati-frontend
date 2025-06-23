import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../services/authService";
import "../styles/login.css";
import pragatiLogo from "../assets/Capture.JPG";



const constructionFacts = [
  "The Great Wall of China is over 13,000 miles long!",
  "Concrete is the second-most-used substance on Earth after water.",
  "The Burj Khalifa's foundation piles go 50 meters deep into the ground.",
  "Ancient Romans used volcanic ash to make their concrete more durable.",
  "The Golden Gate Bridge contains enough steel to circle the Earth 3 times."
];

const Login = () => {
  const [view, setView] = useState("canvas"); // canvas | loading | form
  const [fact, setFact] = useState("");
  const [form, setForm] = useState({ emailId: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const showLoginForm = () => {
    setView("loading");
    setFact(constructionFacts[Math.floor(Math.random() * constructionFacts.length)]);
    setTimeout(() => setView("form"), 2000);
  };

  const handleLogin = async () => {
    try {
      const data = await loginUser(form);
      login(data.user);
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch {
      setError("Invalid credentials. Please try again.");
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <div className="login-wrapper">
  <div className="logo-center">
    <img src={pragatiLogo} alt="PRAGATI Logo" className="pragati-logo" />
  </div>


      {/* Logo */}
      {/* <div className="logo-container">
        <img src={pragatiLogo} alt="PRAGATI Logo" className="pragati-logo" />

      </div> */}

      {view === "canvas" && (
        <div className="canvas">
          <h1>Building Tomorrow's India</h1>
          <p>
            "Development is not about factories and roads alone, but about building capabilities in people."
          </p>
          <button onClick={showLoginForm}>Let's Start Developing →</button>
        </div>
      )}

      {view === "loading" && (
        <div className="progress-container">
          <img src="https://cdn-icons-png.flaticon.com/512/1998/1998664.png" alt="Loading" />
          <p>Initializing Development Environment...</p>
          <p className="fact">{fact}</p>
        </div>
      )}

      {view === "form" && (
        <div className="form-section">
          
          <div className="form-container" id="login-form">
            <input
              type="text"
              placeholder="Email"
              value={form.emailId}
              onChange={(e) => setForm({ ...form, emailId: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <button onClick={handleLogin}>Login</button>
            <button className="learn-more-btn" onClick={() => alert("PRAGATI\nPublic Resource & Automation for\nGovernment Administration & Transparent Infrastructure")}>
              Forgot Password?
            </button>
            <div className="forgot-password">
                Don't have an account? <a href="/register">Register here</a>
            </div>
          </div>
        </div>
      )}

      {error && <div className="error-popup">{error}</div>}
    </div>
  );
};

export default Login;
