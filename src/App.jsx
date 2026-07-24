// src/App.jsx
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './router/Router';
import { AuthProvider } from '../src/pages/Login&Signup/AuthContext';
import AuthPanel from './components/AuthPanel/AuthPanel';
import { CartDrawerProvider } from './context/CartDrawerContext';
import CartDrawer from './components/CartDrawer/CartDrawer';

function App() {
  return (
    <AuthProvider>
      <CartDrawerProvider>
        <BrowserRouter>
          <AppRouter />
          <AuthPanel />
          <CartDrawer />
        </BrowserRouter>
      </CartDrawerProvider>
    </AuthProvider>
  );
}

export default App;