'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '@/hooks/authContext';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#' },
    { name: 'Resources', href: '#resources' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ];

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 dark:bg-[#140108]/95 backdrop-blur-md shadow-lg py-5'
          : 'bg-transparent py-8'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between relative min-h-[5rem]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group z-10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ef6751] to-[#d3513e] shadow-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" />
              <path d="M2 17L12 22L22 17" />
              <path d="M2 12L12 17L22 12" />
            </svg>
          </div>
          <span className="text-2xl font-bold tracking-tight text-[#ef6751]">
            CampusFlow
          </span>
        </Link>

        {/* Center Navigation (Desktop) */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-[#703e2d] dark:text-[#c49a92] hover:text-[#ef6751] transition-colors duration-200 font-medium text-base"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Right Actions (Desktop) */}
        <div className="hidden md:flex items-center gap-6 z-10">
          <ThemeToggle />
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="px-6 py-3.5 rounded-full bg-[#ef6751]/10 hover:bg-[#ef6751]/20 text-[#ef6751] font-semibold text-base transition-all duration-200"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/dashboard"
                className="px-6 py-3.5 rounded-full bg-[#ef6751] hover:bg-[#d3513e] text-white font-semibold text-base transition-all duration-200 hover:shadow-xl hover:shadow-[#ef6751]/20"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="px-6 py-3.5 rounded-full hover:bg-[#f0b8a8] dark:hover:bg-[#3a1520] text-[#703e2d] dark:text-[#c49a92] font-semibold text-base transition-all duration-200"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/auth/signin"
              className="px-8 py-3.5 rounded-full bg-[#ef6751] hover:bg-[#d3513e] text-white font-semibold text-base transition-all duration-200 hover:shadow-xl hover:shadow-[#ef6751]/20 hover:scale-105"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-3 rounded-xl text-[#ef6751] hover:bg-[#eed9d6] dark:hover:bg-[#1f0a12] transition-colors z-10"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {isMobileMenuOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-[#140108] border-b border-[#f0b8a8] dark:border-[#3a1520] shadow-2xl animate-fade-in">
          <div className="flex flex-col p-8 gap-6 text-center">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-[#703e2d] dark:text-[#c49a92] hover:text-[#ef6751] transition-colors py-3 font-medium text-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}

            <div className="flex items-center justify-center gap-4 py-4 border-t border-[#f0b8a8] dark:border-[#3a1520]">
              <span className="text-[#703e2d] dark:text-[#c49a92] font-medium">Theme</span>
              <ThemeToggle />
            </div>

            {isAuthenticated ? (
              <div className="flex flex-col gap-3">
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="w-full text-center py-4 rounded-full bg-[#ef6751]/10 hover:bg-[#ef6751]/20 text-[#ef6751] font-bold text-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="w-full text-center py-4 rounded-full bg-[#ef6751] hover:bg-[#d3513e] text-white font-bold text-lg transition-colors shadow-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-center py-4 rounded-full hover:bg-[#f0b8a8] dark:hover:bg-[#3a1520] text-[#703e2d] dark:text-[#c49a92] font-bold text-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="w-full text-center py-4 rounded-full bg-[#ef6751] hover:bg-[#d3513e] text-white font-bold text-lg transition-colors shadow-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
