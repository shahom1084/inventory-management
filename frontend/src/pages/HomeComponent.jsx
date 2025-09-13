import React from 'react';
import { useShop } from '../context/ShopContext.jsx';

export default function HomeComponent({ onLogout }) {
    const { shopName, initials } = useShop();

    const goto = (e, path) => {
        e.preventDefault();
        window.location.hash = path;
    };

    return (
        <div className="min-h-screen w-full bg-[#f7f5f2]">
            {/* Top Navigation Bar */}
            <header className="w-full bg-slate-800 text-slate-100 shadow">
                <div className="w-full px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-amber-500/90 text-white flex items-center justify-center shadow-sm">
                            <span className="text-sm font-bold">{initials}</span>
                        </div>
                        {/* Display the dynamic shop name here */}
                        <span className="font-semibold tracking-wide">{shopName || 'Shop Name'}</span>
                    </div>
                    <nav className="hidden md:flex items-center gap-6 text-sm">
                        <a className="hover:text-white/90 text-slate-300" href="#/home" onClick={(e) => goto(e, '#/home')}>Home</a>
                        <a className="hover:text-white/90 text-slate-300" href="#/items" onClick={(e) => goto(e, '#/items')}>Items</a>
                        <a className="hover:text-white/90 text-slate-300" href="#/bills" onClick={(e) => goto(e, '#/bills')}>Bills</a>
                        <a className="hover:text-white/90 text-slate-300" href="#/customers" onClick={(e) => goto(e, '#/customers')}>Customers</a>
                    </nav>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onLogout}
                            className="text-xs sm:text-sm bg-amber-500 hover:bg-amber-600 transition-colors px-3 py-1.5 rounded-md text-white shadow-sm"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <main className="w-full px-4 sm:px-6 lg:px-10 py-8 lg:py-10">
                {/* Quick Nav for small screens */}
                <div className="md:hidden mb-5 flex flex-wrap items-center gap-3 text-sm">
                    <a href="#/home" onClick={(e) => goto(e, '#/home')} className="px-3 py-1 rounded-full bg-white shadow text-slate-700">Home</a>
                    <a href="#/items" onClick={(e) => goto(e, '#/items')} className="px-3 py-1 rounded-full bg-white shadow text-slate-500">Items</a>
                    <a href="#/bills" onClick={(e) => goto(e, '#/bills')} className="px-3 py-1 rounded-full bg-white shadow text-slate-500">Bills</a>
                    <a href="#/customers" onClick={(e) => goto(e, '#/customers')} className="px-3 py-1 rounded-full bg-white shadow text-slate-500">Customers</a>
                </div>

                {/* Dashboard Grid */}
                <div className="grid gap-5 lg:gap-7 grid-cols-1 sm:grid-cols-2 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
                    {/* Card: Items */}
                    <button onClick={(e) => goto(e, '#/items')} className="text-left bg-white rounded-2xl shadow p-6 flex items-center gap-5 border border-slate-100 min-h-[160px] hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V7a2 2 0 00-2-2h-4m-4 0H6a2 2 0 00-2 2v6m0 0v4a2 2 0 002 2h4m8-6v4a2 2 0 01-2 2h-4M9 7h.01M9 11h.01M13 7h.01M13 11h.01" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-slate-800 font-semibold">Items</h3>
                            <p className="text-xs text-slate-500">Manage inventory & pricing</p>
                            <p className="mt-2 text-sm text-emerald-600 font-semibold">0 Total Items</p>
                        </div>
                    </button>

                    {/* Card: Customers */}
                    <button onClick={(e) => goto(e, '#/customers')} className="text-left bg-white rounded-2xl shadow p-6 flex items-center gap-5 border border-slate-100 min-h-[160px] hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-4-4h-1m-4 6v-2a4 4 0 00-4-4H8m4-4a4 4 0 100-8 4 4 0 000 8z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-slate-800 font-semibold">Customers</h3>
                            <p className="text-xs text-slate-500">Customer rates & pricing</p>
                            <p className="mt-2 text-sm text-teal-600 font-semibold">0 Total Customers</p>
                        </div>
                    </button>

                    {/* Card: Bills */}
                    <button onClick={(e) => goto(e, '#/bills')} className="text-left bg-white rounded-2xl shadow p-6 flex items-center gap-5 border border-slate-100 min-h-[160px] hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l2 2 4-4m-7 6h8a2 2 0 002-2V7a2 2 0 00-2-2h-5l-2-2H7a2 2 0 00-2 2v3" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-slate-800 font-semibold">Bills</h3>
                            <p className="text-xs text-slate-500">Create & manage invoices</p>
                            <p className="mt-2 text-sm text-rose-600 font-semibold">0 Total Bills</p>
                        </div>
                    </button>
                </div>
            </main>
        </div>
    );
}
