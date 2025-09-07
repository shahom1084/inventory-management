import React, { useState } from 'react';
import LoginSignUpComponent from './features/auth/LoginSignUp';
import OtpComponent from './features/auth/OtpComponent';
import HomeComponent from './pages/HomeComponent';

export default function App() {
    const [view, setView] = useState('login'); // 'login', 'otp', 'home'
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');

    const handleOtpSent = (pass) => {
        setPassword(pass);
        setView('otp');
    };

    const handleVerification = () => {
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