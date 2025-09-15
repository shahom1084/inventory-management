import React, { useState, useEffect } from 'react';
import getApiUrl from '../../utils/api';

export default function EditItemModal({ item, open, onClose, onUpdated }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [retailPrice, setRetailPrice] = useState('');
    const [wholesalePrice, setWholesalePrice] = useState('');
    const [costPrice, setCostPrice] = useState('');
    const [stockQty, setStockQty] = useState('');
    const [siUnit, setSiUnit] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (item) {
            setName(item.name || '');
            setDescription(item.description || '');
            setRetailPrice(item.retail_price || '');
            setWholesalePrice(item.wholesale_price || '');
            setCostPrice(item.cost_price || '');
            setStockQty(item.stock_quantity || '');
            setSiUnit(item.si_unit || '');
        }
    }, [item]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !retailPrice) {
            setError('Name and Retail price are required');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(getApiUrl(`/items/${item.id}`),
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name,
                    description,
                    cost_price: costPrice || null,
                    wholesale_price: wholesalePrice || null,
                    retail_price: retailPrice,
                    stock_quantity: stockQty || 0,
                    si_unit: siUnit || null
                })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Failed to update item');
            onUpdated && onUpdated();
            onClose && onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-0">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg mx-auto bg-white rounded-2xl shadow-xl overflow-hidden my-6 sm:my-0 max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-slate-800 text-slate-100 px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md bg-amber-500/90 text-white flex items-center justify-center"><span className="text-xs font-bold">EI</span></div>
                        <h3 className="font-semibold">Edit Item</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-300 hover:text-white">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {error && <div className="text-red-600 text-sm">{error}</div>}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-sm text-slate-700 mb-1">Name</label>
                            <input value={name} onChange={(e)=>setName(e.target.value)} className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Example: Amul Milk 1L" />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-700 mb-1">Retail Price</label>
                            <input value={retailPrice} onChange={(e)=>setRetailPrice(e.target.value)} type="number" step="0.01" className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="₹" />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-700 mb-1">SI Unit (optional)</label>
                            <input value={siUnit} onChange={(e)=>setSiUnit(e.target.value)} className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="e.g., kg, pkt, L" />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-700 mb-1">Wholesale Price (optional)</label>
                            <input value={wholesalePrice} onChange={(e)=>setWholesalePrice(e.target.value)} type="number" step="0.01" className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="₹" />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-700 mb-1">Cost Price (optional)</label>
                            <input value={costPrice} onChange={(e)=>setCostPrice(e.target.value)} type="number" step="0.01" className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="₹" />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-700 mb-1">Stock Qty</label>
                            <input value={stockQty} onChange={(e)=>setStockQty(e.target.value)} type="number" step="1" min="0" className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="0" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm text-slate-700 mb-1">Description (optional)</label>
                            <textarea value={description} onChange={(e)=>setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Short description" />
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md border border-slate-300 bg-white">Cancel</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 rounded-md bg-amber-500 hover:bg-amber-600 text-white shadow disabled:opacity-50">{loading ? 'Saving...' : 'Update Item'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}