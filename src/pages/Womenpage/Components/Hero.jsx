import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../../../utils/imageUrl";
import { API_BASE_URL } from "../../../config/api";

// Register ScrollTrigger with GSAP
gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const imageRef = useRef(null);
  const contentRef = useRef(null);
  const headingRef = useRef(null);
  const descRef = useRef(null);
  const buttonsRef = useRef(null);
  const [images, setImages] = useState({
    web: "",
    mobile: ""
  });

  const scrollToProducts = () => {
    navigate('/women');
    setTimeout(() => {
      const productsSection = document.getElementById('products');
      if (productsSection) {
        // #9 - plain scrollIntoView lands the target's top right at the
        // viewport top, which the sticky header then covers. Measuring the
        // header's actual live height (rather than a guessed static value -
        // Header.jsx's own height already varies by breakpoint) and
        // subtracting it keeps this correct even if the header's size
        // changes later.
        const header = document.querySelector('header');
        const headerHeight = header ? header.offsetHeight : 0;
        const targetTop = productsSection.getBoundingClientRect().top + window.scrollY - headerHeight;
        window.scrollTo({ top: targetTop, behavior: 'smooth' });
      }
    }, 100);
  };

  useEffect(() => {
    // Fetch hero images
    const fetchHeroImages = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/hero-images/womens`);
        if (response.data.success) {
          setImages({
            web: response.data.data.web?.imageUrl || "",
            mobile: response.data.data.mobile?.imageUrl || ""
          });
        }
      } catch (error) {
        console.error('Error fetching hero images:', error);
      }
    };

    fetchHeroImages();
  }, []);

  useEffect(() => {
    // #2 - scoped to this component with gsap.context() instead of the
    // previous `ScrollTrigger.getAll().forEach(kill)` cleanup, which
    // killed every ScrollTrigger on the page, not just this component's own.
    const ctx = gsap.context(() => {
      // Initial animations
      const tl = gsap.timeline();

      // Animate hero container
      tl.fromTo(
        heroRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.8, ease: "power2.inOut" }
      );

      // Animate background image
      tl.fromTo(
        imageRef.current,
        { scale: 1.1, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1, ease: "power2.out" },
        "-=0.4"
      );

      // Animate content
      tl.fromTo(
        contentRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "back.out(1.7)" },
        "-=0.6"
      );

      // Animate heading
      tl.fromTo(
        headingRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.7)" },
        "-=0.5"
      );

      // Animate description
      tl.fromTo(
        descRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
        "-=0.4"
      );

      // Animate buttons
      tl.fromTo(
        buttonsRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
        "-=0.3"
      );

      // ScrollTrigger for parallax effect - targets the shared image
      // wrapper (imageRef, moved off the mobile-only <img>) so the effect
      // is actually visible on desktop too, not just running invisibly
      // against a display:none element. will-change is toggled on only
      // while the trigger is actually active, not left on permanently.
      gsap.to(imageRef.current, {
        y: 50,
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
          onToggle: (self) => {
            imageRef.current.style.willChange = self.isActive ? "transform" : "auto";
          }
        }
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="relative w-full h-[100svh] md:h-[85vh] font-poppins overflow-hidden">
      {/* #4 - loading skeleton while the API-fetched image URLs are still
          empty, instead of an empty <img> with nothing visible. */}
      {!images.web && !images.mobile && (
        <div className="absolute inset-0 w-full h-full bg-gray-200 animate-pulse" />
      )}

      {/* Hero Background with responsive images */}
      <div className="absolute inset-0 w-full h-full">
        <div ref={imageRef} className="relative w-full h-full">
          {/* Mobile Image */}
          <img
            src={getImageUrl(images.mobile, { width: 800 })}
            alt="Medical professionals in scrubs"
            className="md:hidden w-full h-full object-cover object-center"
          />
          {/* Desktop Image */}
          <img
            src={getImageUrl(images.web, { width: 1600 })}
            alt="Medical professionals in scrubs"
            className="hidden md:block w-full h-full object-cover object-center"
          />
          {/* Single, lighter bottom-anchored scrim - matches the Homepage
              Hero's treatment, replacing the previous two stacked overlays. */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
        </div>
      </div>

      {/* Hero Content Overlay */}
      <div className="relative h-full flex flex-col items-center justify-end text-center px-4 pb-16 sm:pb-20 md:pb-24">
        <div
          ref={contentRef}
          className="max-w-3xl mx-auto"
        >
          <h1
            ref={headingRef}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white drop-shadow-lg text-balance"
          >
            STETH WOMEN'S COLLECTION
          </h1>
          <p
            ref={descRef}
            className="text-base sm:text-lg md:text-xl max-w-xl mx-auto mt-4 mb-8 sm:mb-10 text-white leading-relaxed px-2 sm:px-4 drop-shadow-md"
          >
            For the women who run the code and the wardrobe.
          </p>
          <div
            ref={buttonsRef} 
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-2 sm:px-4"
          >
            <button
              onClick={scrollToProducts}
              className="group relative px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-white text-black text-sm sm:text-base font-medium uppercase tracking-wide rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl shadow-lg border-2 border-black"
              onMouseEnter={(e) => {
                gsap.to(e.target, {
                  scale: 1.05,
                  duration: 0.3,
                  ease: "power2.out"
                });
                gsap.to(e.target.querySelector('.button-shine'), {
                  x: '100%',
                  duration: 0.6,
                  ease: "power2.inOut"
                });
              }}
              onMouseLeave={(e) => {
                gsap.to(e.target, {
                  scale: 1,
                  duration: 0.3,
                  ease: "power2.out"
                });
                gsap.to(e.target.querySelector('.button-shine'), {
                  x: '-100%',
                  duration: 0.6,
                  ease: "power2.inOut"
                });
              }}
            >
              <span className="relative z-10">Shop Women</span>
              <div className="button-shine absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-transparent -translate-x-full"></div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;