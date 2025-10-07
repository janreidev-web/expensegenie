// Footer.jsx
import { Link } from "react-router-dom";
import logo from "../assets/images/logo.png";

// Social Media Icons (Self-contained SVG components)
const SocialIcon = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-300">
    <span className="sr-only">{children.type}</span>
    {children}
  </a>
);

const TwitterIcon = () => (
    <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
    </svg>
);

const GithubIcon = () => (
    <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.168 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z" clipRule="evenodd"></path>
    </svg>
);


const Footer = () => {
  const linkSections = [
    {
      title: "Product",
      links: [
        { name: "Home", path: "/" },
        { name: "Features", path: "/#features" },
        { name: "Pricing", path: "/pricing" },
        { name: "Dashboard", path: "/dashboard" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", path: "/about" },
        { name: "Contact", path: "/contact" },
        { name: "Careers", path: "/careers" },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", path: "/privacy" },
        { name: "Terms of Service", path: "/terms" },
      ],
    },
  ];

  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="Expense Genie Logo" className="h-10 w-10" />
              <span className="font-bold text-xl text-white italic">
                Expense Genie
              </span>
            </Link>
            <p className="text-sm">Your smart financial assistant.</p>
            <div className="flex space-x-4">
                <SocialIcon href="https://x.com"><TwitterIcon /></SocialIcon>
                <SocialIcon href="https://github.com"><GithubIcon /></SocialIcon>
            </div>
          </div>

          {/* Links Sections */}
          {linkSections.map((section) => (
            <div key={section.title} className="md:justify-self-center">
              <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">
                {section.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link to={link.path} className="text-base text-gray-400 hover:text-white transition-colors duration-300">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-gray-800 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Expense Genie. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;