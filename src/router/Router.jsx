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
import AdminLayout from '../pages/Admin/AdminLayout';
import Dashboard from '../pages/Admin/Dashboard/Dashboard';
import ProductManagementHub from '../pages/Admin/ProductManagement/ProductManagementHub';
import ProductList from '../pages/Admin/ProductManagement/ProductList';
import ProductAdd from '../pages/Admin/ProductManagement/ProductAdd';
import ProductDelete from '../pages/Admin/ProductManagement/ProductDelete';
import ProductUpdate from '../pages/Admin/ProductManagement/ProductUpdate';
import ProductImages from '../pages/Admin/ProductManagement/ProductImages';
import ProductUpdateImages from '../pages/Admin/ProductManagement/ProductUpdateImages';
import CustomersAlsoBought from '../pages/Admin/ProductManagement/CustomersAlsoBought';
import CustomersAlsoBoughtEdit from '../pages/Admin/ProductManagement/CustomersAlsoBoughtEdit';
import StudentApprovalList from '../pages/Admin/StudentApproval/StudentApprovalList';
import StudentApprovalDetail from '../pages/Admin/StudentApproval/StudentApprovalDetail';
import OrdersList from '../pages/Admin/Orders/OrdersList';
import OrderUpdateStatus from '../pages/Admin/Orders/OrderUpdateStatus';
import HeroImages from '../pages/Admin/HeroImages/HeroImages';
import ColorTiles from '../pages/Admin/ColorTiles/ColorTiles';
import Newsletter from '../pages/Admin/Newsletter/Newsletter';
import Settings from '../pages/Admin/Settings/Settings';

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

      {/* Admin section - guarded by role. Ported from Steth_admin_Panel. */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="product-management" element={<ProductManagementHub />} />
          <Route path="product-management/list" element={<ProductList />} />
          <Route path="product-management/add" element={<ProductAdd />} />
          <Route path="product-management/delete" element={<ProductDelete />} />
          <Route path="product-management/update/:id" element={<ProductUpdate />} />
          <Route path="product-management/:id/images" element={<ProductImages />} />
          <Route path="product-management/:id/update-images" element={<ProductUpdateImages />} />
          <Route path="product-management/customers-also-bought" element={<CustomersAlsoBought />} />
          <Route path="product-management/customers-also-bought/:id" element={<CustomersAlsoBoughtEdit />} />
          <Route path="student-approval" element={<StudentApprovalList />} />
          <Route path="student-approval/:studentId" element={<StudentApprovalDetail />} />
          <Route path="orders" element={<OrdersList />} />
          <Route path="orders/:id/update-status" element={<OrderUpdateStatus />} />
          <Route path="hero-images" element={<HeroImages />} />
          <Route path="color-tiles" element={<ColorTiles />} />
          <Route path="newsletter" element={<Newsletter />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

      {/* 404 route - must be last */}
      <Route path="*" element={<div>Page not found</div>} />
    </Routes>
  );
};

export default AppRouter;