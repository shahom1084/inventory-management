import React from 'react';

export default function HomeComponent() {
    return (
        <div className="w-full max-w-md p-8 text-center bg-white rounded-2xl shadow-lg">
             <h1 className="text-4xl font-bold text-green-600">Success!</h1>
             <p className="mt-4 text-lg text-gray-700">You have been successfully logged in.</p>
             <p className="mt-2 text-gray-500">Welcome to the application.</p>
        </div>
    );
}