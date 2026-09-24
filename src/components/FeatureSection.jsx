import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Local icon imports
import FreeShippingIcon from '../assets/icons/2.png';
import Support247Icon from '../assets/icons/1.png';
import MoneyReturnIcon from '../assets/icons/3.png';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const FeatureSection = () => {
  const sectionRef = useRef(null);
  const featuresRef = useRef([]);

  useEffect(() => {
    const features = featuresRef.current;
    
    // Ensure GSAP animation works on both mobile and desktop
    const animationContext = gsap.context(() => {
      gsap.fromTo(
        features, 
        { 
          opacity: 0, 
          y: 50,
          scale: 0.9 
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          stagger: 0.2,
          ease: 'power2.out'
        }
      );
    }, sectionRef);

    // Cleanup function
    return () => animationContext.revert();
  }, []);

  const features = [
    {
      icon: FreeShippingIcon,
      title: 'Free Shipping',
      description: ' Free shipping on orders over 5000/-'
    },
    {
      icon: Support247Icon,
      title: 'Support 24/7',
      description: 'Our team is always on call '
    },
    {
      icon: MoneyReturnIcon,
      title: 'Fast and Secure Checkout',
      description: 'Easier than taking your daily vitamins'
    }
  ];

  return (
    <section
      ref={sectionRef}
      className="w-full px-4 py-16 bg-navy"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center gap-4 mb-10">
          <span className="block w-10 h-[2px] bg-brass"></span>
          <p className="text-center font-archivo text-xs md:text-sm font-semibold uppercase tracking-[0.3em] text-brass">
            For doctors, by doctors
          </p>
          <span className="block w-10 h-[2px] bg-brass"></span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-8 w-full">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              ref={el => featuresRef.current[index] = el}
              className="flex flex-col items-center text-center text-paper space-y-3 p-4 md:p-6 w-full"
            >
              <div className="w-16 h-16 mb-2 flex items-center justify-center border border-brass/40">
                <img
                  src={feature.icon}
                  alt={feature.title}
                  className="max-w-[60%] max-h-[60%] object-contain [filter:brightness(0)_invert(1)]"
                />
              </div>
              <h3 className="font-caslon text-lg md:text-2xl">
                {feature.title}
              </h3>
              <p className="font-spectral text-sm md:text-base text-[#A8B0C8] px-2">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;