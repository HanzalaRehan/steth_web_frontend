import React from 'react';
import Header from '../../components/Header';
import Hero from './Components/Hero';

import MensBestSellers from './Components/MensBestSeller';
import ProductPage from './Components/Products';
import NewsletterSignup from '../../components/NewsletterSignup';
import AwsomeHumansFooter from '../../components/Footer';
import SEO from '../../components/SEO/SEO';

const MensPage = ({ children }) => {
  return (
    <div className="font-poppins min-h-screen flex flex-col w-full bg-white">
      <SEO
        title="Men's Scrubs"
        description="Shop STETH's Men's collection - premium medical scrubs, lab coats, and accessories built for the frontline, crafted for Pakistan's doctors, nurses, and students."
        canonicalPath="/men"
      />
      <Header />
      <Hero />
      <MensBestSellers />
      <ProductPage />
      <NewsletterSignup />
      <AwsomeHumansFooter />
      <main className="flex-grow">{children}</main>
    </div>
  );
};

export default MensPage;