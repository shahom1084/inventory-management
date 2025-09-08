import React, { useMemo, useState, useEffect, useCallback } from 'react';
import NewItemModal from '../components/items/NewItemModal';
import EditItemModal from '../components/items/EditItemModal';
import StockControl from '../components/items/StockControl';
import ConfirmationModal from '../components/common/ConfirmationModal';

function HeaderBar({ onNewItem, initials }) {
    return (
        <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-amber-500/90 text-white flex items-center justify-center shadow-sm">
                    <span className="text-sm font-bold">{initials}</span>
                </div>
                <h2 className="text-xl font-semibold text-slate-800">Items</h2>
            </div>
            <div className="flex items-center gap-3">
                <button
                    onClick={onNewItem}
                    className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md text-sm shadow"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    New Item
                </button>
            </div>
        </div>
    );
}

function SearchBar({ value, onChange }) {
    return (
        <div className="w-full flex items-center gap-2 bg-white rounded-lg border border-slate-200 px-3 py-2 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Search items by name..."
                className="w-full outline-none text-sm text-slate-700 placeholder:text-slate-400"
            />
        </div>
    );
}

function ItemsTable({ items, onEdit, onDelete, onStockChange, loading, error, stockLoading }) {
    return (
        <div className="hidden md:block w-full max-h-[70vh] overflow-auto rounded-xl border border-slate-200 bg-white shadow">
            <table className="min-w-full text-left text-sm">
                <thead className="sticky top-0 bg-slate-50 text-slate-600">
                    <tr>
                        <th className="px-4 py-3 font-medium">Name</th>
                        <th className="px-4 py-3 font-medium">Cost</th>
                        <th className="px-4 py-3 font-medium">Retail</th>
                        <th className="px-4 py-3 font-medium">Wholesale</th>
                        <th className="px-4 py-3 font-medium">Stock</th>
                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td className="px-4 py-6 text-center text-slate-500" colSpan={6}>Loading...</td>
                        </tr>
                    ) : error ? (
                        <tr>
                            <td className="px-4 py-6 text-center text-red-500" colSpan={6}>{error}</td>
                        </tr>
                    ) : items.length === 0 ? (
                        <tr>
                            <td className="px-4 py-6 text-center text-slate-500" colSpan={6}>No items found</td>
                        </tr>
                    ) : (
                        items.map((it) => (
                            <tr key={it.id} className="border-t border-slate-100 hover:bg-slate-50">
                                <td className="px-4 py-3 text-slate-800 font-medium">
                                    {it.name}
                                    <p className="text-xs text-slate-500 font-normal">{it.description || ''}</p>
                                </td>
                                <td className="px-4 py-3 text-slate-700">{it.cost_price || '-'}</td>
                                <td className="px-4 py-3 text-slate-800">{it.retail_price}</td>
                                <td className="px-4 py-3 text-slate-700">{it.wholesale_price || '-'}</td>
                                <td className="px-4 py-3">
                                    <StockControl 
                                        stock={it.stock_quantity}
                                        onIncrement={() => onStockChange(it.id, 'increment')}
                                        onDecrement={() => onStockChange(it.id, 'decrement')}
                                        loading={stockLoading[it.id]}
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <div className="w-full flex justify-end gap-2">
                                        <button onClick={() => onDelete(it.id)} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold">
                                            Delete
                                        </button>
                                        <button onClick={() => onEdit(it)} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold">
                                            Edit
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

function ItemsCards({ items, onEdit, onDelete, onStockChange, loading, error, stockLoading }) {
    return (
        <div className="md:hidden grid grid-cols-1 gap-3">
            {loading && <div className="text-center text-slate-500">Loading...</div>}
            {error && <div className="text-center text-red-500">{error}</div>}
            {!loading && !error && items.length === 0 && <div className="text-center text-slate-500">No items found</div>}
            {items.map((it) => (
                <div key={it.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <h4 className="text-slate-800 font-semibold">{it.name}</h4>
                            <p className="text-xs text-slate-500 mt-0.5">{it.description || '—'}</p>
                        </div>
                        <div className='flex items-center gap-2'>
                            <button onClick={() => onDelete(it.id)} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold">
                                Delete
                            </button>
                            <button onClick={() => onEdit(it)} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold">
                                Edit
                            </button>
                        </div>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                        <div className="bg-slate-50 text-slate-700 rounded-md px-2 py-1 text-center">Cost {it.cost_price || '-'}</div>
                        <div className="bg-emerald-50 text-emerald-700 rounded-md px-2 py-1 text-center">Retail {it.retail_price}</div>
                        <div className="bg-teal-50 text-teal-700 rounded-md px-2 py-1 text-center">Wholesale {it.wholesale_price || '-'}</div>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2 text-sm">
                        <span className="font-semibold">Stock:</span>
                        <StockControl 
                            stock={it.stock_quantity}
                            onIncrement={() => onStockChange(it.id, 'increment')}
                            onDecrement={() => onStockChange(it.id, 'decrement')}
                            loading={stockLoading[it.id]}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function ItemsPage() {
    const [query, setQuery] = useState('');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [shopName, setShopName] = useState('');
    const [stockLoading, setStockLoading] = useState({});
    const [itemToDelete, setItemToDelete] = useState(null);

    const getInitials = (name) => {
        if (!name || typeof name !== 'string') return 'SN';
        const parts = name.trim().split(/\s+/).filter(Boolean);
        if (parts.length === 0) return 'SN';
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[1][0]).toUpperCase();
    };

    useEffect(() => {
        (async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) return;
                const res = await fetch('/api/shop', { headers: { 'Authorization': `Bearer ${token}` } });
                const data = await res.json().catch(() => ({}));
                if (res.ok && data && data.shop) setShopName(data.shop.name || '');
            } catch {}
        })();
    }, []);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('/api/items', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to load items');
            } else {
                setItems(Array.isArray(data.items) ? data.items : []);
            }
        } catch (e) {
            setError(e.message || 'Failed to load items');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return items;
        return items.filter((it) => it.name?.toLowerCase().includes(q));
    }, [items, query]);

    const handleNewItem = () => setShowNew(true);
    
    const handleEdit = (item) => {
        setEditingItem(item);
        setShowEdit(true);
    };

    const handleDeleteRequest = (itemId) => {
        setItemToDelete(itemId);
    };

    const executeDelete = async () => {
        if (!itemToDelete) return;
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`/api/items/${itemToDelete}`, { 
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to delete');
            setItems(prev => prev.filter(i => i.id !== itemToDelete));
            setItemToDelete(null);
        } catch (err) {
            alert("Error: " + err.message);
            setItemToDelete(null);
        }
    };

    const handleStockChange = async (itemId, action) => {
        setStockLoading(prev => ({ ...prev, [itemId]: true }));
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`/api/items/${itemId}/stock`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ action })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update stock');
            setItems(prev => prev.map(i => i.id === itemId ? { ...i, stock_quantity: data.new_stock_quantity } : i));
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            setStockLoading(prev => ({ ...prev, [itemId]: false }));
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#f7f5f2]">
            <div className="w-full px-4 sm:px-6 lg:px-10 py-6 space-y-4">
                <HeaderBar onNewItem={handleNewItem} initials={getInitials(shopName)} />
                <SearchBar value={query} onChange={setQuery} />
                <ItemsTable items={filtered} onEdit={handleEdit} onDelete={handleDeleteRequest} onStockChange={handleStockChange} loading={loading} error={error} stockLoading={stockLoading} />
                <ItemsCards items={filtered} onEdit={handleEdit} onDelete={handleDeleteRequest} onStockChange={handleStockChange} loading={loading} error={error} stockLoading={stockLoading} />
            </div>
            <NewItemModal open={showNew} onClose={() => setShowNew(false)} onCreated={fetchItems} />
            {editingItem && <EditItemModal item={editingItem} open={showEdit} onClose={() => { setShowEdit(false); setEditingItem(null); }} onUpdated={fetchItems} />}
            <ConfirmationModal 
                open={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={executeDelete}
                title="Delete Item"
                message="Are you sure you want to delete this item? This action cannot be undone."
            />
        </div>
    );
}
