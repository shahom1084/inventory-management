import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const ShopContext = createContext({ shopName: '', initials: 'SN', loading: true, error: '', refreshShop: () => {} });

const getInitials = (name) => {
    if (!name || typeof name !== 'string') return 'SN';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'SN';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
};

export function ShopProvider({ children }) {
    const [shopName, setShopName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchShop = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setShopName('');
                setLoading(false);
                return;
            }
            const res = await fetch('/api/shop', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json().catch(() => ({}));
            if (res.ok && data && data.shop) {
                setShopName(data.shop.name || '');
            } else if (res.status === 404) {
                setShopName('');
            } else {
                throw new Error((data && data.error) || 'Failed to fetch shop');
            }
        } catch (e) {
            setError(e.message || 'Failed to fetch shop');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchShop(); }, [fetchShop]);

    const value = useMemo(() => ({
        shopName,
        initials: getInitials(shopName || 'Shop Name'),
        loading,
        error,
        refreshShop: fetchShop,
    }), [shopName, loading, error, fetchShop]);

    return (
        <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
    );
}

export const useShop = () => useContext(ShopContext);
