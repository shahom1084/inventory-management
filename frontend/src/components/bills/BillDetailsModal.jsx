import React from 'react';
import { useShop } from '../../context/ShopContext';
import LoaderCircleIcon from '../icons/LoaderCircleIcon';

function BillDetailsModal({ bill, onClose, onEdit, onDelete, loading }) {
    const { shopDetails, loading: shopLoading } = useShop();

    if (!bill) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 print:bg-white" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full print:shadow-none print:rounded-none" onClick={(e) => e.stopPropagation()}>
                <style>
                    {`
                        @media print {
                            body * {
                                visibility: hidden;
                            }
                            .print-container, .print-container * {
                                visibility: visible;
                            }
                            .print-container {
                                position: absolute;
                                left: 0;
                                top: 0;
                                width: 100%;
                            }
                            .no-print {
                                display: none;
                            }
                        }
                    `}
                </style>
                <div className="print-container">
                    {loading || shopLoading || !bill.items ? (
                        <div className="flex justify-center items-center h-48">
                            <LoaderCircleIcon className="animate-spin h-8 w-8 text-amber-500" />
                        </div>
                    ) : (
                        <>
                            <div className="text-center">
                                <h2 className="text-2xl font-bold">{shopDetails.name}</h2>
                                {shopDetails.address && <p className="text-sm text-slate-500">{shopDetails.address}</p>}
                            </div>

                            <div className="my-6">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-semibold">Bill ID:</span>
                                    <span>#{bill.id.slice(0, 8)}...</span>
                                </div>
                                <div className="flex justify-between mt-2">
                                    <span className="font-semibold">Customer:</span>
                                    <span>{bill.customer_name}</span>
                                </div>
                                <div className="flex justify-between mt-2">
                                    <span className="font-semibold">Date:</span>
                                    <span>{new Date(bill.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-2">Items</h3>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-2">Item</th>
                                            <th className="text-center py-2">Qty</th>
                                            <th className="text-right py-2">Price</th>
                                            <th className="text-right py-2">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bill.items.map((item) => (
                                            <tr key={item.id} className="border-b">
                                                <td className="py-2">{item.name}</td>
                                                <td className="text-center py-2">{item.quantity}</td>
                                                <td className="text-right py-2">₹{item.price.toFixed(2)}</td>
                                                <td className="text-right py-2">₹{(item.quantity * item.price).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-6 text-right">
                                <div className="text-lg font-bold">Total: ₹{bill.totalAmount.toFixed(2)}</div>
                                {bill.status === 'partial' && (
                                    <div className="text-sm text-slate-500">
                                        Amount Paid: ₹{bill.amountPaid.toFixed(2)} | Remaining: ₹{(bill.totalAmount - bill.amountPaid).toFixed(2)}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
                <div className="mt-8 flex justify-end gap-4 no-print">
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-slate-200 text-slate-800 hover:bg-slate-300">
                        Close
                    </button>
                    <button onClick={() => onDelete(bill.id)} className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600">
                        Delete
                    </button>
                    <button onClick={() => onEdit(bill)} className="px-4 py-2 rounded-md bg-amber-500 text-white hover:bg-amber-600">
                        Edit
                    </button>
                    <button onClick={handlePrint} className="px-4 py-2 rounded-md bg-slate-500 text-white hover:bg-slate-600 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Print
                    </button>
                </div>
            </div>
        </div>
    );
}

export default BillDetailsModal;
