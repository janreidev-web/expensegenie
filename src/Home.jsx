import React, { useEffect, useState } from "react";
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Body from './components/Body/Body.jsx';
import LandingPage from "./components/LandingPage.jsx";

function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showFooter, setShowFooter] = useState(false);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setIsLoggedIn(true);
    }
  }, []);

  // Callback passed to LandingPage to update footer visibility
  const handleLastSectionVisibility = (isVisible) => {
    setShowFooter(isVisible);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Section */}
      <Header />

      {/* Main Content */}
      <div className="flex-grow">
        {isLoggedIn ? (
          <>
            <Body />
            {/* Show footer always if logged in */}
            <Footer />
          </>
        ) : (
          <>
            <LandingPage onLastSectionVisible={handleLastSectionVisibility} />
            {/* Show footer only when last section is visible */}
            {showFooter && <Footer />}
          </>
        )}
      </div>
    </div>
  );
}

export default Home;
