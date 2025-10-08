import React, { useEffect, useState, useRef } from "react";
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Body from './components/Body/Body.jsx';
import LandingPage from "./components/LandingPage.jsx";

function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isFooterInView, setIsFooterInView] = useState(false);
  const footerRef = useRef(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setIsLoggedIn(true);
    }
  }, []);

  // --- NEW: This effect manages the page's scroll-snapping behavior ---
  useEffect(() => {
    const htmlElement = document.documentElement; // This targets the <html> tag

    if (!isLoggedIn) {
      // If we are showing the LandingPage, enable scroll snapping for the whole page.
      htmlElement.classList.add('snap-y', 'snap-mandatory', 'scroll-smooth');
    }


    return () => {
      htmlElement.classList.remove('snap-y', 'snap-mandatory', 'scroll-smooth');
    };
  }, [isLoggedIn]); // This effect re-runs whenever the login state changes.


  useEffect(() => {
    const footerElement = footerRef.current;
    if (footerElement) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          setIsFooterInView(entry.isIntersecting);
        },
        { threshold: 0.1 }
      );
      observer.observe(footerElement);
      return () => observer.disconnect();
    }
  }, [isLoggedIn]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-20">
        {isLoggedIn ? (
          <>
            <Body />
            <Footer />
          </>
        ) : (
          <>
            <LandingPage isFooterVisible={isFooterInView} />
            <Footer ref={footerRef} />
          </>
        )}
      </main>
    </div>
  );
}

export default Home;