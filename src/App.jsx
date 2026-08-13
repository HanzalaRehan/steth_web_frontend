// src/App.jsx
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import AppRouter from './router/Router';
import { AuthProvider } from '../src/pages/Login&Signup/AuthContext';
import AuthPanel from './components/AuthPanel/AuthPanel';
import { CartDrawerProvider } from './context/CartDrawerContext';
import CartDrawer from './components/CartDrawer/CartDrawer';
import { AccountProvider } from './context/AccountContext';
import AccountOverlay from './components/AccountOverlay/AccountOverlay';
import AnalyticsListener from './components/Analytics/AnalyticsListener';
import SupportChat from './components/SupportAgent/SupportChat';

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <CartDrawerProvider>
          <AccountProvider>
            <BrowserRouter>
              <AnalyticsListener />
              <AppRouter />
              <AuthPanel />
              <CartDrawer />
              <AccountOverlay />
              {/* Support agent widget - global, hides itself when the
                  agent is not configured. */}
              <SupportChat />
            </BrowserRouter>
          </AccountProvider>
        </CartDrawerProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;