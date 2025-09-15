import React, { useState, useEffect, useCallback, useMemo } from 'react';
import SearchableItemDropdown from './SearchableItemDropdown';
import CustomDropdown from '../common/CustomDropdown';
import getApiUrl from '../../utils/api';

export default function NewBillModal({ open, onClose, onCreated }) {
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [status, setStatus] = useState('paid');
    const [amountPaid, setAmountPaid] = useState(0);
    const [billItems, setBillItems] = useState([{ id: 1, item: null, quantity: 1, price: 0 }]);
    const [allItems, setAllItems] = useState([]);
    const [priceType, setPriceType] = useState('retail_price');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [phoneError, setPhoneError] = useState('');

    const priceTypeOptions = [
        { label: 'Retail', value: 'retail_price' },
        { label: 'Wholesale', value: 'wholesale_price' },
        { label: 'Cost Price', value: 'cost_price' },
        { label: 'Customer Specific', value: 'customer_specific' },
    ];

    const statusOptions = [
        { label: 'Unpaid', value: 'unpaid' },
        { label: 'Paid', value: 'paid' },
        { label: 'Partial', value: 'partial' },
    ];

    const fetchItems = useCallback(async () => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(getApiUrl('/items'), { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            if (res.ok) {
                setAllItems(data.items || []);
            } else {
                throw new Error(data.error || 'Failed to fetch items');
            }
        } catch (e) {
            setError(e.message);
        }
    }, []);

    const fetchCustomerPrices = async (phoneNumber) => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(getApiUrl(`/customer-prices?phone_number=${phoneNumber}`), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                if (data.customer_items && data.customer_items.length > 0) {
                    const itemsWithCustomPrices = data.items.map(item => {
                        const customerItem = data.customer_items.find(ci => ci.id === item.id);
                        if (customerItem) {
                            return { ...item, custom_price: customerItem.custom_price };
                        }
                        return item;
                    });
                    setAllItems(itemsWithCustomPrices);
                    setPriceType('customer_specific');
                } else {
                    setAllItems(data.items);
                }
            } else {
                throw new Error(data.error || 'Failed to fetch customer prices');
            }
        } catch (e) {
            setError(e.message);
        }
    };

    useEffect(() => {
        if (open) {
            fetchItems();
        }
    }, [open, fetchItems]);

    useEffect(() => {
        if (customerPhone.length === 10) {
            fetchCustomerPrices(customerPhone);
        }
    }, [customerPhone]);

    const handleItemChange = (rowId, selectedItem) => {
        setBillItems(billItems.map(row => {
            if (row.id === rowId) {
                let price = 0;
                if (selectedItem) {
                    if (priceType === 'customer_specific' && selectedItem.custom_price) {
                        price = parseFloat(selectedItem.custom_price);
                    } else {
                        price = parseFloat(selectedItem[priceType]) || 0;
                    }
                }
                return { ...row, item: selectedItem, price: price };
            }
            return row;
        }));
    };

    const handleQuantityChange = (rowId, quantity) => {
        const numQuantity = Math.max(0, Number(quantity));
        setBillItems(billItems.map(row => row.id === rowId ? { ...row, quantity: numQuantity } : row));
    };

    const handlePriceChange = (rowId, price) => {
        const numPrice = Math.max(0, Number(price));
        setBillItems(billItems.map(row => row.id === rowId ? { ...row, price: numPrice } : row));
    };

    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value.length <= 10) {
            setCustomerPhone(value);
            setPhoneError('');
        }
    };

    const validatePhone = () => {
        if (customerPhone && customerPhone.length !== 10) {
            setPhoneError('Phone number must be 10 digits.');
        } else {
            setPhoneError('');
        }
    };

    const addNewRow = () => {
        setBillItems([...billItems, { id: Date.now(), item: null, quantity: 1, price: 0 }]);
    };

    const removeRow = (rowId) => {
        setBillItems(billItems.filter(row => row.id !== rowId));
    };

    const totalAmount = useMemo(() => {
        return billItems.reduce((acc, row) => {
            return acc + (row.price * row.quantity);
        }, 0);
    }, [billItems]);

    const amountRemaining = totalAmount - amountPaid;

    const handleSubmit = async (e) => {
        e.preventDefault();
        validatePhone();
        if (phoneError) return;

        setLoading(true);
        setError('');

        const billData = {
            customerName,
            customerPhone,
            billItems,
            totalAmount,
            status,
            amountPaid: status === 'partial' ? amountPaid : undefined,
        };

        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(getApiUrl('/create-bill'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(billData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create bill');
            }

            onCreated();
            onClose();
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setBillItems(currentItems => currentItems.map(row => {
            if (row.item) {
                let newPrice = 0;
                if (priceType === 'customer_specific' && row.item.custom_price) {
                    newPrice = parseFloat(row.item.custom_price);
                } else {
                    newPrice = parseFloat(row.item[priceType]) || 0;
                }
                return { ...row, price: newPrice };
            }
            return row;
        }));
    }, [priceType]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-2 sm:p-4">
            <form id="bill-form" onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-md md:max-w-2xl lg:max-w-4xl max-h-[90vh] flex flex-col">
                <h3 className="text-lg md:text-xl font-semibold text-slate-800 mb-4">Create New Bill</h3>
                
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <input type="text" placeholder="Customer Name" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" />
                    </div>
                    <div>
                        <input 
                            type="text" 
                            placeholder="Customer Phone" 
                            value={customerPhone} 
                            onChange={handlePhoneChange} 
                            onBlur={validatePhone}
                            className={`w-full px-3 py-2 border rounded-md text-sm ${phoneError ? 'border-red-500' : ''}`}
                        />
                        {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
                    </div>
                    <div>
                        <CustomDropdown
                            options={statusOptions}
                            selectedOption={statusOptions.find(option => option.value === status)}
                            onSelect={(option) => setStatus(option.value)}
                            placeholder="Select Status"
                        />
                    </div>
                </div>

                <div className="flex-grow border-t border-b py-2">
                    <div className="w-full">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2 gap-2">
                            <h4 className="font-semibold">Bill Items</h4>
                            <div className="relative flex items-center gap-2">
                                <label className="text-xs sm:text-sm font-medium">Price Type:</label>
                                <CustomDropdown
                                    options={priceTypeOptions}
                                    selectedOption={priceTypeOptions.find(option => option.value === priceType)}
                                    onSelect={(option) => setPriceType(option.value)}
                                    placeholder="Select Price Type"
                                />
                            </div>
                        </div>
                        
                        <div className="w-full">
                            <table className="min-w-full text-left text-xs sm:text-sm">
                                <thead className="bg-slate-50 text-slate-600 sticky top-0">
                                    <tr>
                                        <th className="px-2 py-2 font-medium w-2/5">Item</th>
                                        <th className="px-2 py-2 font-medium">Price</th>
                                        <th className="px-2 py-2 font-medium">Qty</th>
                                        <th className="px-2 py-2 font-medium">Total</th>
                                        <th className="px-2 py-2 font-medium"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {billItems.map((row, index) => {
                                        const total = row.price * row.quantity;
                                        const siUnit = row.item?.si_unit ? `/${row.item.si_unit}` : '';
                                        return (
                                            <tr key={row.id} className="border-t">
                                                <td className="px-1 py-1 align-top">
                                                    <SearchableItemDropdown 
                                                        items={allItems} 
                                                        selectedItem={row.item}
                                                        onItemSelected={(item) => handleItemChange(row.id, item)}
                                                        onClear={() => handleItemChange(row.id, null)}
                                                    />
                                                </td>
                                                <td className="px-2 py-2 align-top">
                                                    <div className="flex items-center">
                                                        <span className="mr-1">₹</span>
                                                        <input 
                                                            type="number"
                                                            value={row.price.toFixed(2)}
                                                            onChange={(e) => handlePriceChange(row.id, e.target.value)}
                                                            className="w-24 border rounded-md p-1"
                                                        />
                                                        {siUnit && <span className="ml-1 text-slate-500">{siUnit}</span>}
                                                    </div>
                                                </td>
                                                <td className="px-1 py-1 align-top">
                                                    <input 
                                                        type="number" 
                                                        value={row.quantity} 
                                                        onChange={(e) => handleQuantityChange(row.id, e.target.value)} 
                                                        className="w-16 text-center border rounded-md p-1"
                                                    />
                                                </td>
                                                <td className="px-2 py-2 align-top">₹{total.toFixed(2)}</td>
                                                <td className="px-1 py-1 align-top">
                                                    <button type="button" onClick={() => removeRow(row.id)} className="text-red-500 hover:text-red-700 font-bold text-lg">
                                                        &times;
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <button type="button" onClick={addNewRow} className="mt-3 text-sm text-amber-600 hover:text-amber-800 font-semibold">+ Add another item</button>
                    </div>
                </div>

                <div className="mt-4 text-right">
                    <h4 className="text-xl md:text-2xl font-bold">Total: ₹{totalAmount.toFixed(2)}</h4>
                    {status === 'partial' && (
                        <div className="flex justify-end items-center gap-4 mt-2">
                            <div className="flex items-center gap-2">
                                <label htmlFor="amountPaid" className="text-sm font-medium">Amount Paid:</label>
                                <input
                                    type="number"
                                    id="amountPaid"
                                    value={amountPaid}
                                    onChange={(e) => setAmountPaid(Number(e.target.value))}
                                    className="w-24 border rounded-md p-1 text-right"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <label htmlFor="amountRemaining" className="text-sm font-medium">Amount Remaining:</label>
                                <input
                                    type="text"
                                    id="amountRemaining"
                                    value={`₹${amountRemaining.toFixed(2)}`}
                                    readOnly
                                    className="w-24 border rounded-md p-1 text-right bg-slate-100"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-sm font-semibold" disabled={loading}>Cancel</button>
                    <button type="submit" form="bill-form" className="px-6 py-2 rounded-md bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Bill'}
                    </button>
                </div>
            </form>
        </div>
    );
}
