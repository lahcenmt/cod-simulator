"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { resetPassword } from '@/lib/firebase';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setMessage('');
            setError('');
            setLoading(true);
            await resetPassword(email);
            setMessage('Check your email for password reset instructions');
        } catch (error) {
            setError('Failed to reset password. Check your email address.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
                <div>
                    <h2 className="text-3xl font-black text-center text-gray-900 tracking-tight">Reset Password</h2>
                    <p className="mt-2 text-center text-gray-500 font-medium">
                        Enter your email to receive reset instructions
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold border border-red-100">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm font-bold border border-green-100">
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium"
                            placeholder="you@example.com"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {loading ? 'Sending...' : 'Reset Password'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-600 font-medium">
                    <Link href="/login" className="text-indigo-600 hover:text-indigo-500 font-bold">
                        Back to Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}
