'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [visible, setVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mounted) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setVisible(true);
        });
      },
      { threshold: 0.1 }
    );
    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, [mounted]);

  const resources = [
    {
      id: 1,
      title: 'Laboratories',
      description: 'Book state-of-the-art labs for your experiments and projects',
      icon: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.33 3 3 0 0 1 2.42-3.47m10 0a3 3 0 0 1 2.42 3.47 3 3 0 0 1-.34 5.33 2.5 2.5 0 0 1-2.96 3.08A2.5 2.5 0 0 1 14.5 21V4.5a2.5 2.5 0 0 1 2.5-2.5Z" />
        </svg>
      ),
    },
    {
      id: 2,
      title: 'Equipment',
      description: 'Reserve specialized equipment for your academic work',
      icon: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 7v13a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7l-6-3-3 3-3-3-3 3-6-3Z" />
          <path d="M6 11h12" />
          <path d="M6 15h12" />
        </svg>
      ),
    },
    {
      id: 3,
      title: 'Classrooms',
      description: 'Secure study spaces and classroom reservations',
      icon: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 12h20" />
          <path d="M2 7l10-5 10 5" />
          <path d="M2 17l10 5 10-5" />
          <path d="M5 12v5" />
          <path d="M19 12v5" />
        </svg>
      ),
    },
    {
      id: 4,
      title: 'Workshops',
      description: 'Book workshop spaces for collaborative learning',
      icon: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      ),
    },
  ];

  const stats = [
    { label: 'Active Students', value: '500+' },
    { label: 'Resources Booked', value: '2K+' },
    { label: 'Happy Users', value: '98%' },
    { label: 'Labs Available', value: '25+' },
  ];

  if (!mounted) return null;

  return (
    <div className="min-h-screen font-sans flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section ref={heroRef} className="relative flex-1 flex flex-col justify-center pt-48 pb-32 px-6 overflow-hidden">
        {/* Floating background blobs */}
        <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none flex items-center justify-center">
          <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#eed9d6] dark:bg-[#1f0a12] rounded-full blur-3xl opacity-60 animate-float" />
          <div className="absolute top-1/3 -right-20 w-72 h-72 bg-[#f0b8a8] dark:bg-[#3a1520] rounded-full blur-3xl opacity-50 animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-[#ef6751]/20 dark:bg-[#ef6751]/10 rounded-full blur-3xl opacity-60 animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center text-center">
          <div className={`space-y-10 transition-all duration-700 flex flex-col items-center ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center justify-center gap-3 px-6 py-2.5 rounded-full bg-white/70 dark:bg-[#1f0a12]/70 border border-[#f0b8a8] dark:border-[#3a1520] shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ef6751] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ef6751]" />
              </span>
              <span className="text-sm font-semibold text-[#ef6751]">New: Online Resource Booking Available</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#703e2d] dark:text-[#eed9d6] leading-tight max-w-4xl mx-auto">
              Streamline Your<br className="hidden md:block" />{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ef6751] to-[#d3513e]">
                College Journey
              </span>
            </h1>

            <p className="text-lg md:text-xl text-[#8b5e4d] dark:text-[#c49a92] max-w-2xl mx-auto leading-relaxed">
              Book labs, equipment, and classrooms with ease. CampusFlow connects you with all the resources you need for academic success in one centralized platform.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-4 w-full">
              <Link
                href="/auth/signup"
                className="w-full sm:w-auto px-10 py-5 rounded-full bg-[#ef6751] hover:bg-[#d3513e] text-white font-bold text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-[#ef6751]/30 hover:scale-105 text-center"
              >
                Get Started Free
              </Link>
              <Link
                href="/auth/signin"
                className="w-full sm:w-auto px-10 py-5 rounded-full bg-white dark:bg-[#1f0a12] border-2 border-[#f0b8a8] dark:border-[#3a1520] text-[#ef6751] hover:bg-[#fdf0ee] dark:hover:bg-[#3a1520] font-bold text-lg transition-all duration-300 hover:shadow-lg text-center"
              >
                Sign In
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-[#140108] bg-[#f0b8a8] flex items-center justify-center text-[#703e2d] font-bold text-sm shadow-sm z-10 hover:z-20 hover:-translate-y-1 transition-transform">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-1 mb-0.5 text-[#ef6751]">
                  {[1, 2, 3, 4, 5].map(i => (
                    <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm font-medium text-[#8b5e4d] dark:text-[#c49a92]">
                  Trusted by <span className="font-bold text-[#ef6751]">500+</span> college students
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6 border-y border-[#f0b8a8]/30 dark:border-[#3a1520]/50 bg-white/30 dark:bg-[#140108]/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
            {stats.map((stat, idx) => (
              <div key={idx} className="animate-fade-in-up flex flex-col items-center justify-center space-y-2" style={{ animationDelay: `${0.2 + idx * 0.1}s` }}>
                <div className="text-5xl md:text-6xl font-bold text-[#ef6751]">{stat.value}</div>
                <div className="text-base text-[#8b5e4d] dark:text-[#c49a92] font-semibold uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="resources" className="py-32 px-6 flex flex-col items-center justify-center bg-white/50 dark:bg-[#1f0a12]/30">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center mb-20 max-w-3xl mx-auto flex flex-col items-center">
            <div className="text-[#ef6751] font-bold tracking-wider uppercase text-sm mb-4">Core Features</div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#703e2d] dark:text-[#eed9d6] mb-6">
              Everything You Need for Success
            </h2>
            <p className="text-[#8b5e4d] dark:text-[#c49a92] text-xl leading-relaxed">
              Access a wide range of college resources with just a few clicks. CampusFlow is designed to make your academic life completely stress-free.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {resources.map((resource) => (
              <div key={resource.id} className="card group hover:shadow-2xl flex flex-col items-center text-center p-10">
                <div className="w-20 h-20 rounded-3xl mb-8 flex items-center justify-center bg-[#fdf0ee] dark:bg-[#3a1520] text-[#ef6751] transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 shadow-md">
                  {resource.icon}
                </div>
                <h3 className="text-2xl font-bold text-[#703e2d] dark:text-[#eed9d6] mb-4 group-hover:text-[#ef6751] transition-colors">
                  {resource.title}
                </h3>
                <p className="text-[#8b5e4d] dark:text-[#c49a92] text-base leading-relaxed mb-8 flex-1">
                  {resource.description}
                </p>
                <Link href="/resources" className="px-6 py-3 rounded-full bg-[#eed9d6]/50 dark:bg-[#140108] text-[#ef6751] font-bold text-sm inline-flex items-center gap-2 hover:bg-[#ef6751] hover:text-white transition-all">
                  Book Now
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 flex flex-col items-center">
        <div className="max-w-5xl mx-auto w-full">
          <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-[#ef6751] to-[#d3513e] p-16 md:p-24 text-center shadow-2xl shadow-[#ef6751]/20">
            <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IndoaXRlIi8+PC9zdmc+')] bg-repeat" />
            <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-black opacity-10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
            <div className="relative z-10 flex flex-col items-center">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
                Ready to Streamline Your<br />Academic Journey?
              </h2>
              <p className="text-white/90 text-xl md:text-2xl mb-12 max-w-3xl mx-auto font-medium">
                Join thousands of students who use CampusFlow to manage their college resources instantly and efficiently.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full">
                <Link href="/auth/signup" className="w-full sm:w-auto px-12 py-5 rounded-full bg-white text-[#ef6751] font-bold text-xl hover:bg-[#fdf0ee] transition-all hover:shadow-2xl hover:scale-105">
                  Create Free Account
                </Link>
                <Link href="/resources" className="w-full sm:w-auto px-12 py-5 rounded-full border-2 border-white/80 text-white font-bold text-xl hover:bg-white/10 hover:border-white transition-all">
                  Explore Resources
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Centered */}
      <footer className="bg-white dark:bg-[#140108] border-t border-[#f0b8a8]/50 dark:border-[#3a1520] pt-24 pb-12 flex flex-col items-center text-center">
        <div className="max-w-7xl mx-auto px-6 w-full flex flex-col items-center">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-16 mb-20 w-full">
            <div className="space-y-6 flex flex-col items-center">
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ef6751] flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                    <path d="M2 17L12 22L22 17" />
                    <path d="M2 12L12 17L22 12" />
                  </svg>
                </div>
                <span className="text-2xl font-bold text-[#703e2d] dark:text-[#eed9d6] tracking-tight">CampusFlow</span>
              </div>
              <p className="text-base text-[#8b5e4d] dark:text-[#c49a92] leading-relaxed max-w-xs">
                Making college resource management simple, efficient, and beautifully accessible for everyone.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <h4 className="font-bold text-[#703e2d] dark:text-[#eed9d6] mb-6 text-base uppercase tracking-widest">Quick Links</h4>
              <ul className="space-y-4">
                {['Home', 'Resources', 'About', 'Contact'].map((link) => (
                  <li key={link}>
                    <Link href={`#${link.toLowerCase()}`} className="text-base font-medium text-[#8b5e4d] dark:text-[#c49a92] hover:text-[#ef6751] transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col items-center">
              <h4 className="font-bold text-[#703e2d] dark:text-[#eed9d6] mb-6 text-base uppercase tracking-widest">Resources</h4>
              <ul className="space-y-4">
                {['Book Lab', 'Reserve Equipment', 'Classifications', 'Workshops'].map((link) => (
                  <li key={link}>
                    <Link href="#" className="text-base font-medium text-[#8b5e4d] dark:text-[#c49a92] hover:text-[#ef6751] transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col items-center">
              <h4 className="font-bold text-[#703e2d] dark:text-[#eed9d6] mb-6 text-base uppercase tracking-widest">Contact</h4>
              <ul className="space-y-4 text-base font-medium text-[#8b5e4d] dark:text-[#c49a92]">
                <li className="hover:text-[#ef6751] transition-colors cursor-pointer">hello@campusflow.edu</li>
                <li className="hover:text-[#ef6751] transition-colors cursor-pointer">+1 (555) 123-4567</li>
                <li className="hover:text-[#ef6751] transition-colors cursor-pointer">Education City, USA</li>
              </ul>
            </div>
          </div>

          <div className="w-full border-t border-[#f0b8a8]/50 dark:border-[#3a1520] pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-base font-medium text-[#8b5e4d] dark:text-[#c49a92]">
              © {new Date().getFullYear()} CampusFlow Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-8 border border-[#f0b8a8]/50 dark:border-[#3a1520] rounded-full px-6 py-3 bg-[#fdf0ee]/50 dark:bg-[#1f0a12]/50">
              {['Twitter', 'GitHub', 'LinkedIn'].map((social) => (
                <a key={social} href="#" className="text-sm font-bold text-[#8b5e4d] dark:text-[#c49a92] hover:text-[#ef6751] transition-colors uppercase tracking-wider">
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
