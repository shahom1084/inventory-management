import React, { useMemo, useState, useEffect } from 'react';

function HeaderBar({ onNewItem }) {
    return (
        <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-amber-500/90 text-white flex items-center justify-center shadow-sm">
                    <span className="text-sm font-bold">BX</span>
                </div>
                <h2 className="text-xl font-semibold text-slate-800">Items</h2>
            </div>
            <div className="flex items-center gap-3">
                <button
                    onClick={onNewItem}
                    className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md text-sm shadow"
                >
                    <span className="inline-block w-4 h-4 bg-white/80 rounded-sm" />
                    New Item
                </button>
            </div>
        </div>
    );
}

function SearchBar({ value, onChange }) {
    return (
        <div className="w-full flex items-center gap-2 bg-white rounded-lg border border-slate-200 px-3 py-2 shadow-sm">
            <span className="inline-block w-4 h-4 bg-slate-400 rounded-sm" />
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Search items by name..."
                className="w-full outline-none text-sm text-slate-700 placeholder:text-slate-400"
            />
        </div>
    );
}

function Pager({ page, totalPages, onPageChange }) {
    return (
        <div className="flex items-center justify-between text-sm text-slate-600">
            <span>
                Page {page} of {Math.max(totalPages, 1)}
            </span>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(Math.max(page - 1, 1))}
                    disabled={page <= 1}
                    className="px-3 py-1 rounded-md border border-slate-200 bg-white disabled:opacity-50"
                >
                    Prev
                </button>
                <button
                    onClick={() => onPageChange(page + 1)}
                    className="px-3 py-1 rounded-md border border-slate-200 bg-white"
                >
                    Next
                </button>
            </div>
        </div>
    );
}

function ItemsTable({ items, onEdit, loading, error }) {
    return (
        <div className="w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow">
            <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                    <tr>
                        <th className="px-4 py-3 font-medium">Name</th>
                        <th className="px-4 py-3 font-medium">Description</th>
                        <th className="px-4 py-3 font-medium">Retail</th>
                        <th className="px-4 py-3 font-medium">Wholesale</th>
                        <th className="px-4 py-3 font-medium">Stock</th>
                        <th className="px-4 py-3 font-medium text-right">Action</th>
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
                            <tr key={it.id || it.name} className="border-t border-slate-100 hover:bg-slate-50">
                                <td className="px-4 py-3 text-slate-800 font-medium">{it.name}</td>
                                <td className="px-4 py-3 text-slate-600">{it.description || '-'}</td>
                                <td className="px-4 py-3 text-slate-800">{it.retail_price}</td>
                                <td className="px-4 py-3 text-slate-700">{it.wholesale_price || '-'}</td>
                                <td className="px-4 py-3 text-slate-800">{it.stock_quantity}</td>
                                <td className="px-4 py-3">
                                    <div className="w-full flex justify-end">
                                        <button onClick={() => onEdit(it)} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-100">
                                            <span className="inline-block w-4 h-4 bg-slate-400 rounded-sm" />
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

export default function ItemsPage() {
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch items from backend
    useEffect(() => {
        const fetchItems = async () => {
            setLoading(true);
            setError('');
            try {
                const token = localStorage.getItem('authToken');
                const res = await fetch('/api/items', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (!res.ok) {
                    if (res.status === 404) {
                        // No shop or no items depending on backend response
                        setItems([]);
                        setError(data.error || '');
                    } else {
                        throw new Error(data.error || 'Failed to load items');
                    }
                } else {
                    setItems(Array.isArray(data.items) ? data.items : []);
                }
            } catch (e) {
                setError(e.message || 'Failed to load items');
            } finally {
                setLoading(false);
            }
        };
        fetchItems();
    }, []);

    const pageSize = 10;

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return items;
        return items.filter((it) => it.name?.toLowerCase().includes(q));
    }, [items, query]);

    const start = (page - 1) * pageSize;
    const paged = filtered.slice(start, start + pageSize);
    const totalPages = Math.ceil(filtered.length / pageSize) || 1;

    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [totalPages, page]);

    const handleNewItem = () => {
        alert('New Item form coming soon');
    };

    const handleEdit = (it) => {
        alert(`Edit ${it.name}`);
    };

    return (
        <div className="min-h-screen w-full bg-[#f7f5f2]">
            <div className="w-full px-4 sm:px-6 lg:px-10 py-6 space-y-4">
                <HeaderBar onNewItem={handleNewItem} />
                <SearchBar value={query} onChange={setQuery} />
                <ItemsTable items={paged} onEdit={handleEdit} loading={loading} error={error} />
                <Pager page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
        </div>
    );
}
