import React from 'react';

export default function HomeComponent({ onLogout }) {
    return (
        <div className="w-full max-w-md p-8 text-center bg-white rounded-2xl shadow-lg">
             <h1 className="text-4xl font-bold text-green-600">Success!</h1>
             <p className="mt-4 text-lg text-gray-700">You have been successfully logged in.</p>
             <p className="mt-2 text-gray-500">Welcome to the application.</p>
             <div className="mt-6">
                <button
                    onClick={onLogout}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                    Logout
                </button>
             </div>
        </div>
    );
}