// src/routes/AppRouter.js
import React, { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion as Motion } from 'framer-motion';

// Import your page components
import Homepage from '../pages/Homepage/Homepage';
import MensPage from '../pages/Menspage/MensPage';
import WomenPage from '../pages/Womenpage/WomenPage';
import CheckoutPage from '../pages/Checkout/CheckoutPage';
import Cart from '../pages/Cart/Cart';
import AuthRedirect from '../pages/Login&Signup/AuthRedirect';
import OTP from '../pages/Login&Signup/OTP';
import PasswordRecovery from '../pages/Login&Signup/Password-Recovery'
import AboutUs from '../pages/AboutUs/AboutUs';
import AccountRedirect from '../pages/Login&Signup/AccountRedirect';
import StudentVerification from '../pages/Student/Student';
import CartPage from '../pages/Cart/Cart';
import ProductDetail from '../pages/ProductDetailPage/ProductDetail';
import ColorProductsPage from '../pages/ColorProduct/ColorProductPage';
import TermsAndConditions from '../pages/TermsAndConditions/TermsAndConditions';
import AdminRoute from '../pages/Login&Signup/AdminRoute';
import Rewards from '../pages/Rewards/Rewards';
import SizeQuiz from '../pages/SizeQuiz/SizeQuiz';
import GiftCards from '../pages/GiftCards/GiftCards';
import BlogList from '../pages/Blog/BlogList';
import BlogDetail from '../pages/Blog/BlogDetail';
import PrivacyPolicy from '../pages/PrivacyPolicy/PrivacyPolicy';
import FAQs from '../pages/FAQs/FAQs';
import Affiliate from '../pages/Affiliate/Affiliate';

// Part B.5 - every Admin/* page (plus the AdminLayout shell) is lazy-loaded
// so storefront customers never download any of it - previously these were
// all static imports shipped in the single main bundle regardless of
// whether a visitor ever hits /admin/*. This is also what makes the
// existing "not part of the customer-facing bundle" comments on
// MarketingDashboard.jsx's rrweb-player import and vite.config.js's
// optimizeDeps note actually true, rather than aspirational.
const AdminLayout = lazy(() => import('../pages/Admin/AdminLayout'));
const Dashboard = lazy(() => import('../pages/Admin/Dashboard/Dashboard'));
const ProductManagementHub = lazy(() => import('../pages/Admin/ProductManagement/ProductManagementHub'));
const ProductList = lazy(() => import('../pages/Admin/ProductManagement/ProductList'));
const ProductAdd = lazy(() => import('../pages/Admin/ProductManagement/ProductAdd'));
const ProductDelete = lazy(() => import('../pages/Admin/ProductManagement/ProductDelete'));
const ProductUpdate = lazy(() => import('../pages/Admin/ProductManagement/ProductUpdate'));
const ProductImages = lazy(() => import('../pages/Admin/ProductManagement/ProductImages'));
const ProductUpdateImages = lazy(() => import('../pages/Admin/ProductManagement/ProductUpdateImages'));
const CustomersAlsoBought = lazy(() => import('../pages/Admin/ProductManagement/CustomersAlsoBought'));
const CustomersAlsoBoughtEdit = lazy(() => import('../pages/Admin/ProductManagement/CustomersAlsoBoughtEdit'));
const StudentApprovalList = lazy(() => import('../pages/Admin/StudentApproval/StudentApprovalList'));
const StudentApprovalDetail = lazy(() => import('../pages/Admin/StudentApproval/StudentApprovalDetail'));
const OrdersList = lazy(() => import('../pages/Admin/Orders/OrdersList'));
const OrderUpdateStatus = lazy(() => import('../pages/Admin/Orders/OrderUpdateStatus'));
const HeroImages = lazy(() => import('../pages/Admin/HeroImages/HeroImages'));
const Newsletter = lazy(() => import('../pages/Admin/Newsletter/Newsletter'));
const Settings = lazy(() => import('../pages/Admin/Settings/Settings'));
const FabricPage = lazy(() => import('../pages/Admin/Fabric/Fabric'));
const CategoryPage = lazy(() => import('../pages/Admin/Category/Category'));
const ColorsPage = lazy(() => import('../pages/Admin/Colors/Colors'));
const VendorPage = lazy(() => import('../pages/Admin/Vendor/Vendor'));
const InventoryPage = lazy(() => import('../pages/Admin/Inventory/Inventory'));
const MarketingDashboard = lazy(() => import('../pages/Admin/Marketing/MarketingDashboard'));
const DiscountCodes = lazy(() => import('../pages/Admin/DiscountCodes/DiscountCodes'));
const Affiliates = lazy(() => import('../pages/Admin/Affiliates/Affiliates'));

