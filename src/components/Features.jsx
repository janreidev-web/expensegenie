// src/pages/Features.jsx

import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

// --- Helper component for fade-in animations ---
const AnimatedElement = ({ children, delay = 0 }) => {
    // ... (This component is unchanged)
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.1 }
        );

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, []);

    return (
        <div
            ref={ref}
            className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};


// --- SVG Icon Components ---
// ... (All icon components are unchanged)
const ChartBarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
);
const ShieldCheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" />
    </svg>
);
const CloudArrowUpIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
    </svg>
);
const TrophyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9 9 0 119 0zM12 14.25a3.75 3.75 0 01-3.75-3.75V4.5a3.75 3.75 0 017.5 0v6.75A3.75 3.75 0 0112 14.25z" />
    </svg>
);

const featureList = [
    // ... (featureList array is unchanged)
    {
        icon: <ChartBarIcon />,
        title: "Insightful Reports",
        description: "Generate beautiful reports to visualize your spending habits and track financial health over time.",
    },
    {
        icon: <ShieldCheckIcon />,
        title: "Bank-Level Security",
        description: "Your data is protected with 256-bit encryption, ensuring your information is always safe.",
    },
    {
        icon: <CloudArrowUpIcon />,
        title: "Cloud Sync",
        description: "Keep your data synced across all your devices. Access your budget from anywhere, anytime.",
    },
    {
        icon: <TrophyIcon />,
        title: "Goal Setting",
        description: "Set and track financial goals, from saving for a vacation to planning for the future. We'll help you succeed.",
    },
];

const Features = () => {
    
    // --- NEW: This useEffect hook scrolls the page to the top on component mount ---
    // Note: While this works, a global <ScrollToTop /> component in App.jsx is a more scalable solution for multi-page apps.
    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'auto' 
        });
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />
            <main className="flex-grow pt-20">
                <section id="features" className="py-20 sm:py-32">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <AnimatedElement>
                            <div className="text-center">
                                <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">Our Features</h2>
                                <p className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
                                    Everything You Need to Succeed
                                </p>
                                <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                                    Expense Genie is packed with powerful features to help you take control of your finances.
                                </p>
                            </div>
                        </AnimatedElement>

                        <div className="mt-20">
                            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
                                {featureList.map((feature, index) => (
                                    <AnimatedElement key={index} delay={150 * (index + 1)}>
                                        <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-2">
                                            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-500 text-white mx-auto">
                                                {feature.icon}
                                            </div>
                                            <h3 className="mt-6 text-xl font-bold text-gray-900">{feature.title}</h3>
                                            <p className="mt-4 text-base text-gray-600">{feature.description}</p>
                                        </div>
                                    </AnimatedElement>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default Features;