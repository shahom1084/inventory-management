import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- Helper Components & Icons (No changes here) ---

// Icon for a smartphone
const SmartphoneIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="14" height="20" x="5" y="2" rx="2" ry="2"></rect>
    <path d="M12 18h.01"></path>
  </svg>
);

// Icon for a key
const KeyRoundIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z"></path>
    <circle cx="16.5" cy="7.5" r=".5"></circle>
  </svg>
);

// Loading spinner icon
const LoaderCircleIcon = ({ className }) => (
  <svg className={`${className} animate-spin`} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
  </svg>
);


// --- Main Application Components ---

// Component for the Login/Sign Up page
function LoginSignUpComponent({ onOtpSent, setPhoneNumber, phoneNumber }) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [userExists, setUserExists] = useState(null); // null, true, or false
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [checkingUser, setCheckingUser] = useState(false);
    
    const debounceTimeout = useRef(null);

    // Debounced function to check if user exists (communicates with your backend)
    const checkUserExists = useCallback(async (number) => {
        setCheckingUser(true);
        setUserExists(null);
        setError('');
        try {
            const response = await fetch('/api/check-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber: number })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Network response was not ok');
            }
            const data = await response.json();
            setUserExists(data.exists);
        } catch (err) {
            setError(err.message || 'Could not verify phone number. Please try again.');
            console.error(err);
        } finally {
            setCheckingUser(false);
        }
    }, []);

    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/\D/g, ''); // Allow only digits
        if (value.length <= 10) {
            setPhoneNumber(value);
            setUserExists(null); // Reset when user types
            setError('');
            
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }

            if (value.length === 10) {
                debounceTimeout.current = setTimeout(() => {
                    checkUserExists(value);
                }, 500);
            }
        }
    };

    const validateForm = () => {
        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return false;
        }
        if (userExists === false && password !== confirmPassword) {
            setError('Passwords do not match.');
            return false;
        }
        setError('');
        return true;
    };
    
    // This function now simulates sending an OTP and proceeds to the next step
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setError('');

        // Simulate OTP sending delay for better UX
        setTimeout(() => {
            console.log("Simulating OTP sent. Verification will happen on the backend.");
            onOtpSent(password); // Pass the password to the parent
            setLoading(false);
        }, 1000);
    };

    const isLoginFlow = userExists === true;
    const isSignupFlow = userExists === false;
    const isButtonDisabled = loading || checkingUser || phoneNumber.length !== 10 || !password || (isSignupFlow && !confirmPassword);

    return (
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800">Welcome</h1>
                <p className="text-gray-500 mt-2">Enter your phone to continue</p>
            </div>
            
            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                       <SmartphoneIcon className="h-5 w-5 text-gray-400"/>
                    </span>
                    <input
                        type="tel"
                        placeholder="10-digit mobile number"
                        value={phoneNumber}
                        onChange={handlePhoneChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                    />
                     {checkingUser && (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <LoaderCircleIcon className="h-5 w-5 text-indigo-500"/>
                        </span>
                    )}
                </div>

                <div className={`transition-all duration-500 ease-in-out ${userExists !== null ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    { (isLoginFlow || isSignupFlow) && (
                        <div className="space-y-4 pt-2">
                           <p className="text-center text-sm font-medium text-indigo-600">
                                {isLoginFlow ? 'Welcome back! Please enter your password.' : 'Looks like you\'re new! Create a password.'}
                            </p>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                   <KeyRoundIcon className="h-5 w-5 text-gray-400"/>
                                </span>
                                <input
                                    type="password"
                                    placeholder={isSignupFlow ? "Create Password" : "Password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                                />
                            </div>
                            { isSignupFlow && (
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <KeyRoundIcon className="h-5 w-5 text-gray-400"/>
                                    </span>
                                    <input
                                        type="password"
                                        placeholder="Confirm Password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                <button
                    type="submit"
                    disabled={isButtonDisabled}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors duration-300"
                >
                    {loading ? <LoaderCircleIcon className="h-5 w-5 text-white"/> : 'Get OTP'}
                </button>
            </form>
        </div>
    );
}

// Component for OTP Verification
function OtpComponent({ phoneNumber, password, onVerified }) {
    const [otp, setOtp] = useState(new Array(4).fill(""));
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef([]);

    const handleChange = (e, index) => {
        const { value } = e.target;
        if (isNaN(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 3) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleSubmit = async () => {
        const enteredOtp = otp.join('');
        if (enteredOtp.length !== 4) {
            setError('Please enter a 4-digit OTP.');
            return;
        }
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phoneNumber,
                    password,
                    otp: enteredOtp
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `Server error: ${response.status}`);
            }

            localStorage.setItem('authToken', data.token);
            onVerified();

        } catch (err) {
            setError(err.message);
            console.error("Session creation failed:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800">Verify OTP</h1>
                <p className="text-gray-500 mt-2">
                    Enter the 4-digit code (last 4 of phone #) sent to: <span className="font-semibold text-gray-700">{phoneNumber}</span>
                </p>
            </div>
            <div className="flex justify-center gap-2 sm:gap-4">
                {otp.map((data, index) => (
                    <input
                        key={index}
                        ref={el => inputRefs.current[index] = el}
                        type="text"
                        maxLength="1"
                        value={data}
                        onChange={e => handleChange(e, index)}
                        onKeyDown={e => handleKeyDown(e, index)}
                        className="w-12 h-12 sm:w-14 sm:h-14 text-center text-2xl font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />
                ))}
            </div>
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
            >
                {loading ? <LoaderCircleIcon className="h-5 w-5 text-white"/> : 'Verify & Proceed'}
            </button>
        </div>
    );
}

// Simple Home Page Component
function HomeComponent() {
    return (
        <div className="w-full max-w-md p-8 text-center bg-white rounded-2xl shadow-lg">
             <h1 className="text-4xl font-bold text-green-600">Success!</h1>
             <p className="mt-4 text-lg text-gray-700">You have been successfully logged in.</p>
             <p className="mt-2 text-gray-500">Welcome to the application.</p>
        </div>
    );
}

// Main App component to manage views
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
