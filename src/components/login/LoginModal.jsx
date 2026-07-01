'use client'
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function LoginModal({ isOpen, onClose }) {
    const [cnicNtn, setCnicNtn] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: wire up actual login API call
        console.log({ cnicNtn, password });
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center px-4"
            style={{ background: 'rgba(15,26,46,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl px-6 py-8 lg:px-12 lgp:py-12 w-full max-w-xl shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
            >
                <div className='flex justify-center mb-6 lg:mb-6'>
                    <Image
                        src="/images/logo.png"
                        alt="Logo"
                        width={200}
                        height={100}
                    />
                </div>
                <button
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </button>

                <h3 className="font-semibold text-[#0F1A2E] text-2xl mb-1">Welcome Back</h3>
                <p className="text-slate-500 text-sm mb-6">Login to your Digital Invoicing Tool.</p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">CNIC/NTN</label>
                        <input
                            className="form-input"
                            placeholder="Enter your Username"
                            required
                            value={cnicNtn}
                            onChange={(e) => setCnicNtn(e.target.value)}
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                        <div className="relative">
                            <input
                                className="form-input pr-10"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                {!showPassword ? (
                                    <EyeSlashIcon className="w-5 h-5" />
                                ) : (
                                    <EyeIcon className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                    <button type="submit" className="btn-primary w-full justify-center text-base py-3">
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}