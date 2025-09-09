import React, { useEffect, useState } from 'react';
import LoginSignUpComponent from './features/auth/LoginSignUp';
import OtpComponent from './features/auth/OtpComponent';
import HomeComponent from './pages/HomeComponent';
import ShopSetup from './pages/ShopSetup';
import ItemsPage from './pages/Items';
import BillsPage from './pages/Bills';
import { useShop } from './context/ShopContext';

export default function App() {
    const [view, setView] = useState('login');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [hasShop, setHasShop] = useState(null);
    const { clearShop, refreshShop } = useShop();

    const navigate = (v) => {
        console.log('navigate called with view:', v);
        setView(v);
        const map = { home: '#/home', items: '#/items', bills: '#/bills', shop_setup: '#/shop-setup', login: '#/login', otp: '#/otp' };
        window.location.hash = map[v] || '#/home';
        console.log('window.location.hash set to:', window.location.hash);
    };

    const handleOtpSent = (pass) => {
        console.log('handleOtpSent called');
        setPassword(pass);
        navigate('otp');
    };

    const handleVerification = (data) => {
        console.log('handleVerification called with data:', data);
        localStorage.setItem('authToken', data.token);
        setHasShop(data.has_shop);
        if (data.has_shop) {
            refreshShop();
            navigate('home');
        } else {
            navigate('shop_setup');
        }
    };

    const handleShopCreated = () => {
        console.log('handleShopCreated called');
        setHasShop(true);
        refreshShop();
        navigate('home');
    };

    const handleLogout = () => {
        console.log('handleLogout called');
        localStorage.removeItem('authToken');
        clearShop();
        setHasShop(null);
        window.location.hash = '#/login';
    };

    useEffect(() => {
        console.log('useEffect (routing) called. Current view:', view, 'Current hash:', window.location.hash);
        const applyHashRoute = () => {
            console.log('applyHashRoute called');
            const token = localStorage.getItem('authToken');
            const h = (window.location.hash || '').toLowerCase();
            console.log('Token:', token, 'Hash:', h);
            
            // Allow OTP page even without token
            if (h.includes('#/otp')) {
                console.log('Hash includes #/otp, setting view to otp');
                return setView('otp');
            }

            if (!token) {
                console.log('No token, setting view to login');
                setView('login');
                return;
            }
            
            if (hasShop === false) {
                console.log('hasShop is false, setting view to shop_setup');
                setView('shop_setup');
                return;
            }

            if (h.includes('#/items')) {
                console.log('Hash includes #/items, setting view to items');
                return setView('items');
            }
            if (h.includes('#/bills')) {
                console.log('Hash includes #/bills, setting view to bills');
                return setView('bills');
            }
            if (h.includes('#/shop-setup')) {
                console.log('Hash includes #/shop-setup, setting view to shop_setup');
                return setView('shop_setup');
            }
            
            console.log('Defaulting to home view');
            setView('home');
        };

        applyHashRoute();
        window.addEventListener('hashchange', applyHashRoute);
        return () => window.removeEventListener('hashchange', applyHashRoute);
    }, [hasShop, view]); // Added view to dependency array

    const renderView = () => {
        console.log('renderView called. Rendering view:', view);
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
            case 'bills':
                return <BillsPage />;
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
