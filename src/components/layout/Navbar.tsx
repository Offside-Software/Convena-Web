import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Calendar, CheckCircle, LayoutDashboard, Menu, X, LogIn, LogOut } from 'lucide-react'
import { Button } from '../common/Button.tsx'
import { Badge } from '../common/Badge.tsx'
import { MemphisShape } from '../shapes/MemphisShape.tsx'
import { authService } from '../../services/auth.service.ts'
import { mockCurrentUser } from '../../data/mockData.ts'
import type { User } from '../../types/user.ts'
import { BrandLogo } from '../common/BrandLogo.tsx'

export const Navbar: React.FC = () => {
    const location = useLocation()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(true)
    const [user, setUser] = useState<User>(mockCurrentUser)

    useEffect(() => {
        let isMounted = true
        authService.getCurrentUser().then((u) => {
            if (!isMounted) return
            if (u) {
                setUser(u)
                setIsLoggedIn(true)
            }
        })
        return () => {
            isMounted = false
        }
    }, [])

    const navLinks = [
        { label: 'Explore Events', path: '/events', icon: <Calendar size={18} /> },
        { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
        { label: 'Verify Certificate', path: '/verify', icon: <CheckCircle size={18} /> },
    ]

    const isActive = (path: string) => {
        if (path === '/events' && location.pathname === '/events') return true
        if (path === '/dashboard' && location.pathname === '/dashboard') return true
        if (path !== '/' && location.pathname.startsWith(path)) return true
        return false
    }

    return (
        <header className="sticky top-0 z-50 bg-white border-b-4 border-[#121215] shadow-[0_4px_0px_rgba(18,18,21,0.1)]">
            {/* Top micro announcement banner */}
            <div className="bg-[#FFE600] border-b-2 border-[#121215] py-1 px-4 text-xs font-bold font-['Space_Grotesk',sans-serif] flex items-center justify-center gap-2 overflow-hidden text-[#121215]">
                <span className="bg-[#FF4B91] text-white py-0.5 px-1.5 rounded text-[11px] font-black">
                    DEMO MODE
                </span>
                <span>Platform Manajemen Event & Organisasi Mahasiswa Indonesia Terintegrasi</span>
                <MemphisShape type="cross" size={12} color="#121215" />
            </div>

            <div className="max-w-[1280px] mx-auto py-3 px-4 sm:px-6 flex items-center justify-between">

                {/* Brand Logo */}
                <Link to="/" className="flex items-center gap-2.5 no-underline">
                    <BrandLogo />
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-2">
                    {navLinks.map((link) => {
                        const active = isActive(link.path)
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`inline-flex items-center gap-1.5 font-['Space_Grotesk',sans-serif] font-bold text-sm py-1.5 px-3 rounded-md no-underline transition-all ${active
                                    ? 'border-2 border-[#121215] bg-[#FFE600] shadow-[2px_2px_0px_0px_#121215] text-[#121215]'
                                    : 'border-2 border-transparent text-[#121215] hover:bg-gray-100'
                                    }`}
                            >
                                {link.icon}
                                <span>{link.label}</span>
                            </Link>
                        )
                    })}
                </nav>

                {/* Action CTAs */}
                <div className="flex items-center gap-3">
                    {isLoggedIn ? (
                        <div className="flex items-center gap-2">
                            <Link to="/dashboard" className="no-underline">
                                <div className="flex items-center gap-2 px-2.5 py-1.5 border-2 border-[#121215] rounded-lg bg-white shadow-[2px_2px_0px_0px_#121215] hover:bg-gray-50 transition-all cursor-pointer">
                                    {user?.avatarUrl ? (
                                        <img
                                            src={user.avatarUrl}
                                            alt={user.name}
                                            className="w-7 h-7 rounded-md border border-[#121215] object-cover"
                                        />
                                    ) : (
                                        <div className="w-7 h-7 rounded-md border border-[#121215] bg-[#FFE600] flex items-center justify-center font-['Space_Grotesk',sans-serif] font-black text-xs text-[#121215]">
                                            {(user?.name || user?.username || 'U').charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="hidden md:inline font-['Space_Grotesk',sans-serif] font-bold text-xs text-[#121215] max-w-[120px] truncate">
                                        {user?.name || user?.username || 'Arya Pratama'}
                                    </span>
                                    <Badge variant="cyan">
                                        {user?.role ? user.role.toUpperCase() : 'ADMIN'}
                                    </Badge>
                                </div>
                            </Link>
                            <button
                                type="button"
                                onClick={() => {
                                    authService.logout()
                                    setUser({ ...mockCurrentUser })
                                    setIsLoggedIn(true)
                                }}
                                title="Reset Akun Demo"
                                className="hidden md:flex p-1.5 bg-[#FAF9F6] hover:bg-gray-100 border-2 border-[#121215] rounded-md shadow-[2px_2px_0px_0px_#121215] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all cursor-pointer text-[#121215]"
                            >
                                <LogOut size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link to="/login" className="no-underline">
                                <Button variant="cyan" size="sm" icon={<LogIn size={15} />}>
                                    Masuk
                                </Button>
                            </Link>
                            <Link to="/register" className="hidden sm:inline-flex no-underline">
                                <Button variant="yellow" size="sm">
                                    Daftar
                                </Button>
                            </Link>
                        </div>
                    )}

                    {/* Mobile hamburger button */}
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle navigation menu"
                        className="p-1.5 bg-[#FFE600] border-2 border-[#121215] rounded-md shadow-[2px_2px_0px_0px_#121215] cursor-pointer md:hidden text-[#121215]"
                    >
                        {mobileMenuOpen ? <X size={22} strokeWidth={2.5} /> : <Menu size={22} strokeWidth={2.5} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Drawer */}
            {mobileMenuOpen && (
                <div className="bg-white border-t-2 border-[#121215] p-4 sm:p-6 flex flex-col gap-2.5">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-2.5 font-['Space_Grotesk',sans-serif] font-bold text-base py-2.5 px-4 rounded-lg border-2 border-[#121215] shadow-[3px_3px_0px_0px_#121215] no-underline text-[#121215] ${isActive(link.path) ? 'bg-[#FFE600]' : 'bg-[#FAF9F6]'
                                }`}
                        >
                            {link.icon}
                            <span>{link.label}</span>
                        </Link>
                    ))}

                    <div className="mt-2 pt-2 border-t-2 border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-[#121215]">
                                {user?.name || 'Arya Pratama'}
                            </span>
                            <Badge variant="cyan">ADMIN</Badge>
                        </div>
                        <Link
                            to="/dashboard"
                            onClick={() => setMobileMenuOpen(false)}
                            className="no-underline"
                        >
                            <Button variant="yellow" size="sm">
                                Buka Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
        </header>
    )
}
