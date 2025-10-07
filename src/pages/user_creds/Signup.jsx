//src/pages/user_creds/Signup.jsx

import React, { use, useState } from "react";
import { Link, useNavigate} from "react-router-dom";

const Signup = () => {

  // For navigation after signup
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Checkbox for terms
  const [agree, setAgree] = useState(false);

  // Update state on input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    const { username, email, password } = formData;

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Signup successful!");
        navigate("/login");
      } else {
        alert(data.error || "Signup failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-slate-900 mb-6 text-center">Create an Account</h2>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-slate-700 mb-1">Username</label>
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full border border-slate-300 px-4 py-2 rounded text-slate-900"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-slate-700 mb-1">Email</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border border-slate-300 px-4 py-2 rounded text-slate-900"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-slate-700 mb-1">Password</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full border border-slate-300 px-4 py-2 rounded text-slate-900"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-slate-700 mb-1">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full border border-slate-300 px-4 py-2 rounded text-slate-900"
            />
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="terms"
              checked={agree}
              onChange={() => setAgree(!agree)}
              className="mr-2"
              required
            />
            <label htmlFor="terms" className="text-sm text-slate-700">
              I agree to the <a href="/terms" className="text-indigo-600">Terms and Conditions</a>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!agree}
            className={`w-full py-2 rounded ${
              agree
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-slate-400 text-slate-700 cursor-not-allowed"
            }`}
          >
            Sign Up
          </button>
        </form>

        {/* Log In Link */}
        <p className="text-sm text-center mt-4 text-slate-600">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
