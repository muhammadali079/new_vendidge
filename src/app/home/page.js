'use client'
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import LoginModal from '@/components/login/LoginModal'

function useInView(threshold = 0.15) {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) setInView(true); },
            { threshold }
        );
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, [threshold]);
    return [ref, inView];
}

function AnimSection({ children, className = '', delay = 0 }) {
    const [ref, inView] = useInView();
    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : 'translateY(40px)',
                transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
            }}
        >
            {children}
        </div>
    );
}

function FeatureCard({ icon, title, desc, items, delay }) {
    const [ref, inView] = useInView();
    return (
        <div
            ref={ref}
            className="group relative bg-white rounded-2xl p-7 border border-blue-100 hover:border-blue-300 hover:shadow-2xl transition-all duration-500 overflow-hidden"
            style={{
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.97)',
                transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms, box-shadow 0.3s ease, border-color 0.3s ease`,
            }}
        >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.03) 0%, rgba(6,182,212,0.05) 100%)' }} />
            <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 text-2xl"
                    style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #CFFAFE 100%)' }}>
                    {icon}
                </div>
                <h3 className="font-bold text-[#0F1A2E] text-lg mb-2 leading-snug">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">{desc}</p>
                {items && (
                    <ul className="space-y-1.5">
                        {items.map((item, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                                <span className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ background: 'linear-gradient(135deg, #2563EB, #06B6D4)' }}>
                                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                                        <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>
                                {item}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

function SecurityCard({ icon, title, desc, delay }) {
    const [ref, inView] = useInView();
    return (
        <div
            ref={ref}
            className="group relative rounded-2xl p-7 border border-blue-900/30 hover:border-cyan-400/50 transition-all duration-500 overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, #0F1A2E 0%, #1A2E4A 100%)',
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : 'translateY(30px)',
                transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
            }}
        >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(6,182,212,0.08) 100%)' }} />
            <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 text-2xl"
                    style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.2), rgba(6,182,212,0.2))', border: '1px solid rgba(6,182,212,0.3)' }}>
                    {icon}
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{title}</h3>
                <p className="text-blue-200/70 text-sm leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}

export default function Home() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [formData, setFormData] = useState({ name: '', company: '', email: '', phone: '', message: '' });
    const [submitted, setSubmitted] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);

    const sectionIds = ['home', 'features', 'security', 'integration', 'contact'];
    const [activeSection, setActiveSection] = useState('home');

    const handleNavClick = (e, id) => {
        e.preventDefault();
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setActiveSection(id);
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
        );

        sectionIds.forEach((id) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

    const handleSubmit = (e) => {
        e.preventDefault();

        const message = `*New Inquiry - Vendidge*
    Name: ${formData.name}
    Company: ${formData.company || '-'}
    Email: ${formData.email}
    Phone: ${formData.phone || '-'}
    Message: ${formData.message || '-'}`;

        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');

        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 4000);
        setFormData({ name: '', company: '', email: '', phone: '', message: '' });
    };

    const handleRegisterClick = () => {
        if (!WHATSAPP_NUMBER) {
            console.error('WhatsApp number not configured');
            return;
        }
        const message = `Hi, I'd like to register for Vendidge.`;
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const navLinks = ['Home', 'Features', 'Security', 'Integration', 'Contact'];

    const features = [
        {
            icon: '🧾',
            title: 'Unlimited Invoice Processing',
            desc: 'Generate and transmit unlimited sales invoices directly connected with FBR infrastructure.',
            items: ['Unlimited Customers', 'Unlimited Product Catalog', 'Unlimited Products Per Invoice'],
        },
        {
            icon: '👥',
            title: 'Multi User Management',
            desc: 'Granular permission control across all system modules for your entire team.',
            items: ['Customer Management', 'Product Management', 'Invoice Creation & Access', 'User Rights Management'],
        },
        {
            icon: '☁️',
            title: 'Cloud Web Access',
            desc: 'Access the platform globally through browser-based secure architecture.',
            items: null,
        },
        {
            icon: '📱',
            title: 'Progressive Web App',
            desc: 'Install Vendidge on any device — no software installation required.',
            items: ['Desktop', 'Mobile Phones', 'Tablets', 'Laptops'],
        },
    ];

    const securityItems = [
        { icon: '🏗️', title: 'Dedicated Infrastructure', desc: 'Platform runs through isolated dedicated infrastructure for maximum reliability and uptime.' },
        { icon: '🔌', title: 'Secure API Architecture', desc: 'All FBR communication via protected server-side API — no direct client-side exposure.' },
        { icon: '🔑', title: 'Token Based Authentication', desc: 'Secure FBR authentication using protected token-based verification protocols.' },
        { icon: '🛡️', title: 'Protected Request Layer', desc: 'Invoice requests validated through internal handling layers before transmission.' },
        { icon: '🔒', title: 'Encrypted Communication', desc: 'Secure encrypted channels between users, platform, and Pakistan tax infrastructure.' },
        { icon: '🌐', title: 'Global Secure Access', desc: 'Access Vendidge securely from anywhere in the world with enterprise-grade protection.' },
    ];

    const highlights = [
        '● FBR Digital Invoicing Connected', '● Unlimited Invoices', '● Unlimited Customers',
        '● Unlimited Products', '● Unlimited Products Per Invoice', '● Web-Based Secure Access',
        '● Multi User Management', '● Secure Dedicated Infrastructure', '● PWA Support On Any Device',
    ];

    const particles = [0, 1, 2, 3, 4, 5, 6, 7];

    return (
        <>
            <nav
                className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
                style={{
                    background: mounted && scrolled ? 'rgba(255,255,255,0.92)' : 'transparent',
                    backdropFilter: mounted && scrolled ? 'blur(20px)' : 'none',
                    borderBottom: mounted && scrolled ? '1px solid rgba(37,99,235,0.08)' : 'none',
                    boxShadow: mounted && scrolled ? '0 4px 30px rgba(0,0,0,0.06)' : 'none',
                }}
            >
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <a href="#" className="flex items-center gap-3">
                        <Image
                            src="/images/logo.png"
                            alt="Logo"
                            width={200}
                            height={100}
                        />
                    </a>
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map(link => {
                            const id = link.toLowerCase();
                            return (
                                <Link
                                    key={link}
                                    href={`#${id}`}
                                    onClick={(e) => handleNavClick(e, id)}
                                    className={`nav-link ${activeSection === id ? 'nav-link-active' : ''}`}
                                >
                                    {link}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        <button onClick={() => setLoginOpen(true)} className="btn-secondary" style={{ fontSize: '0.875rem' }}>Login</button>
                        <button onClick={handleRegisterClick} className="btn-primary" style={{ fontSize: '0.875rem' }}>Register</button>
                    </div>

                    <button
                        className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                    >
                        <span className="block w-6 h-0.5 bg-gray-700 transition-all" style={{ transform: mounted && menuOpen ? 'rotate(45deg) translateY(8px)' : 'none' }} />
                        <span className="block w-6 h-0.5 bg-gray-700 transition-all" style={{ opacity: mounted && menuOpen ? 0 : 1 }} />
                        <span className="block w-6 h-0.5 bg-gray-700 transition-all" style={{ transform: mounted && menuOpen ? 'rotate(-45deg) translateY(-8px)' : 'none' }} />
                    </button>
                </div>

                <div
                    className="md:hidden overflow-hidden transition-all duration-300"
                    style={{
                        maxHeight: mounted && menuOpen ? '400px' : '0',
                        background: 'rgba(255,255,255,0.98)',
                        backdropFilter: 'blur(20px)',
                    }}
                >
                    <div className="px-6 py-4 flex flex-col gap-3 border-t border-blue-50">
                        {navLinks.map(link => {
                            const id = link.toLowerCase();
                            return (
                                <Link
                                    key={link}
                                    href={`#${id}`}
                                    className={`text-gray-700 font-medium py-2 ${activeSection === id ? 'nav-link-active' : ''}`}
                                    onClick={(e) => {
                                        handleNavClick(e, id);
                                        setMenuOpen(false);
                                    }}
                                >
                                    {link}
                                </Link>
                            );
                        })}
                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setLoginOpen(true)} className="btn-secondary flex-1 justify-center" style={{ fontSize: '0.875rem' }}>Login</button>
                            <button onClick={handleRegisterClick} className="btn-primary" style={{ fontSize: '0.875rem' }}>Register</button>
                        </div>
                    </div>
                </div>
            </nav>

            <section id="home" className="hero-bg min-h-screen flex items-center pt-20 pb-16">
                <div className="blob blob-1" />
                <div className="blob blob-2" />
                <div className="blob blob-3" />
                <div className="grid-lines" />

                {particles.map((i) => (
                    <div key={i} className="particle" style={{
                        left: `${10 + i * 11}%`,
                        bottom: `${15 + (i % 3) * 10}%`,
                        animationDuration: `${3 + i * 0.7}s`,
                        animationDelay: `${i * 0.4}s`,
                    }} />
                ))}

                <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="hero-enter-1 mb-6">
                            <span className="badge-pulse section-label">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                FBR Connected Platform
                            </span>
                        </div>

                        <h1 className="hero-enter-2 font-black text-[#0F1A2E] leading-[1.08] mb-6" style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)' }}>
                            Pakistan&apos;s Modern{' '}
                            <span className="gradient-text">FBR Connected</span>{' '}
                            Digital Invoicing Platform
                        </h1>

                        <p className="hero-enter-3 text-slate-600 leading-relaxed mb-3 max-w-lg" style={{ fontSize: '1.05rem' }}>
                            Built for businesses to generate secure digital invoices connected directly with Pakistan&apos;s Federal Board of Revenue (FBR) infrastructure.
                        </p>
                        <p className="hero-enter-4 mb-8">
                            <span className="font-mono text-xs font-semibold px-2 py-1 rounded-md"
                                style={{ background: 'linear-gradient(135deg, #EFF6FF, #CFFAFE)', color: '#1D4ED8', border: '1px solid #BFDBFE' }}>
                                SRO 709(I)/2025 Compliant
                            </span>
                        </p>

                        <div className="hero-enter-5 flex flex-wrap gap-4 mb-10">
                            <button onClick={handleRegisterClick} className="btn-primary" style={{ fontSize: '0.875rem' }}>Register
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                            <button onClick={() => setLoginOpen(true)} className="btn-secondary text-base">Login</button>
                        </div>

                        <div className="hero-enter-6 flex flex-wrap gap-2">
                            {highlights.slice(0, 6).map((h, i) => (
                                <span key={i} className="highlight-chip">{h}</span>
                            ))}
                        </div>
                    </div>

                    <div className="hero-visual relative flex items-center justify-center">
                        <div className="relative w-full max-w-md">
                            <div className="absolute inset-0 rounded-3xl" style={{
                                background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(6,182,212,0.1))',
                                filter: 'blur(40px)',
                                transform: 'scale(1.1)',
                            }} />

                            <div className="relative bg-white rounded-2xl p-6 shadow-2xl border border-blue-100">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <div className="font-black text-[#0F1A2E] text-lg">Tax Invoice</div>
                                        <div className="text-slate-400 text-xs font-mono">#INV-2025-07834</div>
                                    </div>
                                    <div className="px-3 py-1 rounded-full text-xs font-bold"
                                        style={{ background: 'linear-gradient(135deg, #DCFCE7, #D1FAE5)', color: '#15803D' }}>
                                        ✓ FBR Submitted
                                    </div>
                                </div>

                                <div className="relative mb-4 rounded-xl p-4" style={{ background: '#F8FAFF', height: '100px' }}>
                                    <svg width="100%" height="100%" viewBox="0 0 320 80" preserveAspectRatio="none">
                                        <defs>
                                            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#2563EB" />
                                                <stop offset="100%" stopColor="#06B6D4" />
                                            </linearGradient>
                                        </defs>
                                        <path className="data-line" d="M20 40 Q80 10 160 40 Q240 70 300 40"
                                            stroke="url(#grad1)" strokeWidth="2" fill="none" />
                                        <path className="data-line data-line-2" d="M20 55 Q80 25 160 55 Q240 85 300 55"
                                            stroke="url(#grad1)" strokeWidth="1.5" fill="none" opacity="0.5" />
                                        <path className="data-line data-line-3" d="M20 25 Q80 0 160 25 Q240 55 300 25"
                                            stroke="url(#grad1)" strokeWidth="1" fill="none" opacity="0.3" />
                                        {/* <circle className="data-dot" cx="20" cy="40" r="5" fill="#2563EB" /> */}
                                        <circle className="data-dot" cx="160" cy="40" r="6" fill="#06B6D4" style={{ animationDelay: '0.5s' }} />
                                        <circle className="data-dot" cx="300" cy="40" r="5" fill="#2563EB" style={{ animationDelay: '1s' }} />
                                    </svg>
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-blue-700">Vendidge</div>
                                    <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 text-xs font-semibold text-cyan-600">Secure API</div>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-blue-700">FBR</div>
                                </div>

                                {[
                                    { label: 'Customer', value: 'Ahmed Enterprises' },
                                    { label: 'Amount', value: 'PKR 485,000' },
                                    { label: 'Tax (17%)', value: 'PKR 82,450' },
                                ].map((row, i) => (
                                    <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                                        <span className="text-slate-400 text-xs">{row.label}</span>
                                        <span className="font-semibold text-[#0F1A2E] text-sm">{row.value}</span>
                                    </div>
                                ))}
                                <div className="mt-4 pt-3 flex justify-between items-center">
                                    <span className="text-slate-500 text-sm font-medium">Total</span>
                                    <span className="font-black text-lg gradient-text">PKR 567,450</span>
                                </div>
                            </div>

                            {/* Floating badges */}
                            <div className="float-card-1 absolute -top-4 -right-4 bg-white rounded-xl px-4 py-3 shadow-xl border border-blue-50 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{ background: 'linear-gradient(135deg, #2563EB, #06B6D4)' }}>
                                    <span className="text-white font-bold text-xs">FBR</span>
                                </div>
                                <div>
                                    <div className="font-bold text-[#0F1A2E] text-xs">Connected</div>
                                    <div className="text-green-500 text-xs font-medium">● Live</div>
                                </div>
                            </div>

                            <div className="float-card-2 absolute -bottom-4 -left-4 bg-white rounded-xl px-4 py-3 shadow-xl border border-blue-50">
                                <div className="text-xs text-slate-500 mb-0.5">Invoices Sent</div>
                                <div className="font-black gradient-text text-xl">∞ Unlimited</div>
                            </div>

                            <div className="float-card-3 absolute top-1/2 -right-6 -translate-y-1/2 rounded-xl px-4 py-3 shadow-xl"
                                style={{ background: '#0F1A2E' }}>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                    <div className="text-white text-xs font-semibold">Encrypted</div>
                                </div>
                                <div className="text-blue-300 text-xs mt-0.5">AES-256 Secure</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
                    <div className="text-xs text-slate-400 font-medium">Scroll to explore</div>
                    <div className="w-5 h-8 border-2 border-slate-300 rounded-full flex items-start justify-center pt-1.5">
                        <div className="w-1 h-2 bg-slate-400 rounded-full" style={{ animation: 'scrollDot 1.5s ease-in-out infinite' }} />
                    </div>
                </div>
            </section>

            <section style={{ background: 'linear-gradient(135deg, #0F1A2E 0%, #1A2E4A 100%)' }}>
                <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                        { label: 'Invoice Limit', value: '∞', desc: 'Unlimited' },
                        { label: 'Customers', value: '∞', desc: 'Unlimited' },
                        { label: 'Products Per Invoice', value: '∞', desc: 'Unlimited' },
                        { label: 'Uptime SLA', value: '99%', desc: 'Guaranteed' },
                    ].map((stat, i) => (
                        <div key={i} className="text-center">
                            <div className="stat-number">{stat.value}</div>
                            <div className="text-white font-semibold mt-1 text-sm">{stat.label}</div>
                            <div className="text-blue-400 text-xs mt-0.5">{stat.desc}</div>
                        </div>
                    ))}
                </div>
            </section>

            <section id="features" className="py-28" style={{ background: '#F8FAFF' }}>
                <div className="max-w-7xl mx-auto px-6">
                    <AnimSection className="text-center mb-16">
                        <div className="flex justify-center mb-4">
                            <span className="section-label">⚡ Platform Features</span>
                        </div>
                        <h2 className="font-black text-[#0F1A2E] mb-4 leading-tight" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
                            Complete Sales Panel Built For{' '}
                            <span className="gradient-text">Compliance & Scale</span>
                        </h2>
                        <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed">
                            Everything your business needs to manage invoicing, customers, products, and compliance — all in one secure, cloud-based platform.
                        </p>
                    </AnimSection>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((f, i) => (
                            <FeatureCard key={i} {...f} delay={i * 100} />
                        ))}
                    </div>

                    <AnimSection className="mt-14" delay={200}>
                        <div className="bg-white rounded-2xl p-8 border border-blue-100 shadow-sm">
                            <div className="text-center mb-6">
                                <span className="font-bold text-[#0F1A2E]">Everything included — all in one platform</span>
                            </div>
                            <div className="flex flex-wrap justify-center gap-3">
                                {highlights.map((h, i) => (
                                    <span key={i} className="highlight-chip">{h}</span>
                                ))}
                            </div>
                        </div>
                    </AnimSection>
                </div>
            </section>

            <section id="security" className="py-28 relative overflow-hidden" style={{ background: '#0A1628' }}>
                <div className="scan-line" />

                <div className="absolute inset-0 pointer-events-none">
                    <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '60%', height: '60%', background: 'radial-gradient(ellipse, rgba(37,99,235,0.08) 0%, transparent 70%)' }} />
                    <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '50%', height: '50%', background: 'radial-gradient(ellipse, rgba(6,182,212,0.06) 0%, transparent 70%)' }} />
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: 'linear-gradient(rgba(37,99,235,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.05) 1px, transparent 1px)',
                        backgroundSize: '50px 50px',
                    }} />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6">
                    <AnimSection className="text-center mb-16">
                        <div className="flex justify-center mb-4">
                            <span className="section-label" style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(6,182,212,0.15))', border: '1px solid rgba(6,182,212,0.3)', color: '#67E8F9' }}>
                                🔒 Enterprise Security
                            </span>
                        </div>
                        <h2 className="font-black text-white mb-4 leading-tight" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
                            Enterprise Grade Infrastructure{' '}
                            <span className="gradient-text">Designed For Secure</span>{' '}
                            Tax Compliance
                        </h2>
                        <p className="text-blue-300/70 max-w-2xl mx-auto leading-relaxed">
                            Your tax data and business information are protected by multiple layers of enterprise-grade security architecture.
                        </p>
                    </AnimSection>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {securityItems.map((s, i) => (
                            <SecurityCard key={i} {...s} delay={i * 100} />
                        ))}
                    </div>

                    <AnimSection className="mt-12" delay={200}>
                        <div className="rounded-2xl p-7 border border-blue-900/40"
                            style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(6,182,212,0.05))' }}>
                            <div className="flex flex-wrap justify-between gap-4">
                                {['● Dedicated Infrastructure', '● Secure API Calls', '● Server Side Validation', '● Token Authentication', '● Encrypted Communication', '● Global Secure Access'].map((item, i) => (
                                    <span key={i} className="text-sm font-semibold text-white">{item}</span>
                                ))}
                            </div>
                        </div>
                    </AnimSection>
                </div>
            </section>

            <section id="integration" className="py-28" style={{ background: 'white' }}>
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <AnimSection>
                            <div className="mb-4">
                                <span className="section-label">🇵🇰 Pakistan Tax Compliance</span>
                            </div>
                            <h2 className="font-black text-[#0F1A2E] mb-6 leading-tight" style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)' }}>
                                Built Specifically For{' '}
                                <span className="gradient-text">Pakistan Tax Compliance</span>
                            </h2>
                            <p className="text-slate-500 leading-relaxed mb-5">
                                Vendidge is engineered from the ground up to work natively with Pakistan&apos;s FBR digital invoicing infrastructure, ensuring every invoice meets regulatory requirements automatically.
                            </p>

                            <div className='mb-4'>
                                <Image
                                    src="/images/dis.jpeg"
                                    alt="Logo"
                                    width={150}
                                    height={80}
                                    className='w-[160px] h-[60px] lg:w-[300px] lg:h-[100px]  rounded-lg'
                                />
                            </div>

                            <div className="space-y-4">
                                {[
                                    { icon: '🔗', title: 'Direct FBR Integration', desc: 'Integrated directly with Federal Board of Revenue digital invoicing system.' },
                                    { icon: '📋', title: 'SRO 709(I)/2025 Compliance', desc: 'Designed according to all requirements defined under the current SRO.' },
                                    { icon: '✅', title: 'Tax Validation Layer', desc: 'Invoice data passes automatic validation checks before FBR submission.' },
                                    { icon: '🧮', title: 'Automatic Tax Rate Support', desc: 'Supports all tax rate structures according to current FBR requirements.' },
                                ].map((item, i) => (
                                    <AnimSection key={i} delay={i * 100}
                                        className="flex gap-4 p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-[#F8FAFF] transition-all duration-300">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                                            style={{ background: 'linear-gradient(135deg, #EFF6FF, #CFFAFE)' }}>
                                            {item.icon}
                                        </div>
                                        <div>
                                            <div className="font-bold text-[#0F1A2E] text-sm mb-1">{item.title}</div>
                                            <div className="text-slate-500 text-sm leading-relaxed">{item.desc}</div>
                                        </div>
                                    </AnimSection>
                                ))}
                            </div>
                        </AnimSection>

                        <AnimSection delay={200}>
                            <div className="relative rounded-2xl p-6 lg:p-8 border border-blue-900/20 overflow-hidden"
                                style={{ background: 'linear-gradient(135deg, #0F1A2E 0%, #1A2E4A 100%)' }}>
                                <div className="scan-line" style={{ animationDuration: '3s' }} />

                                <div className="text-center mb-8">
                                    <div className='flex justify-center mb-5'>
                                        <Image
                                            src="/images/fbr.jpeg"
                                            alt="Logo"
                                            width={150}
                                            height={80}
                                            className='w-[160px] h-[90px] lg:w-[240px] lg:h-[160px] object-contain rounded-lg'
                                        />
                                    </div>
                                    <div className="text-white font-bold">Federal Board of Revenue</div>
                                    <div className="text-white text-sm mt-1">● Direct API Connected</div>
                                </div>

                                <div className="space-y-3">
                                    {[
                                        { icon: '✓', label: 'FBR Connected', color: '#22C55E' },
                                        { icon: '📤', label: 'Digital Invoice Submission', color: '#06B6D4' },
                                        { icon: '🛡️', label: 'Tax Validation Layer', color: '#2563EB' },
                                        { icon: '📊', label: 'Tax Rate Support', color: '#8B5CF6' },
                                        { icon: '⚖️', label: 'Regulatory Compliance', color: '#F59E0B' },
                                    ].map((badge, i) => (
                                        <div key={i} className="integration-badge">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                                                style={{ background: `${badge.color}20`, border: `1px solid ${badge.color}40` }}>
                                                {badge.icon}
                                            </div>
                                            <span className="text-white text-sm font-semibold">{badge.label}</span>
                                            <div className="ml-auto">
                                                <div className="w-2 h-2 rounded-full" style={{ background: badge.color }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </AnimSection>
                    </div>
                </div>
            </section>

            <section id="contact" className="py-28" style={{ background: '#F8FAFF' }}>
                <div className="max-w-7xl mx-auto px-6">
                    <AnimSection className="text-center mb-16">
                        <div className="flex justify-center mb-4">
                            <span className="section-label">📬 Get In Touch</span>
                        </div>
                        <h2 className="font-black text-[#0F1A2E] mb-4 leading-tight" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
                            Start Using Pakistan&apos;s{' '}
                            <span className="gradient-text">Next Generation</span>{' '}
                            Digital Invoicing Platform
                        </h2>
                        <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed">
                            Get your business connected with Pakistan&apos;s digital tax infrastructure through a secure, scalable, and enterprise-grade invoicing platform.
                        </p>
                    </AnimSection>

                    <div className="grid lg:grid-cols-5 gap-12 items-stretch">
                        <AnimSection className="lg:col-span-3">
                            <div className="bg-white rounded-2xl p-8 shadow-sm border border-blue-100 h-full flex flex-col">
                                {mounted && submitted ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                                            style={{ background: 'linear-gradient(135deg, #DCFCE7, #D1FAE5)' }}>
                                            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                                                <path d="M5 14L11 20L23 8" stroke="#15803D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <h3 className="font-bold text-[#0F1A2E] text-xl mb-2">Inquiry Submitted!</h3>
                                        <p className="text-slate-500">Our team will get back to you within 24 hours.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit}>
                                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name *</label>
                                                <input className="form-input" placeholder="Muhammad Ali" required
                                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Company Name</label>
                                                <input className="form-input" placeholder="Your Company"
                                                    value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address *</label>
                                                <input className="form-input" type="email" placeholder="you@company.com" required
                                                    value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number</label>
                                                <input className="form-input" placeholder="+92 300 0000000"
                                                    value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="mb-6">
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Message</label>
                                            <textarea className="form-input resize-none" rows={8} placeholder="Tell us about your invoicing needs..."
                                                value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} />
                                        </div>
                                        <button type="submit" className="btn-primary w-full justify-center text-base py-3">
                                            Submit Inquiry
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                <path d="M2 8h12M10 4l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                    </form>
                                )}
                            </div>
                        </AnimSection>

                        <AnimSection className="lg:col-span-2" delay={150}>
                            <div className="space-y-6">
                                <div className="bg-white rounded-2xl p-6 border border-blue-100 shadow-sm">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-xl"
                                        style={{ background: 'linear-gradient(135deg, #EFF6FF, #CFFAFE)' }}>📧</div>
                                    <div className="font-bold text-[#0F1A2E] mb-1">Email Us</div>
                                    <a href="mailto:vendidge@hybrasoft.com" className="text-[#4e4e4e] font-medium hover:text-blue-700 transition-colors">
                                        vendidge@hybrasoft.com
                                    </a>
                                </div>

                                <div className="rounded-2xl p-6 border border-blue-900/20"
                                    style={{ background: 'linear-gradient(135deg, #0F1A2E, #1A2E4A)' }}>
                                    <div className="font-bold text-white mb-3">Quick Access</div>
                                    <p className="text-blue-300/70 text-sm mb-5 leading-relaxed">
                                        Already have an account? Jump straight in to your invoicing dashboard.
                                    </p>
                                    <div className="flex flex-col gap-3">
                                        <button onClick={handleRegisterClick} className="btn-primary" style={{ fontSize: '0.875rem' }}>Register Now
                                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                                <path d="M3 9h12M10 5l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                        <button onClick={() => setLoginOpen(true)} className="flex items-center justify-center gap-2 text-blue-300 hover:text-white transition-colors text-sm font-medium py-2">
                                            Already registered? Login →
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl p-6 border border-blue-100 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                                        <span className="font-semibold text-[#0F1A2E] text-sm">Platform Status: Operational</span>
                                    </div>
                                    <p className="text-slate-400 text-xs mt-2 font-mono">All FBR systems connected and active</p>
                                </div>
                            </div>
                        </AnimSection>
                    </div>
                </div>
            </section>

            <section className="cta-banner py-24">
                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                    <AnimSection>
                        <div className="flex justify-center mb-5">
                            <span className="section-label" style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(6,182,212,0.3)', color: '#67E8F9' }}>
                                🚀 Get Started Today
                            </span>
                        </div>
                        <h2 className="font-black text-white mb-5 leading-tight" style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)' }}>
                            Ready To Digitize Your{' '}
                            <span className="gradient-text">Business Invoicing?</span>
                        </h2>
                        <p className="text-blue-300/80 mb-10 max-w-2xl mx-auto leading-relaxed text-lg">
                            Start issuing FBR connected invoices securely through Vendidge. Join Pakistan&apos;s digital tax revolution.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <button onClick={handleRegisterClick} className="btn-primary" style={{ fontSize: '0.875rem' }}>Register
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                    <path d="M3 9h12M10 5l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                            <button onClick={() => setLoginOpen(true)} className="btn-secondary text-base px-8 py-4">Login to Dashboard</button>
                        </div>
                    </AnimSection>
                </div>
            </section>

            <footer style={{ background: '#060E1C', borderTop: '1px solid rgba(37,99,235,0.15)' }}>
                <div className="max-w-7xl mx-auto px-6 py-16">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <a href="#">
                                    <Image
                                        src="/images/footerlogo.png"
                                        alt="Logo"
                                        width={200}
                                        height={100}
                                    />
                                </a>
                            </div>
                            <p className="text-white text-sm leading-relaxed mb-2">
                                Hybrasoft Vendidge
                            </p>
                            <p className="text-white text-sm leading-relaxed mb-5">
                                Pakistan&apos;s secure digital invoicing platform built for modern businesses.
                            </p>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                <span className="text-white">All systems operational</span>
                            </div>
                        </div>

                        <div>
                            <div className="font-bold text-white mb-5 text-sm uppercase tracking-widest">Navigation</div>
                            <div className="grid grid-cols-2 gap-2">
                                {[...navLinks, "Login", "Register"].map((link) => {
                                    if (link === "Register") {
                                        return (
                                            <button
                                                key={link}
                                                onClick={handleRegisterClick}
                                                className="text-white text-left hover:text-cyan-400 transition-colors text-sm py-1"
                                            >
                                                Register
                                            </button>
                                        );
                                    }

                                    if (link === "Login") {
                                        return (
                                            <button key={link} onClick={() => setLoginOpen(true)} className="text-white text-left hover:text-cyan-400 transition-colors text-sm py-1">
                                                Login
                                            </button>
                                        );
                                    }

                                    return (
                                        <a
                                            key={link}
                                            href={`#${link.toLowerCase()}`}
                                            onClick={(e) => handleNavClick(e, link.toLowerCase())}
                                            className="text-white hover:text-cyan-400 transition-colors text-sm py-1"
                                        >
                                            {link}
                                        </a>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <div className="font-bold text-white mb-5 text-sm uppercase tracking-widest">
                                Legal
                            </div>

                            <div className="flex flex-col gap-2">
                                <a
                                    href="/terms-and-conditions"
                                    className="text-white hover:text-cyan-400 transition-colors text-sm py-1"
                                >
                                    Terms &amp; Conditions
                                </a>

                                <a
                                    href="/privacy-policy"
                                    className="text-white hover:text-cyan-400 transition-colors text-sm py-1"
                                >
                                    Privacy Policy
                                </a>

                                <a
                                    href="/payment-policy"
                                    className="text-white hover:text-cyan-400 transition-colors text-sm py-1"
                                >
                                    Payment Policy
                                </a>

                                <a
                                    href="/subscription-policy"
                                    className="text-white hover:text-cyan-400 transition-colors text-sm py-1"
                                >
                                    Subscription Policy
                                </a>
                            </div>
                        </div>

                        <div>
                            <div className="font-bold text-white mb-5 text-sm uppercase tracking-widest">Contact</div>
                            <a
                                href="tel:+923249464726"
                                className="block text-white hover:text-cyan-400 transition-colors text-sm mb-3"
                            >
                                +92 324 9464726
                            </a>
                            <a href="mailto:vendidge@hybrasoft.com" className="text-white hover:text-cyan-400 transition-colors text-sm">
                                vendidge@hybrasoft.com
                            </a>
                            <div className='mt-3'>
                                <p className="text-white text-sm leading-6 mb-4">
                                    1st Floor, Building No. 380/4, G.T. Road, Chowk Daroghawala,
                                    Opp. Meezan Bank, Lahore, Punjab, Pakistan
                                </p>
                            </div>

                            <div className="mt-4">
                                <div className="font-mono text-xs px-3 py-2 rounded-lg text-white inline-block"
                                    style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' }}>
                                    SRO 709(I)/2025 Compliant
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-3">
                        <p className="text-white text-xs text-center md:text-left">
                            Copyright © 2026 | Hybrasoft Vendidge | All Rights Reserved
                        </p>
                        <a
                            href="https://www.hybrasofttech.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white text-xs hover:text-cyan-400 transition-colors">Product of Hybrasoft Technologied (Private) Limited</a>
                    </div>
                </div>
            </footer>
            <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
        </>
    );
}