// src/App.jsx

import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// --- COMPONENT IMPORTS ---
// Make sure these paths are correct for your folder structure
import Signup from "./pages/user_creds/Signup";
import Login from "./pages/user_creds/Login";
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
        <Route path="/features" element={<Features />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </Router>
  );
}

export default App;