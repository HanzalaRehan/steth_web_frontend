import React from 'react';
import Header from '../../components/Header';
import Hero from './Components/Hero';

import WomenBestSellers from './Components/WomenBestSellers';
import ProductPage from './Components/Products';
import NewsletterSignup from '../../components/NewsletterSignup';
import AwsomeHumansFooter from '../../components/Footer';
import SEO from '../../components/SEO/SEO';

const WomenPage = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col w-full bg-paper">
      <SEO
        title="Women's Scrubs"
        description="Shop STETH's Women's collection - premium medical scrubs, lab coats, and accessories designed for Pakistan's doctors, nurses, and students."
        canonicalPath="/women"
      />
      <div className="relative">
        <Header transparent />
        <Hero />
      </div>
      <WomenBestSellers />
      <ProductPage />
      <NewsletterSignup />
      <AwsomeHumansFooter />
      <main className="flex-grow">{children}</main>
    </div>
  );
};

export default WomenPage;