'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Simulate password reset request
      // In production, this would call /api/auth/forgot-password
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess(true);
    } catch {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col font-sans bg-transparent">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-24 w-full">
          <div className="max-w-md w-full text-center">
            <div className="bg-white dark:bg-[#1f0a12] rounded-3xl p-10 shadow-2xl border border-[#f0b8a8] dark:border-[#3a1520]">
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600 dark:text-green-500">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-[#703e2d] dark:text-[#eed9d6] mb-4">Email Sent!</h2>
              <p className="text-[#8b5e4d] dark:text-[#c49a92] mb-8">
                We've sent a password reset link to <span className="font-semibold text-[#ef6751]">{email}</span>. Please check your inbox and follow the instructions to reset your password.
              </p>
              <Link
                href="/auth/signin"
                className="w-full py-4 rounded-full bg-[#ef6751] hover:bg-[#d3513e] text-white font-bold text-lg transition-all hover:shadow-lg hover:shadow-[#ef6751]/25"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-transparent">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-24 w-full">
        <div className="max-w-6xl w-full grid lg:grid-cols-[1fr_1.1fr] gap-16 xl:gap-24 items-center">
          {/* Form Side */}
          <div className="w-full max-w-md mx-auto lg:max-w-none space-y-8 animate-slide-in-left px-2 sm:px-0">
            <div className="space-y-4">
              <div className="inline-block px-4 py-1.5 rounded-full bg-[#f0b8a8]/30 dark:bg-[#3a1520] text-[#ef6751] text-xs font-bold uppercase tracking-widest mb-2">
                Forgot Password
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#703e2d] dark:text-[#eed9d6] tracking-tight leading-tight">
                Reset Your<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ef6751] to-[#d3513e]">Password</span>
              </h1>
              <p className="text-lg text-[#8b5e4d] dark:text-[#c49a92] leading-relaxed">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              {error && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-600 dark:text-red-300 font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-bold text-[#703e2d] dark:text-[#c49a92] ml-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="student@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field w-full"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-5 sm:py-6 px-10 rounded-full bg-[#ef6751] hover:bg-[#d3513e] disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold text-lg transition-all duration-300 hover:shadow-xl hover:shadow-[#ef6751]/25 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    <>
                      Send Reset Link
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="pt-4 text-center">
              <p className="text-base font-medium text-[#8b5e4d] dark:text-[#c49a92]">
                Remember your password?{' '}
                <Link href="/auth/signin" className="text-[#ef6751] font-bold hover:text-[#d3513e] transition-colors ml-1">
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          {/* Decorative Side */}
          <div className="hidden lg:block animate-slide-in-right h-full">
            <div className="relative overflow-hidden rounded-[2.5rem] h-full shadow-2xl flex flex-col justify-between">
              <div className="absolute inset-0 bg-gradient-to-br from-[#fdf0ee] to-[#f0b8a8] dark:from-[#140108] dark:to-[#1f0a12]" />
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#ef6751]/20 to-transparent rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#d3513e]/20 to-transparent rounded-full blur-3xl" />

              <div className="relative z-10 p-16 flex flex-col h-full justify-between">
                <div>
                  <h3 className="text-4xl font-bold text-[#703e2d] dark:text-[#eed9d6] mb-6 text-center">
                    Security First
                  </h3>
                  <p className="text-center text-[#8b5e4d] dark:text-[#c49a92] text-xl font-medium mb-16">
                    Your password security is our priority.
                  </p>

                  <div className="grid grid-cols-2 gap-6">
                    {[
                      { icon: 'lock', label: 'Secure Reset', color: '#ef6751', desc: 'Encrypted password recovery' },
                      { icon: 'email', label: 'Instant Email', color: '#d3513e', desc: 'Reset link sent immediately' },
                      { icon: 'check', label: 'Verified Account', color: '#703e2d', desc: 'Double-check your identity' },
                      { icon: 'shield', label: 'Data Protected', color: '#8b5e4d', desc: 'Your data is always safe' },
                    ].map((item, idx) => (
                      <div key={idx} className="bg-white/80 dark:bg-[#1f0a12]/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 dark:border-white/5 shadow-xl hover:-translate-y-1 transition-transform cursor-pointer">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-sm" style={{ backgroundColor: `${item.color}15` }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={item.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            {item.icon === 'lock' && <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>}
                            {item.icon === 'email' && <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></>}
                            {item.icon === 'check' && <polyline points="20 6 9 17 4 12" />}
                            {item.icon === 'shield' && <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />}
                          </svg>
                        </div>
                        <h4 className="font-bold text-[#703e2d] dark:text-[#eed9d6] text-[15px] mb-1">{item.label}</h4>
                        <p className="text-xs font-medium text-[#8b5e4d] dark:text-[#c49a92]">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-[#ef6751] to-[#d3513e] rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden mt-12">
                  <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IndoaXRlIi8+PC9zdmc+')] bg-repeat" />
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    </div>
                    <span className="text-white font-bold text-lg mb-1">Secure Recovery</span>
                    <p className="text-white/80 text-sm font-medium">We'll verify your identity first</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
