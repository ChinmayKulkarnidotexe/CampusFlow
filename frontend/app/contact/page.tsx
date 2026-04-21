'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({ name: '', email: '', subject: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({ name: '', email: '', subject: '', message: '' });

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setSuccess(true);
    setFormData({ name: '', email: '', subject: '', message: '' });

    setTimeout(() => setSuccess(false), 5000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen font-sans bg-[#f8f0e8] dark:bg-[#1e2a25]">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-[#ef6751] dark:bg-[#26352f] text-white py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Have questions or need help? We're here to assist you with CampusFlow.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {success && (
          <div className="mb-8 p-6 rounded-2xl bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-center">
            <h3 className="text-xl font-bold text-green-700 dark:text-green-400 mb-2">Message Sent!</h3>
            <p className="text-green-600 dark:text-green-500">
              Thank you for contacting us. We'll respond to your email shortly.
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div className="bg-white dark:bg-[#26352f] rounded-3xl p-8 shadow-2xl border border-[#f0b8a8]/30 dark:border-[#344840]/30">
            <h2 className="text-3xl font-bold text-[#703e2d] dark:text-[#e8f2ea] mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-[#703e2d] dark:text-[#c49a92] mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl bg-[#f8f0e8] dark:bg-[#1e2a25] border ${errors.name ? 'border-red-500' : 'border-[#f0b8a8] dark:border-[#344840]'} text-[#703e2d] dark:text-[#e8f2ea] focus:ring-2 focus:ring-[#ef6751] outline-none transition-all`}
                  placeholder="John Doe"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-bold text-[#703e2d] dark:text-[#c49a92] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl bg-[#f8f0e8] dark:bg-[#1e2a25] border ${errors.email ? 'border-red-500' : 'border-[#f0b8a8] dark:border-[#344840]'} text-[#703e2d] dark:text-[#e8f2ea] focus:ring-2 focus:ring-[#ef6751] outline-none transition-all`}
                  placeholder="student@college.edu"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-bold text-[#703e2d] dark:text-[#c49a92] mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  id="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl bg-[#f8f0e8] dark:bg-[#1e2a25] border ${errors.subject ? 'border-red-500' : 'border-[#f0b8a8] dark:border-[#344840]'} text-[#703e2d] dark:text-[#e8f2ea] focus:ring-2 focus:ring-[#ef6751] outline-none transition-all`}
                  placeholder="How can we help you?"
                />
                {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-bold text-[#703e2d] dark:text-[#c49a92] mb-2">
                  Your Message
                </label>
                <textarea
                  name="message"
                  id="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl bg-[#f8f0e8] dark:bg-[#1e2a25] border ${errors.message ? 'border-red-500' : 'border-[#f0b8a8] dark:border-[#344840]'} text-[#703e2d] dark:text-[#e8f2ea] focus:ring-2 focus:ring-[#ef6751] outline-none transition-all resize-none`}
                  placeholder="Type your message here..."
                />
                {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-full bg-[#ef6751] hover:bg-[#d3513e] disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold text-lg transition-all hover:shadow-xl hover:shadow-[#ef6751]/25"
              >
                {isLoading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col justify-between">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-[#703e2d] dark:text-[#e8f2ea] mb-6">
                  Get in Touch
                </h2>
                <p className="text-[#8b5e4d] dark:text-[#c49a92] text-lg mb-8 leading-relaxed">
                  Whether you're a student, faculty member, or administrator, we're here to help you make the most of CampusFlow. Reach out to us for any questions, feedback, or support.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#f0b8a8]/20 dark:bg-[#344840]/20 flex items-center justify-center flex-shrink-0 text-[#ef6751]">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#703e2d] dark:text-[#e8f2ea] mb-1">Email Us</h3>
                    <p className="text-[#8b5e4d] dark:text-[#c49a92] mb-1">general@campusflow.edu</p>
                    <p className="text-[#8b5e4d] dark:text-[#c49a92]">support@campusflow.edu</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#f0b8a8]/20 dark:bg-[#344840]/20 flex items-center justify-center flex-shrink-0 text-[#ef6751]">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#703e2d] dark:text-[#e8f2ea] mb-1">Chat With Us</h3>
                    <p className="text-[#8b5e4d] dark:text-[#c49a92]">Monday-Friday: 9AM-6PM</p>
                    <p className="text-[#8b5e4d] dark:text-[#c49a92]">Saturday-Sunday: 10AM-4PM</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#f0b8a8]/20 dark:bg-[#344840]/20 flex items-center justify-center flex-shrink-0 text-[#ef6751]">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#703e2d] dark:text-[#e8f2ea] mb-1">Visit Us</h3>
                    <p className="text-[#8b5e4d] dark:text-[#c49a92]">Education City, Block A</p>
                    <p className="text-[#8b5e4d] dark:text-[#c49a92]">Building 4, 3rd Floor</p>
                    <p className="text-[#8b5e4d] dark:text-[#c49a92]">Suite 400</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-[#f0b8a8]/30 to-[#d3513e]/10 dark:from-[#344840]/30 dark:to-[#140108]/30 border border-[#f0b8a8]/20 dark:border-[#344840]/20">
              <h3 className="text-xl font-bold text-[#703e2d] dark:text-[#e8f2ea] mb-3">Frequently Asked Questions</h3>
              <p className="text-[#8b5e4d] dark:text-[#c49a92] text-sm mb-4">
                Check out our help center for answers to common questions about booking, accounts, and more.
              </p>
              <Link href="/about" className="text-[#ef6751] font-semibold hover:text-[#d3513e] transition-colors">
                Visit Help Center &rarr;
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Map Placeholder */}
      <div className="w-full h-96 bg-[#f0b8a8]/20 dark:bg-[#344840]/20 flex items-center justify-center">
        <div className="text-center">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#703e2d" strokeWidth="1" className="mx-auto mb-4 opacity-50">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <p className="text-[#703e2d] dark:text-[#c49a92] font-medium">Campus Map Integration</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#140108] border-t border-[#f0b8a8]/50 dark:border-[#3a1520] py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#ef6751] flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                  <path d="M2 17L12 22L22 17" />
                  <path d="M2 12L12 17L22 12" />
                </svg>
              </div>
              <span className="text-xl font-bold text-[#703e2d] dark:text-[#eed9d6]">CampusFlow</span>
            </div>
            <p className="text-[#8b5e4d] dark:text-[#c49a92]">
              &copy; {new Date().getFullYear()} CampusFlow Inc. All rights reserved.
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
