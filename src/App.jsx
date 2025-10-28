// src/App.jsx

import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// --- COMPONENT IMPORTS ---
// Make sure these paths are correct for your folder structure
import Signup from "./pages/user_creds/Signup";
import Login from "./pages/user_creds/Login";
import VerifyEmail from "./pages/user_creds/VerifyEmail";
import ResendVerification from "./pages/user_creds/ResendVerification";
import ForgotPassword from "./pages/user_creds/ForgotPassword";
import ResetPassword from "./pages/user_creds/ResetPassword";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Home from "./Home";
import Features from "./components/Features";
import Contact from "./components/Contact";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/resend-verification" element={<ResendVerification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/features" element={<Features />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </Router>
  );
}

export default App;