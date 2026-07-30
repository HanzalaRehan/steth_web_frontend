import React, { useState } from 'react';
import Header from '../../components/Header';
import Hero from './Components/Hero';
import BestSellers from './Components/WomenBestSellers';
import FeatureSection from '../../components/FeatureSection';
import MensBestSellers from './Components/MensBestSeller';
import RewardsCTA from '../../components/DiscountOffers';
import NewsletterSignup from '../../components/NewsletterSignup';
import ColorTileCarousel from './Components/ColorTileCarousal';
import AwsomeHumansFooter from '../../components/Footer';
import RegistrationPopup from './Components/PopUp';
import GenderQuickSelect from './Components/GenderQuickSelect';
import SEO from '../../components/SEO/SEO';
import organizationSchema from '../../components/SEO/organizationSchema';

const Homepage = ({ children }) => {
  // Gates RegistrationPopup's 1.5s timer so a first-time visitor never sees
  // it stacked with GenderQuickSelect - starts true only once the gender
  // prompt has resolved (dismissed, or already-seen on a prior visit).
  const [genderPromptResolved, setGenderPromptResolved] = useState(false);

  return (
    <div className="font-poppins min-h-screen flex flex-col w-full bg-white">
      <SEO
        title="Premium Medical Scrubs in Pakistan"
        description="STETH — premium medical scrubs and uniforms designed for doctors, nurses, and students across Pakistan. Shop Women's and Men's scrubs, lab coats, and accessories."
        canonicalPath="/"
        jsonLd={[organizationSchema]}
      />
      <GenderQuickSelect onDismiss={() => setGenderPromptResolved(true)} />
      <Header />
      <Hero />
      <ColorTileCarousel />
      <h1 className='text-center text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-bold text-black px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8'> More Than Just A Uniform</h1>
      <BestSellers />
      <MensBestSellers />
      <RewardsCTA />
      <FeatureSection />
      <NewsletterSignup />
      <AwsomeHumansFooter />
      <main className="flex-grow">{children}</main>
      <RegistrationPopup canStart={genderPromptResolved} />
    </div>
  );
};

export default Homepage;