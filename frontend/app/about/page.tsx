'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function AboutPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      title: 'Easy Resource Booking',
      description: 'Book labs, equipment, and classrooms in seconds with our intuitive interface.',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
          <path d="M16 16h.01" />
          <path d="M12 16h.01" />
          <path d="M8 16h.01" />
        </svg>
      ),
    },
    {
      title: 'Real-Time Availability',
      description: 'Check live availability of all resources with up-to-the-minute updates.',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      title: 'Equipment Tracking',
      description: 'Track equipment checkouts and returns with our comprehensive inventory system.',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      ),
    },
    {
      title: 'Automated Notifications',
      description: 'Receive email alerts for booking confirmations, reminders, and updates.',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
    },
    {
      title: 'Admin Dashboard',
      description: 'Powerful admin tools for managing bookings, resources, and users.',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
    },
    {
      title: 'Mobile Friendly',
      description: 'Access CampusFlow from any device, anywhere, anytime.',
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      ),
    },
  ];

  const team = [
    { name: 'Chinmay P Kulkarni', role: 'Project Lead & Backend Developer', image: 'CPK' },
  ];

  if (!mounted) return null;

  return (
    <div className="min-h-screen font-sans bg-[#f8f0e8] dark:bg-[#1e2a25]">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-[#ef6751] dark:bg-[#26352f] text-white py-24 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            About CampusFlow
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Streamlining college resource management for students, faculty, and administrators.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Introduction */}
        <section className="mb-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-[#703e2d] dark:text-[#e8f2ea] mb-6">
                Simplifying Campus Resource Management
              </h2>
              <p className="text-[#8b5e4d] dark:text-[#c49a92] text-lg leading-relaxed mb-6">
                CampusFlow is a comprehensive solution designed to address the challenges of managing college resources efficiently. Whether you need to book a laboratory for your research, reserve equipment for your project, or find a classroom for your study group, CampusFlow makes it simple.
              </p>
              <p className="text-[#8b5e4d] dark:text-[#c49a92] text-lg leading-relaxed mb-8">
                Our platform connects students and faculty with available resources in real-time, eliminating the hassle of physical sign-up sheets and paper-based reservation systems.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/auth/signup"
                  className="px-8 py-4 rounded-full bg-[#ef6751] hover:bg-[#d3513e] text-white font-bold text-lg transition-all"
                >
                  Get Started
                </Link>
                <Link
                  href="/contact"
                  className="px-8 py-4 rounded-full border-2 border-[#f0b8a8] dark:border-[#344840] text-[#703e2d] dark:text-[#e8f2ea] font-bold text-lg hover:bg-[#f0b8a8]/20 dark:hover:bg-[#344840]/20 transition-all"
                >
                  Contact Us
                </Link>
              </div>
            </div>
            <div className="bg-white dark:bg-[#26352f] rounded-3xl p-8 shadow-2xl border border-[#f0b8a8]/30 dark:border-[#344840]/30">
              <div className="grid grid-cols-2 gap-6">
                {[
                  { count: '500+', label: 'Active Students' },
                  { count: '2K+', label: 'Resources Booked' },
                  { count: '25+', label: 'Labs Available' },
                  { count: '98%', label: 'Satisfaction' },
                ].map((stat, i) => (
                  <div key={i} className="text-center p-6 rounded-2xl bg-[#f0b8a8]/10 dark:bg-[#344840]/10">
                    <div className="text-3xl font-bold text-[#ef6751] mb-2">{stat.count}</div>
                    <div className="text-sm font-medium text-[#8b5e4d] dark:text-[#a8cbb8]">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#703e2d] dark:text-[#e8f2ea] mb-4">
              Why Choose CampusFlow?
            </h2>
            <p className="text-[#8b5e4d] dark:text-[#c49a92] text-lg max-w-2xl mx-auto">
              Our platform provides everything you need to manage campus resources efficiently.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="bg-white dark:bg-[#26352f] p-8 rounded-2xl shadow-lg border border-[#f0b8a8]/30 dark:border-[#344840]/30 hover:shadow-xl transition-shadow"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#f0b8a8]/20 dark:bg-[#344840]/20 flex items-center justify-center text-[#ef6751] mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-[#703e2d] dark:text-[#e8f2ea] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[#8b5e4d] dark:text-[#c49a92] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#703e2d] dark:text-[#e8f2ea] mb-4">
              Our Team
            </h2>
            <p className="text-[#8b5e4d] dark:text-[#c49a92] text-lg max-w-2xl mx-auto">
              The dedicated team behind CampusFlow.
            </p>
          </div>

          <div className="grid md:grid-cols-1 gap-8">
            {team.map((member, i) => (
              <div key={i} className="text-center">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-[#ef6751] flex items-center justify-center text-white text-2xl font-bold text-4xl shadow-xl">
                  {member.image}
                </div>
                <h3 className="text-xl font-bold text-[#703e2d] dark:text-[#e8f2ea] mb-2">
                  {member.name}
                </h3>
                <p className="text-[#8b5e4d] dark:text-[#c49a92]">{member.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-[#ef6751] to-[#d3513e] rounded-3xl p-12 text-center text-white shadow-2xl shadow-[#ef6751]/30">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Streamline Your Campus Experience?
          </h2>
          <p className="text-white/90 text-lg mb-10 max-w-2xl mx-auto">
            Join thousands of students and faculty who trust CampusFlow for their resource management needs.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/auth/signup"
              className="px-8 py-4 rounded-full bg-white text-[#ef6751] font-bold text-lg hover:bg-[#fdf0ee] transition-all"
            >
              Create Free Account
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 rounded-full border-2 border-white/50 text-white font-bold text-lg hover:bg-white/10 transition-all"
            >
              Contact Sales
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#140108] border-t border-[#f0b8a8]/50 dark:border-[#3a1520] py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ef6751] flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                    <path d="M2 17L12 22L22 17" />
                    <path d="M2 12L12 17L22 12" />
                  </svg>
                </div>
                <span className="text-2xl font-bold text-[#703e2d] dark:text-[#eed9d6] tracking-tight">CampusFlow</span>
              </div>
              <p className="text-[#8b5e4d] dark:text-[#c49a92]">
                Making college resource management simple, efficient, and beautifully accessible.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-[#703e2d] dark:text-[#eed9d6] mb-6 uppercase tracking-widest text-sm">Product</h4>
              <ul className="space-y-4 text-[#8b5e4d] dark:text-[#c49a92]">
                <li><Link href="#" className="hover:text-[#ef6751] transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-[#ef6751] transition-colors">Pricing</Link></li>
                <li><Link href="/resources" className="hover:text-[#ef6751] transition-colors">Resources</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-[#703e2d] dark:text-[#eed9d6] mb-6 uppercase tracking-widest text-sm">Company</h4>
              <ul className="space-y-4 text-[#8b5e4d] dark:text-[#c49a92]">
                <li><Link href="/about" className="hover:text-[#ef6751] transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-[#ef6751] transition-colors">Contact</Link></li>
                <li><Link href="#" className="hover:text-[#ef6751] transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-[#703e2d] dark:text-[#eed9d6] mb-6 uppercase tracking-widest text-sm">Connect</h4>
              <ul className="space-y-4 text-[#8b5e4d] dark:text-[#c49a92]">
                <li>hello@campusflow.edu</li>
                <li>+1 (555) 123-4567</li>
                <li>Education City, USA</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#f0b8a8]/50 dark:border-[#3a1520] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[#8b5e4d] dark:text-[#c49a92]">
              © {new Date().getFullYear()} CampusFlow Inc. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="#" className="text-[#8b5e4d] dark:text-[#c49a92] hover:text-[#ef6751] transition-colors">
                Twitter
              </Link>
              <Link href="#" className="text-[#8b5e4d] dark:text-[#c49a92] hover:text-[#ef6751] transition-colors">
                GitHub
              </Link>
              <Link href="#" className="text-[#8b5e4d] dark:text-[#c49a92] hover:text-[#ef6751] transition-colors">
                LinkedIn
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
