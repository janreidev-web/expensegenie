// src/pages/user_creds/ResendVerification.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { EnvelopeIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast';

const ResendVerification = () => {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setEmailSent(true);
        toast.success("Verification email sent! Please check your inbox.");
      } else {
        toast.error(data.error || "Failed to send verification email.");
      }
    } catch (err) {
      console.error("Resend verification error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4">
      <Toaster position="top-center" />
      <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full mb-4">
            <EnvelopeIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Resend Verification</h2>
          <p className="text-slate-600">Enter your email to receive a new verification link</p>
        </div>

        {!emailSent ? (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-slate-700 font-medium mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your.email@example.com"
                  className="w-full border border-slate-300 pl-10 pr-4 py-3 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-lg font-semibold transition-all transform ${
                !isLoading
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg active:scale-95"
                  : "bg-slate-400 text-slate-700 cursor-not-allowed"
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <PaperAirplaneIcon className="h-5 w-5" />
                  Send Verification Email
                </span>
              )}
            </button>
          </form>
        ) : (
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <PaperAirplaneIcon className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Email Sent!</h3>
            <p className="text-slate-600 mb-6">
              We've sent a verification link to <strong>{email}</strong>. Please check your inbox and click the link to verify your account.
            </p>
            <Link
              to="/login"
              className="inline-block px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold"
            >
              Back to Login
            </Link>
          </div>
        )}

        <p className="text-sm text-center mt-6 text-slate-600">
          Remember your credentials?{" "}
          <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResendVerification;
