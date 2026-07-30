import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Award, Gift, Percent } from 'lucide-react';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const RewardsCTA = () => {
  const cardRefs = useRef([]);

  useEffect(() => {
    // Card animations
    cardRefs.current.forEach((card, index) => {
      gsap.fromTo(
        card,
        {
          opacity: 0,
          y: 50,
          scale: 0.9
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          delay: index * 0.2,
          ease: 'power3.out'
        }
      );
    });
  }, []);

  const rewardTiers = [
    {
      icon: <Percent className="w-12 h-12 text-white" />,
      title: "First Order Discount",
      description: "Enjoy an automatic 10% off on your very first order when you register.",
      details: [
        "Instant savings on your first purchase",
        "No minimum spend required",
        "Applies to entire first order"
      ],
      bgColor: "bg-[#0B132B]"
    },
    {
      icon: <Award className="w-12 h-12 text-white" />,
      title: "Student Rewards",
      description: "Special 5% discount for verified students across all purchases.",
      details: [
        "Exclusive discount for students",
        "Verification process is quick and easy",
        "Applicable on all product categories"
      ],
      bgColor: "bg-[#1C2541]"
    },
    {
      icon: <Gift className="w-12 h-12 text-white" />,
      title: "Loyalty Points System",
      description: "Earn 1 point for every 100 PKR spent, redeemable on future purchases.",
      details: [
        "1 point = 1 PKR discount",
        "Points never expire",
        "Accumulate across multiple orders"
      ],
      bgColor: "bg-[#3A506B]"
    }
  ];

  return (
    <div className="bg-white flex flex-col items-center justify-center py-16 md:py-16">
      {/* Main content with padding */}
      <div className="container mx-auto px-4">
        {/* Main Rewards Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Rewards & Exclusive Benefits
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Unlock a world of savings and personalized rewards with our comprehensive program
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 ">
          {rewardTiers.map((tier, index) => (
            <div 
              key={tier.title}
              ref={el => cardRefs.current[index] = el}
              className={`
                ${tier.bgColor} 
                rounded-2xl 
                p-6 
                transform 
                transition-all 
                duration-300 
                hover:shadow-lg
                flex 
                flex-col 
                items-center 
                text-center
                text-white
              `}
            >
              <div className="mb-6">
                {tier.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4">
                {tier.title}
              </h3>
              <p className="text-gray-300 mb-6">
                {tier.description}
              </p>
              <ul className="text-left text-sm text-gray-200 mb-6 space-y-2">
                {tier.details.map((detail, idx) => (
                  <li key={idx} className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {detail}
                  </li>
                ))}
              </ul>
             
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RewardsCTA;