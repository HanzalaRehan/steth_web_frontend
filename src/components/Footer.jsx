import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../pages/Login&Signup/AuthContext';
import { useAccountOverlay } from '../context/AccountContext';

const AwesomeHumansFooter = () => {
  const { isLoggedIn, openAuthPanel } = useContext(AuthContext);
  const { openAccountOverlay } = useAccountOverlay();

  const handleMyOrdersClick = (e) => {
    e.preventDefault();
    if (isLoggedIn) {
      openAccountOverlay('orders');
    } else {
      openAuthPanel('login');
    }
  };

  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-20">
        <div className="flex flex-col md:flex-row space-y-8 md:space-y-0">
          <div className="w-full md:w-1/4 pr-8">
            <h1 className="text-4xl font-bold mb-4">#STETHSET</h1>
            <p className="text-gray-400 mb-6">#WEARSTETH</p>

            <div className="flex space-x-4 mb-8">
              <a href="https://www.instagram.com/steth.20/profilecard/?igsh=eThiNHNzdjVwOW4z" className="text-gray-400 hover:text-white" target="_blank" rel="noopener noreferrer">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              {/* Facebook and TikTok - placeholder hrefs, no real URLs yet
                  (confirmed with the user). Swap these for the real profile
                  links whenever they're available. */}
              <a href="#" className="text-gray-400 hover:text-white" target="_blank" rel="noopener noreferrer" title="Facebook (placeholder link)">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white" target="_blank" rel="noopener noreferrer" title="TikTok (placeholder link)">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="w-full md:w-3/4 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold mb-4">SHOP</h4>
              <ul className="space-y-2">
                <li><Link to="/women" className="text-gray-400 hover:text-white">Women</Link></li>
                <li><Link to="/men" className="text-gray-400 hover:text-white">Men</Link></li>
                <li><Link to="/gift-cards" className="text-gray-400 hover:text-white">Gift Cards</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">ABOUT</h4>
              <ul className="space-y-2">
                <li><Link to="/aboutus#our-story" className="text-gray-400 hover:text-white">Our Story</Link></li>
                <li><Link to="/blog" className="text-gray-400 hover:text-white">Blog</Link></li>
                <li><Link to="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-gray-400 hover:text-white">Terms and Conditions</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">HELP</h4>
              <ul className="space-y-2">
                <li><Link to="/faqs" className="text-gray-400 hover:text-white">FAQs</Link></li>
                <li><a href="/profile" onClick={handleMyOrdersClick} className="text-gray-400 hover:text-white">My Orders</a></li>
                <li><Link to="/students" className="text-gray-400 hover:text-white">Student Program</Link></li>
                <li><Link to="/rewards" className="text-gray-400 hover:text-white">Loyalty Program</Link></li>
                <li><Link to="/affiliate" className="text-gray-400 hover:text-white">Affiliate Program</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400 mb-4 md:mb-0">© {new Date().getFullYear()} STETH, INC. ALL RIGHTS RESERVED</p>

          <div className="flex items-center">
            <span className="text-sm text-gray-400 mr-2">PAKISTAN | ENGLISH</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AwesomeHumansFooter;
