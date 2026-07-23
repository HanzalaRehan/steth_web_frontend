// src/App.jsx
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './router/Router';
import { AuthProvider } from '../src/pages/Login&Signup/AuthContext';
import AuthPanel from './components/AuthPanel/AuthPanel';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRouter />
        <AuthPanel />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;