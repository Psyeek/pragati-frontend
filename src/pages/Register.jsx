import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { registerUser } from "../services/authService";
import "../styles/login.css";
import pragatiLogo from "../assets/Capture.JPG";

const constructionFacts = [
  "The Great Wall of China is over 13,000 miles long!",
  "Concrete is the second-most-used substance on Earth after water.",
  "The Burj Khalifa's foundation piles go 50 meters deep into the ground.",
  "Ancient Romans used volcanic ash to make their concrete more durable.",
  "The Golden Gate Bridge contains enough steel to circle the Earth 3 times."
];

const Register = () => {
  const [view, setView] = useState("canvas"); // canvas | loading | form
  const [fact, setFact] = useState("");
  const [form, setForm] = useState({
    userName: "",
    firstName: "",
    middleName: "",
    lastName: "",
    emailId: "",
    phone: "",
    department: "",
    type: "",
    role: "",
    status: "",
    password: ""
  });
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const showLoginForm = () => {
    setView("loading");
    setFact(constructionFacts[Math.floor(Math.random() * constructionFacts.length)]);
    setTimeout(() => setView("form"), 2000);
  };

  const handleRegister = async () => {
    console.log("Register button clicked");
    console.log("Submitting form:", form);

    if (!form.userName || !form.emailId || !form.password) {
      setError("Please fill in all required fields.");
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      const data = await registerUser(form);
      alert("Registration successful!");
      navigate("/");
    } catch (err) {
      console.error("Registration error:", err);
      setError("Registration failed. Try again.");
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
        <img src="/Images/Capture.JPG" alt="PRAGATI Logo" />
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
            {/* Optional: wrap in <form> */}
            {/* <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }}> */}

            <input type="text" placeholder="User Name" value={form.userName} onChange={(e) => setForm({ ...form, userName: e.target.value })} />
            <input type="text" placeholder="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            <input type="text" placeholder="Middle Name" value={form.middleName} onChange={(e) => setForm({ ...form, middleName: e.target.value })} />
            <input type="text" placeholder="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            <input type="email" placeholder="Email ID" value={form.emailId} onChange={(e) => setForm({ ...form, emailId: e.target.value })} />
            <input type="text" placeholder="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input type="text" placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
            <input type="text" placeholder="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
            <input type="number" placeholder="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
            <input type="text" placeholder="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} />
            <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />

            <button type="button" onClick={handleRegister}>Register</button>

            {/* </form> */}

            <button
              className="learn-more-btn"
              onClick={() =>
                alert("PRAGATI\nPublic Resource & Automation for\nGovernment Administration & Transparent Infrastructure")
              }
            >
              Forgot Password?
            </button>
            <div className="forgot-password">
              Already have an account? <a href="/">Login here</a>
            </div>
          </div>
        </div>
      )}

      {error && <div className="error-popup">{error}</div>}
    </div>
  );
};

export default Register;


