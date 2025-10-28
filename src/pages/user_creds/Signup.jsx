//src/pages/user_creds/Signup.jsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserIcon, EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast';

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

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Password strength
  const [passwordStrength, setPasswordStrength] = useState('');

  // Check password strength
  const checkPasswordStrength = (password) => {
    if (password.length === 0) return '';
    if (password.length < 6) return 'weak';
    if (password.length < 10 && /[A-Z]/.test(password) && /[0-9]/.test(password)) return 'medium';
    if (password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) return 'strong';
    return 'medium';
  };

  // Update state on input change
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
    
    // Check password strength when password changes
    if (id === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long!");
      return;
    }

    const { username, email, password } = formData;
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth?action=signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Account created! Please check your email for the verification code.", {
          duration: 5000,
        });
        // Redirect to verification page with email
        setTimeout(() => navigate(`/verify-email?email=${encodeURIComponent(email)}`), 2000);
      } else {
        toast.error(data.error || "Signup failed.");
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
<div className="h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-8">
  <Toaster position="top-center" />

  <div className="bg-white/95 backdrop-blur-sm px-8 py-1 rounded-2xl shadow-2xl w-full max-w-lg transform transition-all hover:scale-[1.01]">
    <div className="text-center mb-5">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full mb-2 mt-2">
        <UserIcon className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-3xl font-bold text-slate-900 mb-1">Create an Account</h2>
      <p className="text-slate-600">Join us and start managing your expenses</p>
    </div>

    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* Username */}
      <div>
        <label htmlFor="username" className="block text-slate-700 font-medium mb-1">Username</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <UserIcon className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            id="username"
            value={formData.username}
            onChange={handleChange}
            required
            placeholder="Choose a username"
            className="w-full border border-slate-300 pl-10 pr-4 py-3 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-slate-700 font-medium mb-1">Email</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <EnvelopeIcon className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="your.email@example.com"
            className="w-full border border-slate-300 pl-10 pr-4 py-3 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-slate-700 font-medium mb-1">Password</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LockClosedIcon className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Enter your password"
            className="w-full border border-slate-300 pl-10 pr-12 py-3 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5 text-slate-400 hover:text-slate-600" />
            ) : (
              <EyeIcon className="h-5 w-5 text-slate-400 hover:text-slate-600" />
            )}
          </button>
        </div>

        {/* Password Strength Indicator */}
        {passwordStrength && (
          <div className="mt-2">
            <div className="flex gap-1">
              <div className={`h-1 flex-1 rounded ${
                passwordStrength === 'weak' ? 'bg-red-500' :
                passwordStrength === 'medium' ? 'bg-yellow-500' :
                'bg-green-500'
              }`} />
              <div className={`h-1 flex-1 rounded ${
                passwordStrength === 'medium' || passwordStrength === 'strong' ? 
                passwordStrength === 'medium' ? 'bg-yellow-500' : 'bg-green-500' :
                'bg-slate-200'
              }`} />
              <div className={`h-1 flex-1 rounded ${
                passwordStrength === 'strong' ? 'bg-green-500' : 'bg-slate-200'
              }`} />
            </div>
            <p className={`text-xs mt-1 ${
              passwordStrength === 'weak' ? 'text-red-600' :
              passwordStrength === 'medium' ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              Password strength: {passwordStrength}
            </p>
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirmPassword" className="block text-slate-700 font-medium mb-1">Confirm Password</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LockClosedIcon className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            placeholder="Confirm your password"
            className="w-full border border-slate-300 pl-10 pr-12 py-3 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showConfirmPassword ? (
              <EyeSlashIcon className="h-5 w-5 text-slate-400 hover:text-slate-600" />
            ) : (
              <EyeIcon className="h-5 w-5 text-slate-400 hover:text-slate-600" />
            )}
          </button>
        </div>
        {formData.confirmPassword && formData.password === formData.confirmPassword && (
          <div className="flex items-center gap-1 mt-2">
            <CheckCircleIcon className="h-4 w-4 text-green-600" />
            <p className="text-xs text-green-600">Passwords match</p>
          </div>
        )}
      </div>

      {/* Terms and Conditions */}
      <div className="flex items-start">
        <input
          type="checkbox"
          id="terms"
          checked={agree}
          onChange={() => setAgree(!agree)}
          className="mt-1 mr-3 h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
          required
        />
        <label htmlFor="terms" className="text-sm text-slate-700">
          I agree to the <a href="/terms" className="text-indigo-600 hover:text-indigo-700 font-medium underline">Terms and Conditions</a> and <a href="/privacy" className="text-indigo-600 hover:text-indigo-700 font-medium underline">Privacy Policy</a>
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!agree || isLoading}
        className={`w-full py-3 rounded-lg font-semibold transition-all transform ${
          agree && !isLoading
            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg active:scale-95"
            : "bg-slate-300 text-slate-500 cursor-not-allowed"
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Creating Account...
          </span>
        ) : (
          'Create Account'
        )}
      </button>
    </form>

    {/* Log In Link */}
    <p className="text-sm text-center mt-6 text-slate-600">
      Already have an account?{" "}
      <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline">Log in</Link>
    </p>
  </div>
</div>

  );
};

export default Signup;
