// frontend/src/pages/ShopSetup.jsx

import React, { useState } from 'react';

export default function ShopSetup({ onShopCreated }) {
    const [name, setName] = useState('');
    const [gstin, setGstin] = useState('');
    const [address, setAddress] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name) {
            setError('Shop name is required.');
            return;
        }
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/shop', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, gstin, address })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create shop.');
            }
            
            // Persist hasShop and switch to home so user stays logged in to their state
            localStorage.setItem('hasShop', JSON.stringify(true));
            onShopCreated();

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Welcome!</h2>
            <p className="text-center text-gray-500 mb-6">Let's set up your shop.</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="shopName" className="block text-sm font-medium text-gray-700">Shop Name</label>
                    <input
                        id="shopName"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="gstin" className="block text-sm font-medium text-gray-700">GSTIN (Optional)</label>
                    <input
                        id="gstin"
                        type="text"
                        value={gstin}
                        onChange={(e) => setGstin(e.target.value)}
                        className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address (Optional)</label>
                    <textarea
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        rows={3}
                        className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <div>
                    <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300">
                        {loading ? 'Saving...' : 'Create Shop'}
                    </button>
                </div>
            </form>
        </div>
    );
}