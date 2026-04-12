'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({ name: '', email: '', password: '', confirmPassword: '', general: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors = { name: '', email: '', password: '', confirmPassword: '', general: '' };
    let isValid = true;

    if (!formData.name.trim()) { newErrors.name = 'Full name is required'; isValid = false; }
    else if (formData.name.length < 2) { newErrors.name = 'Name must be at least 2 characters'; isValid = false; }

    if (!formData.email.trim()) { newErrors.email = 'Email is required'; isValid = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { newErrors.email = 'Please enter a valid email address'; isValid = false; }

    if (!formData.password) { newErrors.password = 'Password is required'; isValid = false; }
    else if (formData.password.length < 8) { newErrors.password = 'At least 8 characters required'; isValid = false; }
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) { newErrors.password = 'Needs uppercase, lowercase, and number'; isValid = false; }

    if (!formData.confirmPassword) { newErrors.confirmPassword = 'Please confirm your password'; isValid = false; }
    else if (formData.password !== formData.confirmPassword) { newErrors.confirmPassword = 'Passwords do not match'; isValid = false; }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({ name: '', email: '', password: '', confirmPassword: '', general: '' });

    if (!validateForm()) { setIsLoading(false); return; }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.push('/dashboard');
    } catch {
      setErrors((prev) => ({ ...prev, general: 'Failed to create account. Please try again.' }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: '', general: '' }));
    }
  };

  const passwordRequirements = [
    { label: '8+ chars', met: formData.password.length >= 8 },
    { label: 'Uppercase', met: /[A-Z]/.test(formData.password) },
    { label: 'Lowercase', met: /[a-z]/.test(formData.password) },
    { label: 'Number', met: /\d/.test(formData.password) },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-transparent">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 md:px-12 py-24 md:py-32 w-full">
        <div className="max-w-6xl w-full grid lg:grid-cols-[1fr_1.1fr] gap-16 xl:gap-24 items-start">
          {/* Form Side */}
          <div className="w-full max-w-md mx-auto lg:max-w-none space-y-8 animate-slide-in-left px-2 sm:px-0">
            <div className="space-y-4">
              <div className="inline-block px-4 py-1.5 rounded-full bg-[#f0b8a8]/30 dark:bg-[#3a1520] text-[#ef6751] text-xs font-bold uppercase tracking-widest mb-2">Register</div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#703e2d] dark:text-[#eed9d6] tracking-tight leading-tight">
                Join CampusFlow{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ef6751] to-[#d3513e]">Today</span>
              </h1>
              <p className="text-lg text-[#8b5e4d] dark:text-[#c49a92] leading-relaxed">
                Create your student portal account to book labs and academic equipment instantly.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-7">
              {errors.general && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-600 dark:text-red-300 font-medium text-sm">
                  {errors.general}
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="name" className="text-sm font-bold text-[#703e2d] dark:text-[#c49a92] ml-1">Full Name</label>
                <input
                  id="name" name="name" type="text" placeholder="John Doe"
                  value={formData.name} onChange={handleChange}
                  className={`input-field w-full ${errors.name ? 'border-red-500 bg-red-50/50 dark:bg-red-900/10' : ''}`}
                  autoComplete="name"
                />
                {errors.name && <p className="text-red-500 text-xs font-medium mt-1 ml-1">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-bold text-[#703e2d] dark:text-[#c49a92] ml-1">Email Address</label>
                <input
                  id="email" name="email" type="email" placeholder="student@college.edu"
                  value={formData.email} onChange={handleChange}
                  className={`input-field w-full ${errors.email ? 'border-red-500 bg-red-50/50 dark:bg-red-900/10' : ''}`}
                  autoComplete="email"
                />
                {errors.email && <p className="text-red-500 text-xs font-medium mt-1 ml-1">{errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-bold text-[#703e2d] dark:text-[#c49a92] ml-1">Password</label>
                <div className="relative">
                  <input
                    id="password" name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={formData.password} onChange={handleChange}
                    className={`input-field w-full pr-12 ${errors.password ? 'border-red-500 bg-red-50/50 dark:bg-red-900/10' : ''}`}
                    autoComplete="new-password"
                  />
                  <button
                    type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#ef6751] hover:text-[#d3513e] transition-colors p-2 rounded-full hover:bg-[#f0b8a8]/20 dark:hover:bg-[#3a1520]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    )}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs font-medium mt-1 ml-1">{errors.password}</p>}
              </div>

              {formData.password && (
                <div className="bg-[#fdf0ee] dark:bg-[#1f0a12] rounded-xl p-4 border border-[#f0b8a8]/50 dark:border-[#3a1520]">
                  <p className="text-xs font-bold text-[#703e2d] dark:text-[#eed9d6] mb-3">Password Security Matrix:</p>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                    {passwordRequirements.map((req, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${req.met ? 'bg-[#ef6751] text-white shadow-sm' : 'bg-[#eed9d6] dark:bg-[#140108] text-[#f0b8a8] dark:text-[#3a1520]'}`}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                        </span>
                        <span className={`text-[13px] font-semibold ${req.met ? 'text-[#703e2d] dark:text-[#c49a92]' : 'text-[#8b5e4d]/70 dark:text-[#c49a92]/50'}`}>{req.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-1.5 pt-1">
                <label htmlFor="confirmPassword" className="text-sm font-bold text-[#703e2d] dark:text-[#c49a92] ml-1">Confirm Password</label>
                <input
                  id="confirmPassword" name="confirmPassword" type="password"
                  placeholder="Repeat your password"
                  value={formData.confirmPassword} onChange={handleChange}
                  className={`input-field w-full ${errors.confirmPassword ? 'border-red-500 bg-red-50/50 dark:bg-red-900/10' : ''}`}
                  autoComplete="new-password"
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs font-medium mt-1 ml-1">{errors.confirmPassword}</p>}
              </div>

              <div className="pt-4">
                <button
                  type="submit" disabled={isLoading}
                  className="w-full py-5 sm:py-6 px-10 rounded-full bg-[#ef6751] hover:bg-[#d3513e] disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold text-lg transition-all duration-300 hover:shadow-xl hover:shadow-[#ef6751]/25 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  {isLoading ? 'Creating Account...' : 'Join CampusFlow'}
                  {!isLoading && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>}
                </button>
              </div>
            </form>

            <div className="pt-4 border-t border-[#f0b8a8]/40 dark:border-[#3a1520]/60">
              <p className="text-center text-base font-medium text-[#8b5e4d] dark:text-[#c49a92]">
                Already have an account?{' '}
                <Link href="/auth/signin" className="text-[#ef6751] font-bold hover:text-[#d3513e] transition-colors ml-1">
                  Sign in instead
                </Link>
              </p>
            </div>
          </div>

          {/* Decorative Side */}
          <div className="hidden lg:block animate-slide-in-right h-full sticky top-32">
            <div className="relative overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col justify-between py-16 px-12">
              <div className="absolute inset-0 bg-gradient-to-br from-[#fdf0ee] to-[#eed9d6] dark:from-[#1f0a12] dark:to-[#140108]" />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IndoaXRlIi8+PC9zdmc+')] bg-repeat opacity-10 dark:opacity-5" />
              <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#ef6751]/30 dark:bg-[#ef6751]/20 rounded-full blur-[100px]" />
              <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#d3513e]/30 dark:bg-[#d3513e]/20 rounded-full blur-[100px]" />
              
              <div className="relative z-10 flex flex-col h-full space-y-12">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-white/10 border border-[#f0b8a8]/50 dark:border-white/10 backdrop-blur-md">
                    <div className="w-2 h-2 rounded-full bg-[#ef6751] animate-pulse" />
                    <span className="text-xs font-bold tracking-wider text-[#703e2d] dark:text-white uppercase">Why Join Us</span>
                  </div>
                  <h3 className="text-4xl font-bold text-[#703e2d] dark:text-white leading-tight">Your gateway to<br />academic excellence.</h3>
                </div>

                <div className="space-y-6 flex-1">
                  {[
                    { title: 'Zero Hassle Booking', desc: 'Secure your lab space with a single tap. Say goodbye to messy spreadsheets.', icon: 'M5 13l4 4L19 7' },
                    { title: 'Equipment Tracking', desc: 'Real-time ledger of all available apparatus, from microscopes to 3D printers.', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
                    { title: 'Instant Notifications', desc: 'Get SMS and email alerts when your reserved slot opens up or changes.', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' }
                  ].map((feature, i) => (
                    <div key={i} className="flex gap-5 group">
                      <div className="w-12 h-12 rounded-2xl bg-[#f0b8a8]/30 dark:bg-white/5 border border-[#f0b8a8]/50 dark:border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#ef6751] transition-colors duration-300">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-[#d3513e] dark:text-white group-hover:text-white transition-colors" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={feature.icon}/></svg>
                      </div>
                      <div>
                        <h4 className="text-[#703e2d] dark:text-white font-bold text-lg mb-1">{feature.title}</h4>
                        <p className="text-[#8b5e4d] dark:text-white/60 text-sm leading-relaxed max-w-sm">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white/60 dark:bg-white/5 border border-[#f0b8a8]/50 dark:border-white/10 rounded-2xl p-6 backdrop-blur-md">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex -space-x-3">
                      {[1,2,3].map(i => <div key={i} className="w-10 h-10 rounded-full bg-[#ef6751] border-2 border-white dark:border-[#140108] flex items-center justify-center text-white font-bold text-sm">{String.fromCharCode(64+i)}</div>)}
                    </div>
                    <div className="text-[#703e2d] dark:text-white">
                      <div className="font-bold">4.9/5 Rating</div>
                      <div className="text-xs text-[#8b5e4d] dark:text-white/60">From 500+ students</div>
                    </div>
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
