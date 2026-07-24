import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const TermsAndConditions = () => {
  const pageRef = useRef(null);
  const titleRef = useRef(null);
  const sectionsRef = useRef([]);

  useEffect(() => {
    // Add fonts and styles directly without API calls
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'Poppins';
        font-style: normal;
        font-weight: 300;
        font-display: swap;
        src: url('/fonts/poppins-v20-latin-300.woff2') format('woff2');
      }
      
      @font-face {
        font-family: 'Poppins';
        font-style: normal;
        font-weight: 400;
        font-display: swap;
        src: url('/fonts/poppins-v20-latin-regular.woff2') format('woff2');
      }
      
      @font-face {
        font-family: 'Poppins';
        font-style: normal;
        font-weight: 500;
        font-display: swap;
        src: url('/fonts/poppins-v20-latin-500.woff2') format('woff2');
      }
      
      @font-face {
        font-family: 'Poppins';
        font-style: normal;
        font-weight: 600;
        font-display: swap;
        src: url('/fonts/poppins-v20-latin-600.woff2') format('woff2');
      }
      
      @font-face {
        font-family: 'Poppins';
        font-style: normal;
        font-weight: 700;
        font-display: swap;
        src: url('/fonts/poppins-v20-latin-700.woff2') format('woff2');
      }
      
      html, body, #root {
        height: 100%;
        margin: 0;
        padding: 0;
        width: 100%;
        overflow-x: hidden;
      }
      
      .font-poppins {
        font-family: 'Poppins', sans-serif;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    if (!pageRef.current) return;

    // Create a context to prevent conflicts
    const ctx = gsap.context(() => {
      // Initial animations
      const tl = gsap.timeline();

      // Animate title
      tl.fromTo(
        titleRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
      );

      // Animate sections with a stagger effect
      gsap.fromTo(
        sectionsRef.current,
        { 
          y: 50, 
          opacity: 0 
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: pageRef.current,
            start: "top center",
            toggleActions: "play none none reverse"
          }
        }
      );
    }, pageRef);

    return () => ctx.revert();
  }, []);

  const addToRefs = (el) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el);
    }
  };

  return (
    <div className="font-poppins min-h-screen flex flex-col w-full bg-white">
      <Header />
      <main ref={pageRef} className="flex-grow py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 
              ref={titleRef}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4"
            >
              Terms and Conditions
            </h1>
            <p className="text-lg text-gray-600">
              Effective Date: May 05, 2025
            </p>
          </div>

          <div className="space-y-12">
            {/* Welcome Section */}
            <section ref={addToRefs} className="bg-gray-50 p-8 rounded-2xl shadow-sm">
              <p className="text-lg text-gray-700 leading-relaxed">
                Welcome to STETH ("we", "us", or "our"). These Terms and Conditions govern your use of our website, purchases, and related services in Pakistan. By accessing or purchasing from Steth, you agree to the following:
              </p>
            </section>

            {/* Products and Pricing */}
            <section ref={addToRefs} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Products and Pricing</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-black mr-2">•</span>
                  All products listed are subject to availability.
                </li>
                <li className="flex items-start">
                  <span className="text-black mr-2">•</span>
                  We reserve the right to change product details, prices, and availability without prior notice.
                </li>
                <li className="flex items-start">
                  <span className="text-black mr-2">•</span>
                  Prices are in Pakistani Rupees (PKR) and include applicable taxes unless stated otherwise.
                </li>
              </ul>
            </section>

            {/* Orders and Payments */}
            <section ref={addToRefs} className="bg-gray-50 p-8 rounded-2xl shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Orders and Payments</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-black mr-2">•</span>
                  Orders are confirmed only upon receiving the confirmation mail.
                </li>
                <li className="flex items-start">
                  <span className="text-black mr-2">•</span>
                  We accept payments through COD (Cash on Delivery) and bank transfers (Debit Cards).
                </li>
                <li className="flex items-start">
                  <span className="text-black mr-2">•</span>
                  Steth reserves the right to cancel or refuse any order at our discretion (e.g. suspected fraud, inventory issues etc).
                </li>
              </ul>
            </section>

            {/* Shipping and Delivery */}
            <section ref={addToRefs} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Shipping and Delivery</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-black mr-2">•</span>
                  We offer nationwide shipping across Pakistan.
                </li>
                <li className="flex items-start">
                  <span className="text-black mr-2">•</span>
                  Standard delivery timelines are 3-7 working days, but delays may occur during peak seasons or unforeseen events.
                </li>
                <li className="flex items-start">
                  <span className="text-black mr-2">•</span>
                  Delivery charges will be mentioned at checkout, if applicable.
                </li>
              </ul>
            </section>

            {/* Returns and Exchanges */}
            <section ref={addToRefs} className="bg-gray-50 p-8 rounded-2xl shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Returns and Exchanges</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-black mr-2">•</span>
                  We accept returns/exchanges within 7 days of delivery for unworn, unwashed, and undamaged items with original tags.
                </li>
                <li className="flex items-start">
                  <span className="text-black mr-2">•</span>
                  Customised or personalised products are non-returnable unless defective.
                </li>
                <li className="flex items-start">
                  <span className="text-black mr-2">•</span>
                  Return shipping charges may apply unless the item is defective or wrong.
                </li>
              </ul>
            </section>

            {/* Intellectual Property */}
            <section ref={addToRefs} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Intellectual Property</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-black mr-2">•</span>
                  All content on the website, including logos, designs, images, and text is Steth's exclusive property and is protected by Pakistani copyright and trademark laws.
                </li>
                <li className="flex items-start">
                  <span className="text-black mr-2">•</span>
                  Unauthorised use or reproduction is strictly prohibited.
                </li>
              </ul>
            </section>

            {/* Privacy Policy */}
            <section ref={addToRefs} className="bg-gray-50 p-8 rounded-2xl shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Privacy Policy</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-black mr-2">•</span>
                  Your personal information is collected, used, and protected according to our Privacy Policy.
                </li>
                <li className="flex items-start">
                  <span className="text-black mr-2">•</span>
                  We prioritise confidentiality and do not sell or share customer data with third parties without consent, except where required by law.
                </li>
              </ul>
            </section>

            {/* Limitation of Liability */}
            <section ref={addToRefs} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitation of Liability</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-black mr-2">•</span>
                  Steth shall not be liable for any indirect, incidental, or consequential damages arising out of the use of our products or website.
                </li>
                <li className="flex items-start">
                  <span className="text-black mr-2">•</span>
                  Our total liability is limited to the amount paid by the customer for the purchased product.
                </li>
              </ul>
            </section>

            {/* Governing Law */}
            <section ref={addToRefs} className="bg-gray-50 p-8 rounded-2xl shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Governing Law and Dispute Resolution</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-black mr-2">•</span>
                  These terms are governed by the laws of Pakistan.
                </li>
                <li className="flex items-start">
                  <span className="text-black mr-2">•</span>
                  Any disputes shall be resolved amicably; failing that, they shall be subject to the exclusive jurisdiction of the courts of Pakistan.
                </li>
              </ul>
            </section>

            {/* Changes to Terms */}
            <section ref={addToRefs} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Changes to Terms</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-black mr-2">•</span>
                  Steth may modify these terms at any time. Changes will be effective upon posting on our website.
                </li>
                <li className="flex items-start">
                  <span className="text-black mr-2">•</span>
                  Continued use after changes constitutes your acceptance of the new Terms.
                </li>
              </ul>
            </section>

            {/* Contact Information */}
            <section ref={addToRefs} className="bg-gray-50 p-8 rounded-2xl shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Information</h2>
              <p className="text-gray-700 mb-4">For any queries, concerns, or support, please contact us at:</p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-black mr-2">•</span>
                  Email: info@stethset.com
                </li>
                <li className="flex items-start">
                  <span className="text-black mr-2">•</span>
                  Phone: +92 3390001306
                </li>
              </ul>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsAndConditions; 