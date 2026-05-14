import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { BrowserRouter } from 'react-router-dom';
import ToasterProvider from './contexts/ToasterContext.tsx';
import AuthContextProvider from './contexts/AuthContext.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <ToasterProvider>
        <AuthContextProvider>
          <App />
        </AuthContextProvider>
      </ToasterProvider>
    </BrowserRouter>
  </StrictMode>
);
