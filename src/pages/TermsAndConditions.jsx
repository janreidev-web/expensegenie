// src/pages/TermsAndConditions.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const TermsAndConditions = () => {
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
              <DocumentTextIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Terms and Conditions</h1>
              <p className="text-slate-600 mt-1">Last updated: October 28, 2025</p>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-slate max-w-none">
            {/* Introduction */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Introduction</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Welcome to ExpenseGenie ("we," "our," or "us"). These Terms and Conditions govern your use of our expense management application and services. By accessing or using ExpenseGenie, you agree to be bound by these Terms and Conditions.
              </p>
              <p className="text-slate-700 leading-relaxed">
                If you do not agree with any part of these terms, please do not use our service.
              </p>
            </section>

            {/* Acceptance of Terms */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Acceptance of Terms</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                By creating an account and using ExpenseGenie, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions, as well as our Privacy Policy.
              </p>
              <p className="text-slate-700 leading-relaxed">
                You must be at least 18 years old to use this service. By using ExpenseGenie, you represent and warrant that you meet this age requirement.
              </p>
            </section>

            {/* Account Registration */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Account Registration</h2>
              <div className="text-slate-700 leading-relaxed space-y-3">
                <p>To use ExpenseGenie, you must create an account by providing:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>A valid email address</li>
                  <li>A unique username</li>
                  <li>A secure password</li>
                </ul>
                <p className="mt-4">
                  You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                  <li>Not share your account credentials with others</li>
                </ul>
              </div>
            </section>

            {/* Email Verification */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Email Verification</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                After registration, you must verify your email address by clicking the verification link sent to your email. Unverified accounts will have limited access to our services.
              </p>
              <p className="text-slate-700 leading-relaxed">
                Verification links expire after 24 hours. You may request a new verification email if needed.
              </p>
            </section>

            {/* Use of Service */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Use of Service</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                ExpenseGenie provides expense tracking and management tools. You agree to use the service only for lawful purposes and in accordance with these Terms.
              </p>
              <p className="text-slate-700 leading-relaxed mb-3">You agree NOT to:</p>
              <ul className="list-disc list-inside ml-4 space-y-2 text-slate-700">
                <li>Use the service for any illegal or unauthorized purpose</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the service or servers</li>
                <li>Upload malicious code or viruses</li>
                <li>Collect or harvest user information without consent</li>
                <li>Impersonate another person or entity</li>
                <li>Use automated systems to access the service</li>
              </ul>
            </section>

            {/* User Data and Content */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">6. User Data and Content</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                You retain ownership of all data and content you upload to ExpenseGenie, including expense records, receipts, and notes. By using our service, you grant us a limited license to store, process, and display your content solely for the purpose of providing the service to you.
              </p>
              <p className="text-slate-700 leading-relaxed">
                You are responsible for maintaining backups of your data. We are not liable for any data loss that may occur.
              </p>
            </section>

            {/* Privacy and Security */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Privacy and Security</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Your privacy is important to us. Our collection and use of personal information is governed by our <Link to="/privacy" className="text-indigo-600 hover:text-indigo-700 underline">Privacy Policy</Link>.
              </p>
              <p className="text-slate-700 leading-relaxed">
                While we implement reasonable security measures to protect your data, no method of transmission over the Internet is 100% secure. You use the service at your own risk.
              </p>
            </section>

            {/* Intellectual Property */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Intellectual Property</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                The ExpenseGenie service, including its original content, features, and functionality, is owned by us and is protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
              <p className="text-slate-700 leading-relaxed">
                You may not copy, modify, distribute, sell, or lease any part of our service without our express written permission.
              </p>
            </section>

            {/* Termination */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Termination</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We reserve the right to suspend or terminate your account at any time for any reason, including but not limited to:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2 text-slate-700 mb-4">
                <li>Violation of these Terms and Conditions</li>
                <li>Fraudulent or illegal activity</li>
                <li>Abuse of the service or other users</li>
                <li>Extended period of inactivity</li>
              </ul>
              <p className="text-slate-700 leading-relaxed">
                You may terminate your account at any time by contacting us. Upon termination, your right to use the service will immediately cease.
              </p>
            </section>

            {/* Disclaimer of Warranties */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Disclaimer of Warranties</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                ExpenseGenie is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either express or implied, including but not limited to:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2 text-slate-700">
                <li>Merchantability and fitness for a particular purpose</li>
                <li>Accuracy, reliability, or completeness of the service</li>
                <li>Uninterrupted or error-free operation</li>
                <li>Security or freedom from viruses</li>
              </ul>
            </section>

            {/* Limitation of Liability */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">11. Limitation of Liability</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                To the maximum extent permitted by law, ExpenseGenie and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2 text-slate-700">
                <li>Loss of profits, data, or other intangible losses</li>
                <li>Unauthorized access to or alteration of your data</li>
                <li>Statements or conduct of third parties on the service</li>
                <li>Any other matter relating to the service</li>
              </ul>
            </section>

            {/* Indemnification */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">12. Indemnification</h2>
              <p className="text-slate-700 leading-relaxed">
                You agree to indemnify, defend, and hold harmless ExpenseGenie and its officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses arising from your use of the service or violation of these Terms.
              </p>
            </section>

            {/* Changes to Terms */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">13. Changes to Terms</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We reserve the right to modify these Terms and Conditions at any time. We will notify users of any material changes by:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2 text-slate-700 mb-4">
                <li>Posting the updated terms on our website</li>
                <li>Sending an email notification to registered users</li>
                <li>Displaying a notice within the application</li>
              </ul>
              <p className="text-slate-700 leading-relaxed">
                Your continued use of the service after changes are posted constitutes acceptance of the modified terms.
              </p>
            </section>

            {/* Governing Law */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">14. Governing Law</h2>
              <p className="text-slate-700 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of your jurisdiction, without regard to its conflict of law provisions.
              </p>
            </section>

            {/* Contact Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">15. Contact Information</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                If you have any questions about these Terms and Conditions, please contact us:
              </p>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-slate-700"><strong>Email:</strong> janreidev@gmail.com</p>
                <p className="text-slate-700"><strong>Website:</strong> <Link to="/contact" className="text-indigo-600 hover:text-indigo-700 underline">Contact Page</Link></p>
              </div>
            </section>

            {/* Acceptance */}
            <section className="mb-8">
              <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded">
                <p className="text-slate-700 leading-relaxed">
                  <strong className="text-indigo-900">By using ExpenseGenie, you acknowledge that you have read and understood these Terms and Conditions and agree to be bound by them.</strong>
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
              to="/privacy"
              className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all font-semibold"
            >
              View Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
