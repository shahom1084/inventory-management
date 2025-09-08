import React from 'react';

export default function StockControl({ stock, onIncrement, onDecrement, loading }) {
    return (
        <div className="flex items-center justify-center gap-1">
            <button 
                onClick={onDecrement} 
                disabled={loading || stock <= 0}
                className="w-7 h-7 flex items-center justify-center bg-yellow-400 text-yellow-900 rounded-md font-bold text-lg hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
            >
                -
            </button>
            <span className="min-w-[36px] text-center px-2 py-1 text-sm font-semibold bg-yellow-100 text-yellow-800 rounded-md">
                {loading ? '...' : stock}
            </span>
            <button 
                onClick={onIncrement} 
                disabled={loading}
                className="w-7 h-7 flex items-center justify-center bg-yellow-400 text-yellow-900 rounded-md font-bold text-lg hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
            >
                +
            </button>
        </div>
    );
}
