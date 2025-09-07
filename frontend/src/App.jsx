// frontend/src/App.jsx

import React, { useState } from 'react';
import LoginSignUpComponent from './features/auth/LoginSignUp';
import OtpComponent from './features/auth/OtpComponent';
import HomeComponent from './pages/HomeComponent';
import ShopSetup from './pages/ShopSetup'; // <-- IMPORT new component

export default function App() {
    // 'login', 'otp', 'shop_setup', 'home'
    const [view, setView] = useState('login'); 
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');

    const handleOtpSent = (pass) => {
        setPassword(pass);
        setView('otp');
    };

    // MODIFIED to handle the response from the backend
    const handleVerification = (data) => {
        // Store the token in localStorage for future API calls
        localStorage.setItem('authToken', data.token);

        // Check the flag from the backend
        if (data.has_shop) {
            setView('home'); // User has a shop, go to dashboard
        } else {
            setView('shop_setup'); // New user, go to shop setup
        }
    };
    
    // NEW function to switch view after shop is created
    const handleShopCreated = () => {
        setView('home');
    };

    const renderView = () => {
        switch (view) {
            case 'otp':
                return <OtpComponent 
                            phoneNumber={phoneNumber} 
                            password={password}
                            onVerified={handleVerification} 
                        />;
            // NEW CASE for setting up a shop
            case 'shop_setup':
                return <ShopSetup onShopCreated={handleShopCreated} />;
            case 'home':
                return <HomeComponent />;
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
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md">
                {renderView()}
            </div>
            <footer className="mt-8 text-center text-gray-500 text-sm">
                <p>&copy; {new Date().getFullYear()} Your Company. All rights reserved.</p>
            </footer>
        </div>
    );
}