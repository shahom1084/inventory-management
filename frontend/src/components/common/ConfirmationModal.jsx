import React from 'react';

export default function ConfirmationModal({ open, onClose, onConfirm, title, message }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-sm mx-auto bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-semibold text-slate-800">{title || 'Confirm Action'}</h3>
                <p className="text-sm text-slate-600 mt-2">{message || 'Are you sure you want to proceed?'}</p>
                <div className="flex items-center justify-end gap-3 mt-6">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="px-4 py-2 rounded-md border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                    <button 
                        type="button" 
                        onClick={onConfirm} 
                        className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-medium shadow-sm"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}
