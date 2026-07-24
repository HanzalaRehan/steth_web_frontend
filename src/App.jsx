// src/App.jsx
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './router/Router';
import { AuthProvider } from '../src/pages/Login&Signup/AuthContext';
import AuthPanel from './components/AuthPanel/AuthPanel';
import { CartDrawerProvider } from './context/CartDrawerContext';
import CartDrawer from './components/CartDrawer/CartDrawer';
import { AccountProvider } from './context/AccountContext';
import AccountOverlay from './components/AccountOverlay/AccountOverlay';
import AnalyticsListener from './components/Analytics/AnalyticsListener';

function App() {
  return (
    <AuthProvider>
      <CartDrawerProvider>
        <AccountProvider>
          <BrowserRouter>
            <AnalyticsListener />
            <AppRouter />
            <AuthPanel />
            <CartDrawer />
            <AccountOverlay />
          </BrowserRouter>
        </AccountProvider>
      </CartDrawerProvider>
    </AuthProvider>
  );
}

export default App;