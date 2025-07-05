import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import './styles/index.css';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { LoadingProvider } from './contexts/LoadingContext.jsx';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AuthProvider>
            <BrowserRouter>
                <LoadingProvider>
                    <App />
                </LoadingProvider>
            </BrowserRouter>
        </AuthProvider>
    </StrictMode>
);
