import React, { useState, useEffect, useRef, useCallback } from 'react';
import SmartphoneIcon from '../../components/icons/SmartphoneIcon';
import KeyRoundIcon from '../../components/icons/KeyRoundIcon';
import LoaderCircleIcon from '../../components/icons/LoaderCircleIcon';
import getApiUrl from '../../utils/api';

export default function LoginSignUpComponent({ onOtpSent, setPhoneNumber, phoneNumber }) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [userExists, setUserExists] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [checkingUser, setCheckingUser] = useState(false);
    
    const debounceTimeout = useRef(null);

    const checkUserExists = useCallback(async (number) => {
        console.log('checkUserExists called with number:', number);
        setCheckingUser(true);
        setUserExists(null);
        setError('');
        try {
            const response = await fetch(getApiUrl('/check-user'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber: number })
            });
            console.log('check-user response:', response);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Network response was not ok');
            }
            const data = await response.json();
            console.log('check-user data:', data);
            setUserExists(data.exists);
            return data.exists;
        } catch (err) {
            console.error('Error in checkUserExists:', err);
            setError(err.message || 'Could not verify phone number. Please try again.');
            return null;
        } finally {
            setCheckingUser(false);
        }
    }, []);

    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value.length <= 10) {
            setPhoneNumber(value);
            setUserExists(null);
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

    const validateForm = (currentUserExists) => {
        console.log('validateForm called with currentUserExists:', currentUserExists);
        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return false;
        }
        if (currentUserExists === false && password !== confirmPassword) {
            setError('Passwords do not match.');
            return false;
        }
        setError('');
        return true;
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('handleSubmit called');
        setLoading(true);
        setError('');

        try {
            console.log('userExists before checkUserExists:', userExists);
            let currentUserExists = userExists;
            if (userExists === null) {
                currentUserExists = await checkUserExists(phoneNumber);
                console.log('currentUserExists after await checkUserExists:', currentUserExists);
            }

            if (validateForm(currentUserExists)) {
                console.log('Form validated. Calling onOtpSent.');
                onOtpSent(password);
            }
        } catch (err) {
            console.error('Error in handleSubmit:', err);
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const isLoginFlow = userExists === true;
    const isSignupFlow = userExists === false;
    const isButtonDisabled = loading || checkingUser || phoneNumber.length !== 10 || !password || (isSignupFlow && !confirmPassword);

    return (
        <div className="min-h-screen w-full flex items-center justify-center px-4 py-8">
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
                                    {isLoginFlow ? 'Welcome back! Please enter your password.' : "Looks like you're new! Create a password."}
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
        </div>
    );
}
