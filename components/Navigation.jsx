"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    ArrowRightLeft,
    History,
    Wallet,
    BarChart3,
    Bell,
    Settings,
    User,
    Menu,
    X,
    Zap,
    LogOut
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { signOutUser } from '@/lib/firebase';

export default function Navigation() {
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { currentUser, userProfile, loading } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const routes = [
        { name: 'Simulator', path: '/', icon: LayoutDashboard },
        { name: 'Compare', path: '/compare', icon: ArrowRightLeft },
        { name: 'History', path: '/history', icon: History },
        { name: 'Budget', path: '/budget-planner', icon: Wallet },
        { name: 'Analytics', path: '/funnel-leakage', icon: BarChart3 },
    ];

    const isActive = (path) => pathname === path;

    const handleSignOut = async () => {
        try {
            await signOutUser();
            router.push('/login');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-16 shadow-[0_1px_2px_rgba(0,0,0,0.05)] font-sans">
            <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 h-full">
                <div className="flex items-center justify-between h-full">

                    {/* LEFT: Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#6366F1] rounded-lg flex items-center justify-center shadow-md">
                            <Zap className="text-white fill-white" size={20} />
                        </div>
                        <span className="text-xl font-bold text-gray-900 tracking-tight">
                            CodSim<span className="text-[#6366F1]">.pro</span>
                        </span>
                    </div>

                    {/* CENTER: Navigation Links (Desktop) */}
                    <nav className="hidden md:flex items-center h-full">
                        {routes.map((route) => (
                            <Link
                                key={route.path}
                                href={route.path}
                                className={`
                                    relative h-full flex items-center px-4 text-sm font-medium transition-colors
                                    ${isActive(route.path)
                                        ? 'text-[#6366F1]'
                                        : 'text-gray-500 hover:text-[#6366F1]'
                                    }
                                `}
                            >
                                {route.name}
                                {isActive(route.path) && (
                                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#6366F1] rounded-t-full" />
                                )}
                            </Link>
                        ))}
                    </nav>

                    {/* RIGHT: Actions */}
                    <div className="hidden md:flex items-center gap-4">

                        {loading ? (
                            <div className="w-24 h-8 bg-gray-100 animate-pulse rounded-lg"></div>
                        ) : currentUser ? (
                            <>
                                {/* Notification Bell */}
                                <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                    <Bell size={20} />
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                                </button>

                                {/* Profile Dropdown Trigger */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="flex items-center gap-2 p-1 pl-2 pr-1 rounded-full border border-gray-200 hover:border-[#6366F1] hover:bg-gray-50 transition-all"
                                    >
                                        <span className="text-sm font-bold text-gray-700 max-w-[100px] truncate">
                                            {userProfile?.displayName || currentUser.displayName || 'User'}
                                        </span>
                                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 overflow-hidden">
                                            {currentUser.photoURL ? (
                                                <img src={currentUser.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={16} />
                                            )}
                                        </div>
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isProfileOpen && (
                                        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-1 transform origin-top-right z-50">
                                            <div className="px-4 py-3 border-b border-gray-50">
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Signed in as</p>
                                                <p className="text-sm font-bold text-gray-900 truncate">{currentUser.email}</p>
                                            </div>
                                            <Link href="/profile" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 font-medium">Profile Settings</Link>
                                            <button
                                                onClick={handleSignOut}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-bold flex items-center gap-2"
                                            >
                                                <LogOut size={16} /> Sign Out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/login"
                                    className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-[#6366F1] transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/signup"
                                    className="px-4 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-sm font-bold rounded-lg shadow-sm transition-all hover:shadow-md hover:scale-105"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 text-gray-600"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 shadow-xl absolute top-16 left-0 right-0 p-4 flex flex-col gap-2">
                    {routes.map((route) => (
                        <Link
                            key={route.path}
                            href={route.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`
                                flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors
                                ${isActive(route.path)
                                    ? 'bg-[#6366F1]/10 text-[#6366F1]'
                                    : 'text-gray-600 hover:bg-slate-50'
                                }
                            `}
                        >
                            <route.icon size={20} />
                            {route.name}
                        </Link>
                    ))}
                    <div className="h-px bg-gray-100 my-2" />

                    {currentUser ? (
                        <button
                            onClick={() => { handleSignOut(); setIsMobileMenuOpen(false); }}
                            className="w-full py-3 bg-red-50 text-red-600 font-bold rounded-xl flex items-center justify-center gap-2"
                        >
                            <LogOut size={18} /> Sign Out
                        </button>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full py-3 border border-gray-200 text-gray-700 font-bold rounded-xl text-center">
                                Sign In
                            </Link>
                            <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)} className="w-full py-3 bg-[#6366F1] text-white font-bold rounded-xl text-center">
                                Create Account
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
}
