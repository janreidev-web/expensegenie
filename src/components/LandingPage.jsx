import React, { useRef, useEffect, useState } from "react";
import Lottie from "lottie-react";

// --- Animation Imports ---
import robot from "../assets/animations/robot.json";
import expensetracker from "../assets/animations/expensetracker.json";
import money from "../assets/animations/money.json";
import summary from "../assets/animations/summary.json";
import trend from "../assets/animations/trend.json";

// --- Helper Component for Staggered Animation ---
function AnimatedElement({ children, isVisible, delay = 0 }) {
    return (
        <div
            className={`transition-all duration-700 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}

// --- Section Component (Modified to pass visibility state to children) ---
function Section({ children, bgColor, index, onVisibleChange }) {
    const ref = useRef();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting !== isVisible) {
                    setIsVisible(entry.isIntersecting);
                    if (onVisibleChange) onVisibleChange(entry.isIntersecting, index);
                }
            },
            { threshold: 0.5 }
        );

        const currentRef = ref.current;
        if (currentRef) observer.observe(currentRef);

        return () => {
            if (currentRef) observer.unobserve(currentRef);
        };
    }, [onVisibleChange, isVisible, index]);

    return (
        <section
            ref={ref}
            className={`min-h-screen flex flex-col md:flex-row items-center justify-center p-8 snap-start ${bgColor}`}
        >
            {/* Pass isVisible state down to the children function */}
            {children({ isVisible })}
        </section>
    );
}


// --- New and Enhanced Components ---

function StickyRobot({ currentSectionIndex, sectionMessages }) {
    const isVisible = currentSectionIndex >= 0 && currentSectionIndex < sectionMessages.length;
    const message = isVisible ? sectionMessages[currentSectionIndex] : sectionMessages[0];

    return (
        <div
            className={`fixed bottom-8 right-8 z-50 transition-all duration-700 ease-in-out
                      ${isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
                      hidden lg:flex flex-col items-center`}
        >
            <div
                className={`bg-white p-4 mb-3 max-w-xs rounded-xl shadow-2xl text-gray-800 border border-teal-200 relative transform transition-all duration-500 delay-200
                          ${isVisible ? "scale-100 opacity-100" : "scale-90 opacity-0"}`}
            >
                <p key={message} className="font-medium text-sm italic animate-fade-in">
                    "{message}"
                </p>
                <div className="absolute right-8 -bottom-2 w-0 h-0 border-t-8 border-t-white border-l-8 border-l-transparent border-r-8 border-r-transparent shadow-t-xl" />
            </div>
            <div className="w-28 h-28">
                <Lottie animationData={robot} loop={true} />
            </div>
        </div>
    );
}

function HeroSection({ title, description, bgColor, onVisibleChange }) {
    const ref = useRef();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting !== isVisible) {
                    setIsVisible(entry.isIntersecting);
                    if (onVisibleChange) onVisibleChange(entry.isIntersecting, -1);
                }
            },
            { threshold: 0.6 }
        );
        const currentRef = ref.current;
        if (currentRef) observer.observe(currentRef);
        return () => {
            if (currentRef) observer.unobserve(currentRef);
        };
    }, [onVisibleChange, isVisible]);

    return (
        <div
            ref={ref}
            className={`min-h-screen flex items-center justify-center p-8 snap-start text-center relative overflow-hidden ${bgColor}`}
        >
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#a7f3d0_1px,transparent_1px)] [background-size:32px_32px]"></div>
            <div className="z-10 max-w-5xl">
                <AnimatedElement isVisible={isVisible} delay={100}>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-blue-600">
                            {title}
                        </span>
                    </h1>
                </AnimatedElement>
                <AnimatedElement isVisible={isVisible} delay={300}>
                    <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
                        {description}
                    </p>
                </AnimatedElement>
                <AnimatedElement isVisible={isVisible} delay={500}>
                    <a
                        href="#signup"
                        className="inline-block px-12 py-4 text-lg font-bold text-white bg-teal-500 rounded-full shadow-lg hover:bg-teal-600 transition-all duration-300 transform hover:scale-110 animate-pulse-slow"
                    >
                        Start Saving Today! 🚀
                    </a>
                </AnimatedElement>
            </div>
        </div>
    );
}

function KeyFeaturesSummary({ onVisibleChange }) {
    const ref = useRef();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isVisible) setIsVisible(true);
                if (onVisibleChange) onVisibleChange(entry.isIntersecting, -2);
            },
            { threshold: 0.4 }
        );
        const currentRef = ref.current;
        if (currentRef) observer.observe(currentRef);
        return () => {
            if (currentRef) observer.unobserve(currentRef);
        };
    }, [onVisibleChange, isVisible]);

    const features = [
        { anim: expensetracker, title: "AI Expense Tracking", desc: "Auto-categorize spending in real-time without manual entry." },
        { anim: money, title: "Smart Budget Alerts", desc: "Receive timely, intelligent alerts to stay on top of your budget." },
        { anim: summary, title: "Personalized Reports", desc: "Visualize your financial health with clear, insightful summaries." },
        { anim: trend, title: "Future Cashflow Forecast", desc: "Use AI-powered forecasts to plan ahead and avoid surprises." },
    ];

    return (
        <div ref={ref} className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 to-blue-100 py-24 px-8 text-center snap-start">
            <AnimatedElement isVisible={isVisible}>
                <h2 className="text-4xl font-extrabold text-gray-800 mb-4">Simplicity Meets Power.</h2>
                <p className="text-lg text-gray-600 mb-16 max-w-2xl mx-auto">Here's why you'll love managing your finances with Expense Genie.</p>
            </AnimatedElement>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                {features.map((feature, index) => (
                    <div
                        key={index}
                        className={`bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white transition-all duration-500 ease-out transform hover:!scale-105 hover:shadow-2xl ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                        style={{ transitionDelay: `${150 * (index + 1)}ms` }}
                    >
                        <div className="w-full h-40 mb-4 flex items-center justify-center">
                            <Lottie animationData={feature.anim} loop={true} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                        <p className="text-gray-600 text-sm">{feature.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}


// --- Main LandingPage Component ---
function LandingPage({ onLastSectionVisible }) {
    const [currentSectionIndex, setCurrentSectionIndex] = useState(-10);

    const sections = [
        { animation: expensetracker, title: "Track Expenses Effortlessly", description: "Our AI automatically categorizes your spending. See a real-time snapshot of your expenses with beautiful animations that bring your financial habits to life.", bgColor: "bg-gray-50" },
        { animation: money, title: "Manage Your Budget Smarter", description: "Plan your finances with customizable budgets. Receive timely alerts about your spending to avoid overages and stay aligned with your financial goals.", bgColor: "bg-white" },
        { animation: summary, title: "Comprehensive Financial Summaries", description: "Unlock powerful insights with detailed reports. Visualize your financial health through charts that highlight income, expenses, and savings patterns.", bgColor: "bg-gray-50" },
        { animation: trend, title: "Analyze Trends & Forecast the Future", description: "Understand the story behind your finances with trend analysis. Leverage AI-powered forecasts to anticipate cash flow and plan for long-term wellness.", bgColor: "bg-white" },
    ];

    const robotMessages = [
        "I'm your Genie! Let's categorize that receipt for you. Effortless tracking is my specialty.",
        "Want to save more this month? I can help you set the perfect budget and keep you on track.",
        "Check out these powerful insights! I summarize all your data to show you the bigger picture.",
        "Looking ahead! Based on your habits, I can forecast your cash flow for the next quarter.",
    ];
    
    const heroData = {
        title: "Welcome to Expense Genie",
        description: "Your smart financial assistant. Dive into a sleek, animation-rich experience designed to give you clarity and control over your finances from day one.",
        bgColor: "bg-white",
    };

    const handleSectionVisibility = (isVisible, index) => {
        if (isVisible) {
            setCurrentSectionIndex(index >= 0 ? index : -10);
        }
        const isLastFeatureSection = index === sections.length - 1;
        if (isLastFeatureSection && onLastSectionVisible) {
            onLastSectionVisible(isVisible);
        }
    };

    return (
        <div className="scroll-container h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth bg-gray-50">
            <StickyRobot
                currentSectionIndex={currentSectionIndex}
                sectionMessages={robotMessages}
            />
            <HeroSection
                title={heroData.title}
                description={heroData.description}
                bgColor={heroData.bgColor}
                onVisibleChange={handleSectionVisibility}
            />
            <KeyFeaturesSummary onVisibleChange={handleSectionVisibility} />
            {sections.map(({ animation, title, description, bgColor }, idx) => {
                const isAnimationRight = idx % 2 === 0;
                return (
                    <Section
                        key={idx}
                        bgColor={bgColor}
                        index={idx}
                        onVisibleChange={handleSectionVisibility}
                    >
                        {({ isVisible }) => (
                            <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-7xl mx-auto">
                                <div className={`w-full md:w-1/2 p-4 text-center md:text-left space-y-4 ${isAnimationRight ? "md:order-1" : "md:order-2"}`}>
                                    <AnimatedElement isVisible={isVisible} delay={100}>
                                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">{title}</h1>
                                    </AnimatedElement>
                                    <AnimatedElement isVisible={isVisible} delay={300}>
                                        <p className="text-xl text-gray-700 leading-relaxed">{description}</p>
                                    </AnimatedElement>
                                </div>
                                <div className={`w-full md:w-1/2 flex items-center justify-center p-4 ${isAnimationRight ? "md:order-2" : "md:order-1"}`}>
                                    <AnimatedElement isVisible={isVisible} delay={200}>
                                        <Lottie animationData={animation} loop={true} className="w-full max-w-md shadow-2xl rounded-2xl" />
                                    </AnimatedElement>
                                </div>
                            </div>
                        )}
                    </Section>
                );
            })}
        </div>
    );
}

export default LandingPage;