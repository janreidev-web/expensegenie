// src/pages/Contact.jsx

import React, { useState } from 'react';
import Header from '../components/Header'; // Import Header
import Footer from '../components/Footer'; // Import Footer

// --- SVG Icon Components ---
const MailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
);
const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 6.75z" />
    </svg>
);


// --- Main Contact Component, now structured as a full page ---
const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });
    const [status, setStatus] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus('Sending...');
        setTimeout(() => {
            if (formData.name && formData.email && formData.message) {
                setStatus('Message sent successfully!');
                setFormData({ name: '', email: '', message: '' });
            } else {
                setStatus('Please fill out all fields.');
            }
        }, 1500);
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow pt-20"> {/* pt-20 offsets the fixed header */}
                <section id="contact" className="relative bg-white py-20 sm:py-32">
                    <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Get in Touch</h2>
                            <p className="mt-4 text-lg text-gray-600">We'd love to hear from you. Please fill out the form below.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Contact Information */}
                            <div className="flex flex-col justify-center space-y-8">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <span className="w-12 h-12 bg-indigo-500 text-white rounded-lg flex items-center justify-center"><MailIcon /></span>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-bold text-gray-900">Email</h3>
                                        <p className="mt-1 text-gray-600">Our support team is here to help.</p>
                                        <a href="mailto:janreidev@gmail.com" className="mt-2 text-indigo-600 hover:text-indigo-800 font-semibold">janreidev@gmail.com</a>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <span className="w-12 h-12 bg-indigo-500 text-white rounded-lg flex items-center justify-center"><PhoneIcon /></span>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-bold text-gray-900">Phone</h3>
                                        <p className="mt-1 text-gray-600">Mon-Fri from 8am to 5pm.</p>
                                        <a href="tel:+1-555-123-4567" className="mt-2 text-indigo-600 hover:text-indigo-800 font-semibold">+63 (991) 854 4856</a>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Form */}
                            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</label>
                                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</label>
                                        <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
                                    </div>
                                    <div>
                                        <label htmlFor="message" className="text-sm font-medium text-gray-700">Message</label>
                                        <textarea name="message" id="message" rows="4" value={formData.message} onChange={handleChange} className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"></textarea>
                                    </div>
                                    <div>
                                        <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105">
                                            Send Message
                                        </button>
                                    </div>
                                    {status && <p className="text-center text-sm font-medium text-gray-600">{status}</p>}
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default Contact;