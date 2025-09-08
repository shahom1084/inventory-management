// frontend/src/App.jsx

import React, { useEffect, useState } from 'react';
import LoginSignUpComponent from './features/auth/LoginSignUp';
import OtpComponent from './features/auth/OtpComponent';
import HomeComponent from './pages/HomeComponent';
import ShopSetup from './pages/ShopSetup'; // <-- IMPORT new component
import ItemsPage from './pages/Items';

export default function App() {
    // 'login', 'otp', 'shop_setup', 'home', 'items'
    const [view, setView] = useState('login'); 
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');

    const navigate = (v) => {
        setView(v);
        // simple hash-based routing so direct links work
        const map = { home: '#/home', items: '#/items', shop_setup: '#/shop-setup', login: '#/login', otp: '#/otp' };
        window.location.hash = map[v] || '#/home';
    };

    const handleOtpSent = (pass) => {
        setPassword(pass);
        navigate('otp');
    };

    // MODIFIED to handle the response from the backend
    const handleVerification = (data) => {
        // Store the token in localStorage for future API calls
        localStorage.setItem('authToken', data.token);
        // Always go to home; HomeComponent will check if a shop exists and redirect if needed
        navigate('home');
    };
    
    // NEW function to switch view after shop is created
    const handleShopCreated = () => {
        navigate('home');
    };

    // NEW: explicit logout handler
    const handleLogout = () => {
        try {
            localStorage.removeItem('authToken');
        } catch (e) {}
        navigate('login');
    };

    // Keep user logged in on this device by restoring session on app load + handle hash changes
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const applyHashRoute = () => {
            const h = (window.location.hash || '').toLowerCase();
            if (!token) {
                setView('login');
                return;
            }
            if (h.includes('#/items')) return setView('items');
            if (h.includes('#/shop-setup')) return setView('shop_setup');
            return setView('home');
        };
        applyHashRoute();
        window.addEventListener('hashchange', applyHashRoute);
        return () => window.removeEventListener('hashchange', applyHashRoute);
    }, []);

    const renderView = () => {
        switch (view) {
            case 'otp':
                return <OtpComponent 
                            phoneNumber={phoneNumber} 
                            password={password}
                            onVerified={handleVerification} 
                        />;
            case 'shop_setup':
                return <ShopSetup onShopCreated={handleShopCreated} />;
            case 'items':
                return <ItemsPage />;
            case 'home':
                return <HomeComponent onLogout={handleLogout} />;
            case 'login':
            default:
                return <LoginSignUpComponent 
                            onOtpSent={handleOtpSent}
                            phoneNumber={phoneNumber}
                            setPhoneNumber={setPhoneNumber} 
                        />;
        }
    };

    return (
        <div className="min-h-screen w-full font-sans">
            {renderView()}
        </div>
    );
}