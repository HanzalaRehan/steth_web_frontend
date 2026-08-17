import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Award, Gift, Percent, Check } from 'lucide-react';

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

  // One card treatment for all three. The previous version gave each tier its
  // own navy shade (#0B132B / #1C2541 / #3A506B), which read as three
  // unrelated blocks and implied a ranking that does not exist - these are
  // parallel benefits, not tiers. Matching the rewards page instead: light
  // surface, hairline border, outlined icon in a ring.
  const rewardTiers = [
    {
      icon: Percent,
      title: "First Order Discount",
      description: "An automatic 10% off your very first order when you register.",
      details: [
        "Instant savings on your first purchase",
        "No minimum spend required",
        "Applies to your entire first order"
      ]
    },
    {
      icon: Award,
      title: "Student Rewards",
      description: "A 5% discount for verified students, on everything.",
      details: [
        "Exclusive discount for students",
        "Quick, straightforward verification",
        "Applies to all product categories"
      ]
    },
    {
      icon: Gift,
      title: "Loyalty Points",
      description: "Earn 1 point for every 100 PKR spent, redeemable on future orders.",
      details: [
        "1 point = 1 PKR off",
        // Corrected: this previously read "Points never expire", which
        // contradicts the programme - points expire a year after they are
        // earned, and the rewards page shows customers that date.
        "Points stay valid for a year after you earn them",
        "Earn on every order, and from the rewards page"
      ]
    }
  ];

  return (
    <div className="bg-white flex flex-col items-center justify-center py-16 md:py-16">
      {/* Main content with padding */}
      <div className="container mx-auto px-4">
        {/* Main Rewards Section */}
        {/* Heading set to match the rewards page bands (HOW IT WORKS / HOW TO
            EARN POINTS) so the programme reads as one thing across the site. */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            REWARDS &amp; BENEFITS
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Three ways every Steth order gives something back.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {rewardTiers.map((tier, index) => {
            const Icon = tier.icon
            return (
              <div
                key={tier.title}
                ref={el => cardRefs.current[index] = el}
                className="flex flex-col rounded-2xl border border-gray-200 p-8 text-center transition-colors hover:border-gray-300"
              >
                <div className="mb-5 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gray-900">
                    <Icon className="h-7 w-7 text-gray-900" strokeWidth={1.5} />
                  </div>
                </div>

                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  {tier.title}
                </h3>
                <p className="mb-6 text-sm text-gray-500">
                  {tier.description}
                </p>

                <ul className="mt-auto space-y-2.5 text-left text-sm text-gray-700">
                  {tier.details.map((detail, idx) => (
                    <li key={idx} className="flex gap-2.5">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-gray-900" strokeWidth={2} />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
};

export default RewardsCTA;