// Minimal fallback - admin is an internal tool, not a storefront-facing
// screen, so a plain loading state (not a branded skeleton) is enough.
const AdminLoading = () => (
  <div className="min-h-screen flex items-center justify-center bg-black text-white">
    Loading...
  </div>
);

const AppRouter = () => {
  const location = useLocation();

  return (
    // #4 - route-transition wrapper. framer-motion was already a
    // dependency but nothing used AnimatePresence anywhere; wrapping the
    // whole route tree in one keyed motion.div (rather than editing every
    // individual page component) fades between routes on navigation.
    <AnimatePresence mode="wait">
      <Motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      >
        <Routes location={location}>
      {/* Homepage as root path */}
      <Route path="/" element={<Homepage />} />

      {/* Men's page route */}
      <Route path="/men" element={<MensPage />} />

      {/* Women's page route */}
      <Route path="/women" element={<WomenPage />} />

      {/* Checkout page route */}
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/color-products/:colorId" element={<ColorProductsPage />} />

      {/* Product detail routes */}
      <Route path="/product/:productId" element={<ProductDetail/>} />
      <Route path="/profile"  element={<AccountRedirect tab="profile"/>} />

      {/* Auth routes */}
      <Route path="/login"  element={<AuthRedirect mode="login" />} />
      <Route path="/signup"  element={<AuthRedirect mode="signup" />} />
      <Route path="/otp"  element={<OTP/>} />
      <Route path="/password-recovery"  element={<PasswordRecovery/>} />

      {/* About and Terms routes */}
      <Route path="/aboutus"  element={<AboutUs/>} />
      <Route path="/terms" element={<TermsAndConditions />} />

      {/* Student verification route */}
      <Route path="/students"  element={<StudentVerification/>} />

      {/* Cart route */}
      <Route path="/cart"  element={<Cart/>} />

      {/* Navbar/footer rebuild - issues #23/#24 + B.4 */}
      <Route path="/rewards" element={<Rewards />} />

      {/* Size recommendation - the points-earning entry point. The instant
          "What's My Size?" version lives on the product page itself. */}
      <Route path="/size-quiz" element={<SizeQuiz />} />
      <Route path="/gift-cards" element={<GiftCards />} />
      <Route path="/blog" element={<BlogList />} />
      <Route path="/blog/:slug" element={<BlogDetail />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/faqs" element={<FAQs />} />
      <Route path="/affiliate" element={<Affiliate />} />

      {/* Admin section - guarded by role. Ported from Steth_admin_Panel.
          Part B.5 - Suspense-wrapped since every element above is now
          React.lazy(); the fallback only ever shows for admin visitors. */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={
          <Suspense fallback={<AdminLoading />}>
            <AdminLayout />
          </Suspense>
        }>
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
          <Route path="fabrics" element={<FabricPage />} />
          <Route path="categories" element={<CategoryPage />} />
          <Route path="colors" element={<ColorsPage />} />
          <Route path="vendors" element={<VendorPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="newsletter" element={<Newsletter />} />
          <Route path="settings" element={<Settings />} />
          <Route path="discount-codes" element={<DiscountCodes />} />
          <Route path="affiliates" element={<Affiliates />} />
        </Route>
      </Route>

      {/* Marketing dashboard (B.3) - Admin + Marketer, separate guard from
          the admin-only block above since it's a wider role set. */}
      <Route element={<AdminRoute allowedRoles={['admin', 'marketer']} />}>
        <Route path="/admin/marketing" element={
          <Suspense fallback={<AdminLoading />}>
            <AdminLayout />
          </Suspense>
        }>
          <Route index element={<MarketingDashboard />} />
        </Route>
      </Route>

      {/* 404 route - must be last */}
      <Route path="*" element={<div>Page not found</div>} />
        </Routes>
      </Motion.div>
    </AnimatePresence>
  );
};

export default AppRouter;
