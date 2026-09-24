import React, { useState } from 'react';

const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add signup logic here
    console.log('Signup submitted', { email, gender });
  };

  return (
    <div className='w-full bg-gray-200 py-20'>
    <div className="max-w-md mx-auto p-6 text-ink">
      <h2 className="text-center text-3xl font-bold mb-4">TAKE 15% OFF</h2>
      <p className="text-center text-sm mb-4">
        Subscribe to take 15% OFF your first purchase and stay in the know on
        exclusive new colors, styles and promotions.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-xs text-center text-ink mb-2">
          By clicking 'Sign up', you agree to receive emails from STETH and accept our 
          <a href="#" className="underline ml-1">Terms of Use</a> and 
          <a href="#" className="underline ml-1">Privacy Policy</a>.
        </div>
        
        <input 
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full px-3 py-2 border bg-shirting border-hairline  focus:outline-none focus:ring-2 focus:ring-black"
          required
        />
        
        <div className="flex justify-center space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="Women"
              checked={gender === 'Women'}
              onChange={() => setGender('Women')}
              className="form-radio"
            />
            <span className="ml-2">Women</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="Men"
              checked={gender === 'Men'}
              onChange={() => setGender('Men')}
              className="form-radio"
            />
            <span className="ml-2">Men</span>
          </label>
        </div>
        
        <button 
          type="submit"
          className="w-full bg-navy text-paper py-2  hover:bg-ink transition-colors"
        >
          SIGN UP
        </button>
      </form>
    </div>
    </div>
  );
};

export default NewsletterSignup;