import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useShop } from '../context/ShopContext';
import NewBillModal from '../components/bills/NewBillModal';
import EditBillModal from '../components/bills/EditBillModal';
import BillDetailsModal from '../components/bills/BillDetailsModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import getApiUrl from '../utils/api';

function StatusPill({ status }) {
    const statusStyles = {
        paid: 'bg-green-100 text-green-800',
        unpaid: 'bg-red-100 text-red-800',
        partial: 'bg-yellow-100 text-yellow-800',
    };
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-slate-100 text-slate-800'}`}>
            {status}
        </span>
    );
}

function HeaderBar({ onNewBill }) {
    const { initials } = useShop();
    return (
        <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-amber-500/90 text-white flex items-center justify-center shadow-sm">
                    <span className="text-sm font-bold">{initials}</span>
                </div>
                <h2 className="text-xl font-semibold text-slate-800">Bills</h2>
            </div>
            <div className="flex items-center gap-3">
                <button
                    onClick={onNewBill}
                    className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md text-sm shadow"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    New Bill
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
                placeholder="Search bills by customer or ID..."
                className="w-full outline-none text-sm text-slate-700 placeholder:text-slate-400"
            />
        </div>
    );
}

function BillsTable({ bills, onView, onEdit, onDelete, loading, error }) {
    return (
        <div className="hidden md:block w-full max-h-[70vh] overflow-auto rounded-xl border border-slate-200 bg-white shadow">
            <table className="min-w-full text-left text-sm">
                <thead className="sticky top-0 bg-slate-50 text-slate-600">
                    <tr>
                        <th className="px-4 py-3 font-medium">Bill ID</th>
                        <th className="px-4 py-3 font-medium">Customer Name</th>
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium">Amount</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Remaining</th>
                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td className="px-4 py-6 text-center text-slate-500" colSpan={7}>Loading...</td>
                        </tr>
                    ) : error ? (
                        <tr>
                            <td className="px-4 py-6 text-center text-red-500" colSpan={7}>{error}</td>
                        </tr>
                    ) : bills.length === 0 ? (
                        <tr>
                            <td className="px-4 py-6 text-center text-slate-500" colSpan={7}>No bills found</td>
                        </tr>
                    ) : (
                        bills.map((bill) => (
                            <tr key={bill.id} onClick={() => onView(bill)} className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer">
                                <td className="px-4 py-3 text-slate-800 font-medium">#{bill.id.slice(0, 8)}...</td>
                                <td className="px-4 py-3 text-slate-700">{bill.customer_name}</td>
                                <td className="px-4 py-3 text-slate-700">{new Date(bill.createdAt).toLocaleDateString()}</td>
                                <td className="px-4 py-3 text-slate-800 font-semibold">₹{bill.totalAmount.toFixed(2)}</td>
                                <td className="px-4 py-3">
                                    <StatusPill status={bill.status} />
                                </td>
                                <td className="px-4 py-3 text-slate-800 font-semibold">
                                    {bill.status === 'partial' ? `₹${(bill.totalAmount - bill.amountPaid).toFixed(2)}` : '-'}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="w-full flex justify-end gap-2">
                                        <button onClick={(e) => {e.stopPropagation(); onDelete(bill.id)}} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold">
                                            Delete
                                        </button>
                                        <button onClick={(e) => {e.stopPropagation(); onEdit(bill)}} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold">
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

function BillsCards({ bills, onView, onEdit, onDelete, loading, error }) {
    return (
        <div className="md:hidden grid grid-cols-1 gap-3">
            {loading && <div className="text-center text-slate-500">Loading...</div>}
            {error && <div className="text-center text-red-500">{error}</div>}
            {!loading && !error && bills.length === 0 && <div className="text-center text-slate-500">No bills found</div>}
            {bills.map((bill) => (
                <div key={bill.id} onClick={() => onView(bill)} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm cursor-pointer">
                    <div className="flex items-start justify-between">
                        <div>
                            <h4 className="text-slate-800 font-semibold">Bill #{bill.id.slice(0, 8)}...</h4>
                            <p className="text-xs text-slate-500 mt-0.5">Customer: {bill.customer_name}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-slate-800 font-semibold">₹{bill.totalAmount.toFixed(2)}</p>
                            <p className="text-xs text-slate-500">{new Date(bill.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                        <StatusPill status={bill.status} />
                        {bill.status === 'partial' && (
                            <p className="text-xs text-slate-500">
                                Remaining: <span className="font-semibold">₹{(bill.totalAmount - bill.amountPaid).toFixed(2)}</span>
                            </p>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                            <button onClick={(e) => {e.stopPropagation(); onDelete(bill.id)}} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold">
                                Delete
                            </button>
                            <button onClick={(e) => {e.stopPropagation(); onEdit(bill)}} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold">
                                Edit
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function BillsPage() {
    const [query, setQuery] = useState('');
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [editingBill, setEditingBill] = useState(null);
    const [viewingBill, setViewingBill] = useState(null);
    const [loadingBillDetails, setLoadingBillDetails] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [billToDelete, setBillToDelete] = useState(null);
    const [restoreItems, setRestoreItems] = useState(false);

    const fetchBills = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(getApiUrl('/bills'), { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to load bills');
            } else {
                setBills(Array.isArray(data.bills) ? data.bills : []);
            }
        } catch (e) {
            setError(e.message || 'Failed to load bills');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBills();
    }, [fetchBills]);

    const filteredBills = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return bills;
        return bills.filter((bill) =>
            bill.id.toLowerCase().includes(q) ||
            (bill.customer_name && bill.customer_name.toLowerCase().includes(q))
        );
    }, [bills, query]);

    const handleNewBill = () => setShowNew(true);
    
    const handleView = async (bill) => {
        setViewingBill(bill); // Show modal immediately with basic info
        setLoadingBillDetails(true);
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(getApiUrl(`/bills/${bill.id}`), { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to load bill details');
            }
            setViewingBill(data); // Update with full bill details
        } catch (e) {
            setError(e.message || 'Failed to load bill details');
            // Optionally close the modal or show an error inside it
        } finally {
            setLoadingBillDetails(false);
        }
    };

    const handleEdit = async (bill) => {
        setLoadingBillDetails(true);
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(getApiUrl(`/bills/${bill.id}`), { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to load bill details for editing');
            }
            setEditingBill(data);
            setShowEdit(true);
            setViewingBill(null); // Close the view modal if it was open
        } catch (e) {
            alert("Error: " + e.message);
        } finally {
            setLoadingBillDetails(false);
        }
    };

    const handleDeleteRequest = (billId) => {
        setBillToDelete(billId);
        setShowConfirmation(true);
    };

    const executeDelete = async () => {
        if (!billToDelete) return;
        try {
            const token = localStorage.getItem('authToken');
            const url = getApiUrl(`/bills/${billToDelete}?restore_items=${restoreItems}`);
            const res = await fetch(url, { 
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to delete bill');
            
            setBills(prev => prev.filter(b => b.id !== billToDelete));
            if (viewingBill && viewingBill.id === billToDelete) {
                setViewingBill(null);
            }
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            setShowConfirmation(false);
            setBillToDelete(null);
            setRestoreItems(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#f7f5f2]">
            <div className="w-full px-4 sm:px-6 lg:px-10 py-6 space-y-4">
                <HeaderBar onNewBill={handleNewBill} />
                <SearchBar value={query} onChange={setQuery} />
                <BillsTable bills={filteredBills} onView={handleView} onEdit={handleEdit} onDelete={handleDeleteRequest} loading={loading} error={error} />
                <BillsCards bills={filteredBills} onView={handleView} onEdit={handleEdit} onDelete={handleDeleteRequest} loading={loading} error={error} />
            </div>
            <NewBillModal open={showNew} onClose={() => setShowNew(false)} onCreated={fetchBills} />
            {editingBill && 
                <EditBillModal 
                    open={showEdit} 
                    onClose={() => setShowEdit(false)} 
                    onUpdated={() => { fetchBills(); setShowEdit(false); }} 
                    bill={editingBill} 
                />
            }
            <BillDetailsModal 
                bill={viewingBill} 
                onClose={() => setViewingBill(null)} 
                onEdit={handleEdit}
                onDelete={handleDeleteRequest}
                loading={loadingBillDetails}
            />
            <ConfirmationModal 
                open={showConfirmation}
                onClose={() => setShowConfirmation(false)}
                onConfirm={executeDelete}
                title="Delete Bill"
                message="Are you sure you want to delete this bill? This action cannot be undone."
                showCheckbox={true}
                checkboxLabel="Restore items stock"
                checkboxChecked={restoreItems}
                onCheckboxChange={(e) => setRestoreItems(e.target.checked)}
            />
        </div>
    );
}
