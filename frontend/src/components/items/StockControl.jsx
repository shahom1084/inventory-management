import React from 'react';

export default function StockControl({ stock, onIncrement, onDecrement, loading }) {
    return (
        <div className="flex items-center justify-between w-full max-w-[120px] bg-slate-100 rounded-full p-1">
            <button 
                onClick={onDecrement} 
                disabled={loading || stock <= 0}
                className="w-7 h-7 flex items-center justify-center bg-red-200 text-red-700 rounded-full font-bold text-lg hover:bg-red-300 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200 shrink-0"
            >
                -
            </button>
            <span className="min-w-[36px] text-center px-2 text-sm font-semibold text-slate-700">
                {loading ? '...' : stock}
            </span>
            <button 
                onClick={onIncrement} 
                disabled={loading}
                className="w-7 h-7 flex items-center justify-center bg-green-200 text-green-800 rounded-full font-bold text-lg hover:bg-green-300 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200 shrink-0"
            >
                +
            </button>
        </div>
    );
}