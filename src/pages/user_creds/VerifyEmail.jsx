// src/pages/user_creds/VerifyEmail.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircleIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { ClipLoader } from 'react-spinners';
import toast, { Toaster } from 'react-hot-toast';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  const inputRefs = useRef([]);
  const email = searchParams.get('email');

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0 || isVerified) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isVerified]);

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      toast.error('Email address is required');
      setTimeout(() => navigate('/signup'), 2000);
    }
  }, [email, navigate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered
    if (newCode.every((digit) => digit !== '') && index === 5) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) {
      setError('Please paste only numbers');
      toast.error('Please paste only numbers');
      return;
    }

    const newCode = pastedData.split('').concat(['', '', '', '', '', '']).slice(0, 6);
    setCode(newCode);

    // Focus last filled input or first empty
    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();

    // Auto-verify if 6 digits pasted
    if (pastedData.length === 6) {
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (verificationCode) => {
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsVerified(true);
        toast.success('Email verified successfully!');
        // Redirect to login after 3 seconds
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(data.error || 'Verification failed');
        toast.error(data.error || 'Verification failed');
        // Clear code on error
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      toast.error('Something went wrong. Please try again.');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    setError('');
    setCode(['', '', '', '', '', '']);

    try {
      const res = await fetch('/api/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('New verification code sent!');
        setTimeLeft(900); // Reset timer
        inputRefs.current[0]?.focus();
      } else {
        toast.error(data.error || 'Failed to resend code');
      }
    } catch (err) {
      toast.error('Failed to resend code');
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4">
      <Toaster position="top-center" />
      
      <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md">
        {!isVerified ? (
          <>
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full mb-3">
                <EnvelopeIcon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Verify Your Email</h2>
              <p className="text-slate-600 text-sm">
                We sent a 6-digit code to<br />
                <strong className="text-slate-900">{email}</strong>
              </p>
            </div>

            {/* Code Input */}
            <div className="flex justify-center gap-2 mb-4">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  disabled={isLoading}
                  autoFocus={index === 0}
                  className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-purple-500 
                    ${error ? 'border-red-500' : 'border-slate-300'}
                    ${isLoading ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'}
                    transition-all`}
                  aria-label={`Digit ${index + 1}`}
                />
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 text-center">{error}</p>
              </div>
            )}

            {/* Timer */}
            <div className="text-center mb-4">
              <p className="text-sm text-slate-600">
                Code expires in:{' '}
                <span className={`font-mono font-bold ${timeLeft < 60 ? 'text-red-500' : 'text-purple-600'}`}>
                  {formatTime(timeLeft)}
                </span>
              </p>
            </div>

            {/* Resend Button */}
            <div className="text-center mb-4">
              <button
                onClick={handleResend}
                disabled={isLoading}
                className="text-sm text-purple-600 hover:text-purple-800 font-medium 
                  disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
              >
                Didn't receive the code? <span className="underline">Resend</span>
              </button>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center">
                <ClipLoader color="#667eea" size={40} />
              </div>
            )}

            {/* Back to Login */}
            <div className="text-center mt-6 pt-6 border-t border-slate-200">
              <button
                onClick={() => navigate('/login')}
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                Back to Login
              </button>
            </div>
          </>
        ) : (
          // Success State
          <>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <CheckCircleIcon className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Email Verified!</h2>
              <p className="text-slate-600 mb-4">Your account has been successfully verified.</p>
              <p className="text-sm text-slate-500 mb-6">Redirecting to login page...</p>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold"
              >
                Go to Login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
