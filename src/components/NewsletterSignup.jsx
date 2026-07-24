import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { trackFormSubmit } from '../lib/analytics';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs for animation
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const descriptionRef = useRef(null);
  const inputGroupRef = useRef(null);
  const discountRef = useRef(null);
  const discountTextRef = useRef(null);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (email) {
      try {
        const response = await fetch('https://steth-backend.onrender.com/api/subscribers/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Subscription failed');
        }

        setSubmitted(true);
        trackFormSubmit(window.location.pathname, 'newsletter');
      } catch (error) {
        console.error('Error subscribing to newsletter:', error);
        setError(error.message || 'Failed to subscribe. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Set up intersection observer to detect when element is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(sectionRef.current);
        }
      },
      {
        threshold: 0.2 // Trigger when 20% of the element is visible
      }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);
  
  // GSAP animations when section becomes visible
  useEffect(() => {
    if (!isVisible) {
      // Initial setup - hide elements
      gsap.set([headingRef.current, descriptionRef.current, inputGroupRef.current], { 
        opacity: 0, 
        y: 20 
      });
      
      gsap.set(discountRef.current, { 
        opacity: 0,
        scaleX: 0
      });
      
      gsap.set(discountTextRef.current, {
        opacity: 0
      });
      
      return;
    }
    
    // Create animation timeline when component becomes visible
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    
    // Animate elements in sequence
    tl.to(headingRef.current, { opacity: 1, y: 0, duration: 0.8 })
      .to(descriptionRef.current, { opacity: 1, y: 0, duration: 0.8 }, "-=0.5")
      .to(discountRef.current, { 
        opacity: 1, 
        scaleX: 1, 
        duration: 1 
      }, "-=0.5")
      .to(discountTextRef.current, { 
        opacity: 1, 
        duration: 0.8 
      })
      .to(inputGroupRef.current, { opacity: 1, y: 0, duration: 0.8 }, "-=0.5");
      
    // Continuous subtle animation for the discount text
    gsap.to(discountTextRef.current, {
      y: 3,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
    
    return () => {
      // Clean up animations
      tl.kill();
      gsap.killTweensOf(discountTextRef.current);
    };
  }, [isVisible]);
  
  return (
    <div ref={sectionRef} className="w-full bg-white text-black py-16 px-4 sm:px-6 md:px-8 lg:px-12">
      <div className="max-w-lg mx-auto relative">
        {!submitted ? (
          <>
            <h2 ref={headingRef} className="text-3xl font-extrabold mb-6 text-center">
              Join Our Newsletter
            </h2>
            
            <div className="mb-10 relative">
              <p ref={descriptionRef} className="text-gray-700 text-center">
                Sign up now and stay updated with our latest products and exclusive offers.
              </p>
              
              {/* Elegant discount banner */}
              <div className="mt-8 mb-8 relative h-16 flex items-center justify-center">
                <div 
                  ref={discountRef} 
                  className="absolute h-px w-full bg-black opacity-80 top-1/2"
                ></div>
                <div 
                  ref={discountTextRef}
                  className="relative px-6 py-2 bg-white"
                >
                  <span className="text-2xl font-bold tracking-widest">
                    10% OFF YOUR FIRST ORDER
                  </span>
                </div>
              </div>
            </div>
            
            <div ref={inputGroupRef}>
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-grow px-6 py-4 rounded-full border border-gray-300 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent shadow-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <button
                  onClick={handleSubmit}
                  className={`px-8 py-4 bg-black text-white font-medium rounded-full transition-all duration-300 hover:bg-gray-800 hover:shadow-lg ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? 'Subscribing...' : 'Subscribe'}
                </button>
              </div>
              {error && (
                <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
              )}
              <p className="text-gray-500 text-xs mt-4 text-center">
                By subscribing, you agree to our Privacy Policy and Terms of Service.
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-10">
            <h2 className="text-3xl font-extrabold mb-4">Thank You!</h2>
            <p className="text-gray-700">
              Thank you! For subscribing to our newsletter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}