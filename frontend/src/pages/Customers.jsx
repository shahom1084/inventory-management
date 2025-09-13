import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useShop } from '../context/ShopContext';
import NewCustomerModal from '../components/customers/NewCustomerModal';
import EditCustomerModal from '../components/customers/EditCustomerModal';
import ConfirmationModal from '../components/common/ConfirmationModal';

function HeaderBar({ onNewCustomer }) {
    const { initials } = useShop();
    return (
        <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-amber-500/90 text-white flex items-center justify-center shadow-sm">
                    <span className="text-sm font-bold">{initials}</span>
                </div>
                <h2 className="text-xl font-semibold text-slate-800">Customers</h2>
            </div>
            <div className="flex items-center gap-3">
                <button
                    onClick={onNewCustomer}
                    className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md text-sm shadow"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    New Customer
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
                placeholder="Search customers by name or phone..."
                className="w-full outline-none text-sm text-slate-700 placeholder:text-slate-400"
            />
        </div>
    );
}

function CustomersTable({ customers, onEdit, onDelete, loading, error }) {
    return (
        <div className="hidden md:block w-full max-h-[70vh] overflow-auto rounded-xl border border-slate-200 bg-white shadow">
            <table className="min-w-full text-left text-sm">
                <thead className="sticky top-0 bg-slate-50 text-slate-600">
                    <tr>
                        <th className="px-4 py-3 font-medium">Name</th>
                        <th className="px-4 py-3 font-medium">Phone</th>
                        <th className="px-4 py-3 font-medium">Email</th>
                        <th className="px-4 py-3 font-medium">Address</th>
                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td className="px-4 py-6 text-center text-slate-500" colSpan={5}>Loading...</td>
                        </tr>
                    ) : error ? (
                        <tr>
                            <td className="px-4 py-6 text-center text-red-500" colSpan={5}>{error}</td>
                        </tr>
                    ) : customers.length === 0 ? (
                        <tr>
                            <td className="px-4 py-6 text-center text-slate-500" colSpan={5}>No customers found</td>
                        </tr>
                    ) : (
                        customers.map((c) => (
                            <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50">
                                <td className="px-4 py-3 text-slate-800 font-medium">{c.name}</td>
                                <td className="px-4 py-3 text-slate-700">{c.phone_number}</td>
                                <td className="px-4 py-3 text-slate-700">{c.email || '-'}</td>
                                <td className="px-4 py-3 text-slate-700">{c.address || '-'}</td>
                                <td className="px-4 py-3">
                                    <div className="w-full flex justify-end gap-2">
                                        <button onClick={() => onDelete(c.id)} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold">
                                            Delete
                                        </button>
                                        <button onClick={() => onEdit(c)} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold">
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

export default function CustomersPage() {
    const [query, setQuery] = useState('');
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [customerToDelete, setCustomerToDelete] = useState(null);

    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('/api/customers', { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to load customers');
            } else {
                setCustomers(Array.isArray(data.customers) ? data.customers : []);
            }
        } catch (e) {
            setError(e.message || 'Failed to load customers');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const filteredCustomers = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return customers;
        return customers.filter((c) =>
            c.name.toLowerCase().includes(q) ||
            c.phone_number.toLowerCase().includes(q)
        );
    }, [customers, query]);

    const handleNewCustomer = () => setShowNew(true);
    
    const handleEdit = (customer) => {
        setEditingCustomer(customer);
        setShowEdit(true);
    };

    const handleDeleteRequest = (customerId) => {
        setCustomerToDelete(customerId);
    };

    const executeDelete = async () => {
        if (!customerToDelete) return;
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`/api/customers/${customerToDelete}`, { 
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to delete customer');
            setCustomers(prev => prev.filter(c => c.id !== customerToDelete));
            setCustomerToDelete(null);
        } catch (err) {
            alert("Error: " + err.message);
            setCustomerToDelete(null);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#f7f5f2]">
            <div className="w-full px-4 sm:px-6 lg:px-10 py-6 space-y-4">
                <HeaderBar onNewCustomer={handleNewCustomer} />
                <SearchBar value={query} onChange={setQuery} />
                <CustomersTable customers={filteredCustomers} onEdit={handleEdit} onDelete={handleDeleteRequest} loading={loading} error={error} />
            </div>
            <NewCustomerModal open={showNew} onClose={() => setShowNew(false)} onCreated={fetchCustomers} />
            {editingCustomer && <EditCustomerModal customer={editingCustomer} open={showEdit} onClose={() => { setShowEdit(false); setEditingCustomer(null); }} onUpdated={fetchCustomers} />}
            <ConfirmationModal 
                open={!!customerToDelete}
                onClose={() => setCustomerToDelete(null)}
                onConfirm={executeDelete}
                title="Delete Customer"
                message="Are you sure you want to delete this customer? This action cannot be undone."
            />
        </div>
    );
}
