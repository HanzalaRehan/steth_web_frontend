import React, { useState, useEffect, useContext } from 'react';
import { X, Tag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../Login&Signup/AuthContext';

const RegistrationPopup = ({ canStart = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const { isLoggedIn, isLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Only show popup if user is not logged in, not loading, and the
    // homepage's gender quick-select prompt (if it's showing) has already
    // been dismissed - otherwise a first-time logged-out visitor would see
    // both modals stacked. canStart defaults to true so nothing changes for
    // returning visitors who never see the gender prompt at all.
    if (!isLoggedIn && !isLoading && canStart) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, isLoading, canStart]);

  const closePopup = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 300); // Match this duration with your CSS transition
  };

  const navigateToRegister = () => {
    closePopup();
    navigate("/signup");
  };

  // Don't render anything if:
  // - Still checking auth status
  // - User is logged in
  // - Popup is closed
  if (isLoading || isLoggedIn || !isOpen) return null;

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60 backdrop-blur-sm transition-all duration-300 ${
      isClosing ? 'opacity-0' : 'opacity-100'
    }`}>
      <div className={`relative bg-white rounded-lg p-8 max-w-2xl w-full mx-8 sm:mx-4 shadow-2xl transform transition-all duration-300 ${
        isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
      }`}>
        {/* Close button */}
        <button 
          onClick={closePopup}
          className="absolute right-6 top-6 bg-white text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Close popup"
        >
          <X size={24} />
        </button>

        {/* Discount badge */}
        <div className="absolute -top-6 -right-6 sm:-top-8 sm:-right-8 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-bold rounded-full p-4 sm:p-5 shadow-lg flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 transform rotate-12">
          <span className="text-lg sm:text-xl">10%</span>
        </div>

        {/* Content */}
        <div className="flex flex-col items-center text-center space-y-8 pt-4">
          {/* Icon */}
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-4 rounded-full">
            <Tag size={32} className="text-gray-800" />
          </div>

          {/* Heading */}
          <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Get 10% Off</h2>

          {/* Decorative element */}
          <div className="w-32 h-1 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full"></div>

          {/* Description */}
          <p className="text-gray-700 text-lg">
            Sign up and get <span className="font-semibold text-gray-900">10% off your first order</span>
          </p>

          {/* CTA Button */}
          <button
            onClick={navigateToRegister}
            className="w-full bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-gray-950 text-white font-medium py-4 px-8 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 text-lg"
            aria-label="Create account"
          >
            <span>Create Account</span>
            <ArrowRight size={20} />
          </button>

          {/* Fine print */}
          <p className="text-sm text-gray-600 max-w-lg">
            Subscribe to our newsletter and be the first one to hear about our new arrivals, special promotions and limited editions
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPopup;