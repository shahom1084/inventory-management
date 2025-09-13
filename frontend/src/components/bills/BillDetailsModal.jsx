import React from 'react';
import { useShop } from '../../context/ShopContext';
import LoaderCircleIcon from '../icons/LoaderCircleIcon';

function BillDetailsModal({ bill, onClose, onEdit, onDelete, loading }) {
    const { shopDetails, loading: shopLoading } = useShop();

    if (!bill) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
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

                        <div className="mt-8 flex justify-end gap-4">
                            <button onClick={() => onDelete(bill.id)} className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600">
                                Delete
                            </button>
                            <button onClick={() => onEdit(bill)} className="px-4 py-2 rounded-md bg-amber-500 text-white hover:bg-amber-600">
                                Edit
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default BillDetailsModal;
