import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { PaymentProvider } from './context/PaymentContext';
import App from './App';
import i18n from './i18n/i18n';
import './axiosConfig';
import './styles/global.css';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <I18nextProvider i18n={i18n}>
        <HelmetProvider>
        <BrowserRouter>
          <ThemeProvider>
            <AuthProvider>
              <PaymentProvider>
                <App />
                <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
              </PaymentProvider>
            </AuthProvider>
          </ThemeProvider>
        </BrowserRouter>
        </HelmetProvider>
      </I18nextProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
