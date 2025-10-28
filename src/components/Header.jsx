import { useState, useEffect, useRef } from "react";
// --- NEW: Import useLocation to track the current page ---
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/images/logo.png";

// --- User Avatar Component ---
const UserAvatar = ({ username, onClick }) => (
    <button onClick={onClick} className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-100">
        {username ? username.charAt(0).toUpperCase() : 'U'}
    </button>
);

// --- Main Header Component ---
const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [username, setUsername] = useState("");

    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    // --- NEW: Get the current location object ---
    const location = useLocation();

    const navLinks = [
        { name: "Home", path: "/" },
        { name: "Features", path: "/features" },
        { name: "Contact", path: "/contact" },
    ];

    useEffect(() => {
        // ... (existing useEffect is unchanged)
        const checkLoginStatus = () => {
            const loggedIn = localStorage.getItem("isLoggedIn") === "true";
            const storedUsername = localStorage.getItem("username") || "";
            setIsLoggedIn(loggedIn);
            setUsername(storedUsername);
        };
        checkLoginStatus();
        window.addEventListener("loginStatusChanged", checkLoginStatus);
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            window.removeEventListener("loginStatusChanged", checkLoginStatus);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        // ... (existing handleLogout function is unchanged)
        setIsLoggingOut(true);
        setTimeout(() => {
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("username");
            setIsLoggedIn(false);
            setUsername("");
            setIsLoggingOut(false);
            setIsDropdownOpen(false);
            navigate("/login");
            window.dispatchEvent(new Event("loginStatusChanged"));
        }, 1500);
    };

    return (
        <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md shadow-sm text-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <Link to="/" className="flex items-center gap-3 shrink-0" onClick={() => setIsMobileMenuOpen(false)}>
                        <img src={logo} alt="Expense Genie Logo" className="h-12 w-12" />
                        <span className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-teal-500 italic">
                            Expense Genie
                        </span>
                    </Link>

                    {/* Desktop Navigation - Hidden */}
                    {/* {!isLoggedIn && (
                        <div className="hidden lg:flex items-center gap-2">
                            {navLinks.map((link) => {
                                const isActive = location.pathname === link.path;
                                return (
                                    <Link key={link.name} to={link.path} className={`px-4 py-2 text-base font-medium relative group ${isActive ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-500'}`}>
                                        {link.name}
                                        <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 transition-transform origin-center duration-300 ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
                                    </Link>
                                );
                            })}
                        </div>
                    )} */}
                    
                    {/* Auth buttons */}
                    <div className="flex items-center gap-4 ml-6">
                        {isLoggedIn ? (
                            <div className="relative" ref={dropdownRef}>
                                <UserAvatar username={username} onClick={() => setIsDropdownOpen(!isDropdownOpen)} />
                                <div className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl py-1 transition-all duration-300 ease-out transform ${isDropdownOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                                    <div className="px-4 py-2 border-b">
                                        <p className="text-sm text-gray-500">Signed in as</p>
                                        <p className="font-semibold truncate">{username}</p>
                                    </div>
                                    <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100" disabled={isLoggingOut}>
                                        {isLoggingOut ? "Signing out..." : "Sign out"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Link to="/signup" className="bg-indigo-500 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-indigo-600 transition-all duration-300 transform hover:scale-105 shadow-md">
                                Get Started
                            </Link>
                        )}
                    </div>
                    {/* Mobile menu button - Hidden */}
                    {/* <div className="lg:hidden">
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                            <span className="sr-only">Open menu</span>
                            <div className="w-6 h-6 flex flex-col justify-around">
                                <span className={`block h-0.5 bg-gray-800 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'rotate-45 translate-y-[5px]' : ''}`}></span>
                                <span className={`block h-0.5 bg-gray-800 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                                <span className={`block h-0.5 bg-gray-800 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? '-rotate-45 -translate-y-[5px]' : ''}`}></span>
                            </div>
                        </button>
                    </div> */}
                </div>
            </div>

            {/* Mobile Navigation Menu - Hidden */}
            {/* <div className={`lg:hidden transition-all duration-500 ease-in-out overflow-hidden ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-2 pt-2 pb-8 space-y-2 text-center border-t">
                    {navLinks.map((link) => {
                        const isActive = location.pathname === link.path;
                        return (
                            <Link key={link.name} to={link.path} className={`block px-3 py-3 rounded-md text-lg font-medium ${isActive ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-100'}`} onClick={() => setIsMobileMenuOpen(false)}>
                                {link.name}
                            </Link>
                        );
                    })}
                    <div className="mt-6">
                         {isLoggedIn ? (
                            <div className="flex flex-col items-center gap-4">
                                <p className="font-semibold text-lg">{username}</p>
                                <button onClick={handleLogout} className="w-full max-w-xs px-4 py-3 rounded-md font-semibold bg-red-500 text-white" disabled={isLoggingOut}>
                                    {isLoggingOut ? "Signing out..." : "Sign out"}
                                </button>
                            </div>
                        ) : (
                            <Link to="/signup" className="block w-full max-w-xs mx-auto bg-indigo-500 text-white px-5 py-3 rounded-lg font-semibold hover:bg-indigo-600 transition-all duration-300" onClick={() => setIsMobileMenuOpen(false)}>
                                Get Started
                            </Link>
                        )}
                    </div>
                </div>
            </div> */}
        </nav>
    );
};

export default Header;