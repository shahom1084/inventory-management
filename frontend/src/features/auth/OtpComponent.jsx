import React, { useState, useRef } from 'react';
import LoaderCircleIcon from '../../components/icons/LoaderCircleIcon';

export default function OtpComponent({ phoneNumber, password, onVerified }) {
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
            onVerified(data);

        } catch (err) {
            setError(err.message);
            console.error("Session creation failed:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800">Verify OTP</h1>
                    <p className="text-gray-500 mt-2">
                        Enter the 4-digit code sent to: <span className="font-semibold text-gray-700">{phoneNumber}</span>
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
        </div>
    );
}