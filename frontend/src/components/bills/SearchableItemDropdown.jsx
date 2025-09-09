import React, { useState, useMemo, useRef, useEffect } from 'react';

export default function SearchableItemDropdown({ items, selectedItem, onItemSelected, onClear }) {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const filteredItems = useMemo(() => {
        if (!query) return items;
        return items.filter(item => item.name.toLowerCase().includes(query.toLowerCase()));
    }, [query, items]);

    const handleSelect = (item) => {
        onItemSelected(item);
        setQuery('');
        setIsOpen(false);
    };

    const handleChange = (e) => {
        const newQuery = e.target.value;
        setQuery(newQuery);
        if (!newQuery) {
            onClear();
        }
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const displayValue = query || (selectedItem ? selectedItem.name : '');

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <input
                type="text"
                value={displayValue}
                onChange={handleChange}
                onFocus={() => setIsOpen(true)}
                placeholder="Search and select an item..."
                className="w-full px-3 py-2 border rounded-md"
            />
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredItems.length > 0 ? (
                        filteredItems.map(item => (
                            <div
                                key={item.id}
                                onClick={() => handleSelect(item)}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            >
                                {item.name}
                            </div>
                        ))
                    ) : (
                        <div className="px-4 py-2 text-gray-500">No items found</div>
                    )}
                </div>
            )}
        </div>
    );
}