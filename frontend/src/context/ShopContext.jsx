import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import getApiUrl from '../utils/api';

const ShopContext = createContext({ shopDetails: {}, shopName: '', initials: 'SN', loading: true, error: '', refreshShop: () => {}, clearShop: () => {} });

const getInitials = (name) => {
    if (!name || typeof name !== 'string') return 'SN';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'SN';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
};

export function ShopProvider({ children }) {
    const [shopDetails, setShopDetails] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchShop = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setShopDetails({});
                setLoading(false);
                return;
            }
            const res = await fetch(getApiUrl('/shop'), { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json().catch(() => ({}));
            if (res.ok && data && data.shop) {
                setShopDetails(data.shop || {});
            } else if (res.status === 404) {
                setShopDetails({});
            } else {
                throw new Error((data && data.error) || 'Failed to fetch shop');
            }
        } catch (e) {
            setError(e.message || 'Failed to fetch shop');
        } finally {
            setLoading(false);
        }
    }, []);

    const clearShop = useCallback(() => {
        setShopDetails({});
        setError('');
        setLoading(false);
    }, []);

    useEffect(() => { fetchShop(); }, [fetchShop]);

    const value = useMemo(() => ({
        shopDetails,
        shopName: shopDetails.name,
        initials: getInitials(shopDetails.name || 'Shop Name'),
        loading,
        error,
        refreshShop: fetchShop,
        clearShop,
    }), [shopDetails, loading, error, fetchShop, clearShop]);

    return (
        <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
    );
}

export const useShop = () => useContext(ShopContext);
