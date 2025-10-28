// src/pages/PrivacyPolicy.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-white hover:text-indigo-200 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 md:p-12">
          {/* Title Section */}
          <div className="flex items-center gap-4 mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full">
              <ShieldCheckIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Privacy Policy</h1>
              <p className="text-slate-600 mt-1">Last updated: October 28, 2025</p>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Introduction</h2>
              <p className="text-slate-700 leading-relaxed">
                We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Information We Collect</h2>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Personal Information:</h3>
              <ul className="list-disc list-inside ml-4 space-y-2 text-slate-700 mb-4">
                <li>Username and email address</li>
                <li>Password (encrypted)</li>
              </ul>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Financial Data:</h3>
              <ul className="list-disc list-inside ml-4 space-y-2 text-slate-700 mb-4">
                <li>Expense records and categories</li>
                <li>Budget information</li>
              </ul>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Technical Information:</h3>
              <ul className="list-disc list-inside ml-4 space-y-2 text-slate-700">
                <li>IP address and device information</li>
                <li>Browser type and usage patterns</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">3. How We Use Your Information</h2>
              <ul className="list-disc list-inside ml-4 space-y-2 text-slate-700">
                <li>Account management and email verification</li>
                <li>Provide expense tracking services</li>
                <li>Send important updates and notifications</li>
                <li>Maintain security and prevent fraud</li>
                <li>Improve our services</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Data Security</h2>
              <p className="text-slate-700 leading-relaxed mb-3">We implement industry-standard security measures:</p>
              <ul className="list-disc list-inside ml-4 space-y-2 text-slate-700">
                <li>Password encryption using bcrypt</li>
                <li>HTTPS/SSL encryption for data transmission</li>
                <li>JWT-based authentication</li>
                <li>MongoDB with access controls</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Data Sharing</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                <strong>We do NOT sell your data.</strong> We only share information with trusted service providers (database hosting, email services) under strict confidentiality agreements.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Your Rights</h2>
              <ul className="list-disc list-inside ml-4 space-y-2 text-slate-700">
                <li>Access and download your data</li>
                <li>Correct inaccurate information</li>
                <li>Request account deletion</li>
                <li>Control email preferences</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Cookies</h2>
              <p className="text-slate-700 leading-relaxed">
                We use cookies to maintain your login session, remember preferences, and analyze usage. You can control cookies through browser settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Children's Privacy</h2>
              <p className="text-slate-700 leading-relaxed">
                ExpenseGenie is not intended for users under 18. We do not knowingly collect information from children.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Contact Us</h2>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-slate-700"><strong>Email:</strong> janreidev@gmail.com</p>
                <p className="text-slate-700"><strong>Support:</strong> <Link to="/contact" className="text-indigo-600 hover:text-indigo-700 underline">Contact Page</Link></p>
              </div>
            </section>

            <section className="mb-8">
              <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded">
                <p className="text-slate-700 leading-relaxed">
                  <strong className="text-indigo-900">By using ExpenseGenie, you consent to this Privacy Policy.</strong>
                </p>
              </div>
            </section>
          </div>

          {/* Action Buttons */}
          <div className="mt-12 pt-8 border-t border-slate-200 flex flex-wrap gap-4 justify-center">
            <Link
              to="/signup"
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold"
            >
              I Accept - Sign Up
            </Link>
            <Link
              to="/terms"
              className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all font-semibold"
            >
              View Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
