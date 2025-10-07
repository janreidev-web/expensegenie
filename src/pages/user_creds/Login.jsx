import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password } = formData;

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error('Invalid JSON response:', text);
        setError("Server returned an invalid response");
        return;
      }

      if (res.ok) {
        alert("Login successful!");

        localStorage.setItem("token", data.token);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("username", data.username);

        window.dispatchEvent(new Event("loginStatusChanged"));

        navigate("/");
      } else {
        setError(data.error || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login fetch error:", err);
      setError("Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-slate-900 mb-6 text-center">Log In</h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center font-semibold">
            ❌ {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
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

          <button
            type="submit"
            className="w-full py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Log In
          </button>
        </form>

        <p className="text-sm text-center mt-4 text-slate-600">
          Don't have an account?{" "}
          <Link to="/signup" className="text-indigo-600">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
