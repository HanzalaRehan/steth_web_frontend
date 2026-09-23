import React, { useState, useEffect, useContext } from 'react';
import { X, Tag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../Login&Signup/AuthContext';

// Same seen-once convention as GenderQuickSelect.jsx's STORAGE_KEY: persisted
// in localStorage (not sessionStorage) so a visitor who has already crossed
// the modal once doesn't see it again on a later re-navigation to the
// homepage, in this visit or a future one.
const STORAGE_KEY = "steth_discount_popup_seen";

const RegistrationPopup = ({ canStart = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const { isLoggedIn, isLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Only show popup if user is not logged in, not loading, hasn't already
    // seen (and dismissed/acted on) it before, and the homepage's gender
    // quick-select prompt (if it's showing) has already been dismissed -
    // otherwise a first-time logged-out visitor would see both modals
    // stacked. canStart defaults to true so nothing changes for returning
    // visitors who never see the gender prompt at all.
    const alreadySeen = typeof window !== "undefined" && window.localStorage.getItem(STORAGE_KEY);
    if (!isLoggedIn && !isLoading && canStart && !alreadySeen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, isLoading, canStart]);

  const markSeen = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "true");
    }
  };

  const closePopup = () => {
    markSeen();
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
    <div className={`fixed inset-0 flex items-center justify-center z-50 bg-ink/60 backdrop-blur-sm transition-all duration-300 ${
      isClosing ? 'opacity-0' : 'opacity-100'
    }`}>
      <div className={`relative bg-shirting border border-hairline p-8 sm:p-10 max-w-lg w-full mx-8 sm:mx-4 shadow-2xl transform transition-all duration-300 ${
        isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
      }`}>
        {/* Close button */}
        <button
          onClick={closePopup}
          className="absolute right-5 top-5 bg-transparent text-flannel/70 hover:text-claret transition-colors"
          aria-label="Close popup"
        >
          <X size={20} />
        </button>

        {/* Discount plaque - purely decorative and overlaps the close
            button's corner, so it must not intercept clicks meant for it. */}
        <div className="absolute -top-5 -right-5 sm:-top-6 sm:-right-6 bg-navy text-paper flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 border border-brass rotate-3 pointer-events-none">
          <span className="font-caslon text-xl sm:text-2xl">10%</span>
        </div>

        {/* Content */}
        <div className="flex flex-col items-center text-center space-y-6 pt-4">
          {/* Icon */}
          <div className="border border-brass p-4">
            <Tag size={28} className="text-brass" strokeWidth={1.5} />
          </div>

          {/* Heading */}
          <h2 className="font-caslon text-3xl sm:text-4xl text-navy leading-tight">Get 10% Off</h2>

          {/* Decorative element */}
          <div className="w-16 h-[2px] bg-brass"></div>

          {/* Description */}
          <p className="text-ink text-lg font-spectral">
            Sign up and get <span className="font-semibold">10% off your first order</span>
          </p>

          {/* CTA Button */}
          <button
            onClick={navigateToRegister}
            className="w-full bg-navy hover:bg-ink text-paper font-archivo font-semibold uppercase tracking-[0.2em] text-sm py-4 px-8 transition-colors duration-200 flex items-center justify-center gap-3"
            aria-label="Create account"
          >
            <span>Create Account</span>
            <ArrowRight size={18} />
          </button>

          {/* Fine print */}
          <p className="text-sm font-spectral italic text-flannel max-w-lg">
            Subscribe to our newsletter and be the first one to hear about our new arrivals, special promotions and limited editions
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPopup;