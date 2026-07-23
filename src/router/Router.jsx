// src/routes/AppRouter.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import your page components
import Homepage from '../pages/Homepage/Homepage';
import MensPage from '../pages/Menspage/MensPage';
import WomenPage from '../pages/Womenpage/WomenPage';
import CheckoutPage from '../pages/Checkout/CheckoutPage';
import Cart from '../pages/Cart/Cart';
import Login from '../pages/Login&Signup/Login';
import Signup from '../pages/Login&Signup/SignUp';
import OTP from '../pages/Login&Signup/OTP';
import PasswordRecovery from '../pages/Login&Signup/Password-Recovery'
import AboutUs from '../pages/AboutUs/AboutUs';
import Profile from '../pages/Profile/Profile';
import StudentVerification from '../pages/Student/Student';
import CartPage from '../pages/Cart/Cart';
import ProductDetail from '../pages/ProductDetailPage/ProductDetail';
import ColorProductsPage from '../pages/ColorProduct/ColorProductPage';
import TermsAndConditions from '../pages/TermsAndConditions/TermsAndConditions';
import AdminRoute from '../pages/Login&Signup/AdminRoute';

const AppRouter = () => {
  return (
    <Routes>
      {/* Homepage as root path */}
      <Route path="/" element={<Homepage />} />
      
      {/* Men's page route */}
      <Route path="/men" element={<MensPage />} />

      {/* Women's page route */}
      <Route path="/women" element={<WomenPage />} />
      
      {/* Checkout page route */}
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/color-products/:colorName" element={<ColorProductsPage />} />
      
      {/* Product detail routes */}
      <Route path="/product/:productId" element={<ProductDetail/>} />
      <Route path="/profile"  element={<Profile/>} />
      
      {/* Auth routes */}
      <Route path="/login"  element={<Login/>} />
      <Route path="/signup"  element={<Signup/>} />
      <Route path="/otp"  element={<OTP/>} />
      <Route path="/password-recovery"  element={<PasswordRecovery/>} />

      {/* About and Terms routes */}
      <Route path="/aboutus"  element={<AboutUs/>} />
      <Route path="/terms" element={<TermsAndConditions />} />

      {/* Student verification route */}
      <Route path="/students"  element={<StudentVerification/>} />

      {/* Cart route */}
      <Route path="/cart"  element={<Cart/>} />

      {/* Admin section - guarded by role. Placeholder until Phase 4 ports
          the real AdminLayout + screens over this route tree. */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<div className="p-8">Admin section — screens land in Phase 4.</div>} />
      </Route>

      {/* 404 route - must be last */}
      <Route path="*" element={<div>Page not found</div>} />
    </Routes>
  );
};

export default AppRouter;