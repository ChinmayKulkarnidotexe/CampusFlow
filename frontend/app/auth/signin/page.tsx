'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/authContext';

export default function SigninPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, verifyOTP, isLoading, error, requiresOTP, otpEmail, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '', otp: '', general: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showOTPInput, setShowOTPInput] = useState(false);

  // Check for registered query parameter
  useEffect(() => {
    const registered = searchParams.get('registered');
    if (registered === 'true') {
      setErrors((prev) => ({ ...prev, general: 'Account created successfully! Please sign in.' }));
    }
  }, [searchParams]);

  // Clear errors when typing
  const handleChange = (field: string, value: string) => {
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
    if (field === 'otp') setOtpCode(value);

    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: '', general: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = { email: '', password: '', otp: '', general: '' };
    let isValid = true;

    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Detect OTP requirement via state change (React batching fix)
  useEffect(() => {
    if (requiresOTP) {
      setShowOTPInput(true);
    }
  }, [requiresOTP]);

  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ email: '', password: '', otp: '', general: '' });

    if (!validateForm()) return;

    try {
      await login(email, password);
      // OTP transition is handled by the useEffect above
    } catch {
      // Error is already set in the auth context
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ email: '', password: '', otp: '', general: '' });

    if (!otpCode.trim()) {
      setErrors((prev) => ({ ...prev, otp: 'Please enter the OTP code' }));
      return;
    }

    try {
      await verifyOTP(email, otpCode);
    } catch {
      // Error is already set in the auth context
    }
  };

  // For debugging - show logout button when testing OTP flow
  const handleLogout = () => {
    logout();
    setShowOTPInput(false);
    setOtpCode('');
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-transparent">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 md:px-12 py-24 md:py-32 w-full">
        <div className="max-w-6xl w-full grid lg:grid-cols-[1fr_1.1fr] gap-16 xl:gap-24 items-center">
          {/* Form Side - Left padding and margin adjustments */}
          <div className="w-full max-w-md mx-auto lg:max-w-none space-y-10 animate-slide-in-left px-2 sm:px-0">
            <div className="space-y-4">
              <div className="inline-block px-4 py-1.5 rounded-full bg-[#f0b8a8]/30 dark:bg-[#3a1520] text-[#ef6751] text-xs font-bold uppercase tracking-widest mb-2">Login</div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#703e2d] dark:text-[#eed9d6] tracking-tight leading-tight">
                Welcome Back to<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ef6751] to-[#d3513e]">CampusFlow</span>
              </h1>
              <p className="text-lg text-[#8b5e4d] dark:text-[#c49a92] leading-relaxed">
                Sign in to manage your bookings, check lab availability, and request academic equipment securely.
              </p>
            </div>

            <form onSubmit={requiresOTP ? handleOTPSubmit : handleEmailPasswordSubmit} className="space-y-6 sm:space-y-8">
              {error && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-600 dark:text-red-300 font-medium">
                  {error}
                </div>
              )}

              {!requiresOTP ? (
                <>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-bold text-[#703e2d] dark:text-[#c49a92] ml-1">Email Address</label>
                    <input
                      id="email" type="email"
                      placeholder="student@college.edu"
                      value={email} onChange={(e) => handleChange('email', e.target.value)}
                      className={`input-field w-full ${errors.email ? 'border-red-500 bg-red-50/50 dark:bg-red-900/10' : ''}`}
                      autoComplete="email"
                    />
                    {errors.email && <p className="text-red-500 text-sm font-medium mt-1 ml-1">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-bold text-[#703e2d] dark:text-[#c49a92] ml-1">Password</label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your security keyword"
                        value={password} onChange={(e) => handleChange('password', e.target.value)}
                        className={`input-field w-full pr-12 ${errors.password ? 'border-red-500 bg-red-50/50 dark:bg-red-900/10' : ''}`}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#ef6751] hover:text-[#d3513e] transition-colors p-2 rounded-full hover:bg-[#f0b8a8]/20 dark:hover:bg-[#3a1520]"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-sm font-medium mt-1 ml-1">{errors.password}</p>}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input type="checkbox" className="w-5 h-5 rounded-md border-2 border-[#f0b8a8] dark:border-[#3a1520] appearance-none checked:bg-[#ef6751] checked:border-[#ef6751] transition-all cursor-pointer" />
                        <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100" viewBox="0 0 17 12" fill="none">
                          <path d="M1 5.5L6 10.5L16 1.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="text-[15px] font-medium text-[#703e2d] dark:text-[#c49a92] group-hover:text-[#ef6751] transition-colors">Remember me</span>
                    </label>
                    <Link href="/auth/forgot-password" className="text-[15px] font-bold text-[#ef6751] hover:text-[#d3513e] transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 text-blue-600 dark:text-blue-300 text-sm">
                    <p className="font-medium">Enter the OTP code sent to <span className="font-bold">{otpEmail}</span></p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="otp" className="text-sm font-bold text-[#703e2d] dark:text-[#c49a92] ml-1">OTP Code</label>
                    <input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otpCode} onChange={(e) => handleChange('otp', e.target.value)}
                      className={`input-field w-full ${errors.otp ? 'border-red-500 bg-red-50/50 dark:bg-red-900/10' : ''}`}
                      autoFocus
                    />
                    {errors.otp && <p className="text-red-500 text-sm font-medium mt-1 ml-1">{errors.otp}</p>}
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="text-xs font-medium text-[#8b5e4d] hover:text-[#ef6751] transition-colors"
                    >
                      Didn't receive OTP? Try logging out and back in
                    </button>
                  </div>
                </>
              )}

              <div className="pt-2">
                <button
                  type="submit" disabled={isLoading}
                  className="w-full py-5 sm:py-6 px-10 rounded-full bg-[#ef6751] hover:bg-[#d3513e] disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold text-lg transition-all duration-300 hover:shadow-xl hover:shadow-[#ef6751]/25 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Authenticating...
                    </span>
                  ) : requiresOTP ? 'Verify OTP' : 'Secure Sign In'}
                  {!isLoading && !requiresOTP && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>}
                </button>
              </div>
            </form>

            <div className="pt-4 border-t border-[#f0b8a8]/40 dark:border-[#3a1520]/60">
              <p className="text-center text-base font-medium text-[#8b5e4d] dark:text-[#c49a92]">
                New to CampusFlow?{' '}
                <Link href="/auth/signup" className="text-[#ef6751] font-bold hover:text-[#d3513e] transition-colors ml-1">
                  Create an account
                </Link>
              </p>
            </div>
          </div>

          {/* Decorative Side */}
          <div className="hidden lg:block animate-slide-in-right h-full">
            <div className="relative overflow-hidden rounded-[2.5rem] h-full shadow-2xl flex flex-col justify-between">
              {/* Complex gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#fdf0ee] to-[#f0b8a8] dark:from-[#140108] dark:to-[#1f0a12]" />
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#ef6751]/20 to-transparent rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#d3513e]/20 to-transparent rounded-full blur-3xl" />

              <div className="relative z-10 p-16 flex flex-col h-full justify-between">
                <div>
                  <h3 className="text-4xl font-bold text-[#703e2d] dark:text-[#eed9d6] mb-6 text-center">Your Academic Ecosystem</h3>
                  <p className="text-center text-[#8b5e4d] dark:text-[#c49a92] text-xl font-medium mb-16">All resources synced in real-time.</p>

                  <div className="grid grid-cols-2 gap-6">
                    {[
                      { icon: 'lab', label: 'Laboratories', color: '#ef6751', desc: 'Secure high-tech spaces' },
                      { icon: 'equipment', label: 'Equipment', color: '#d3513e', desc: 'Reserve vital tools' },
                      { icon: 'schedule', label: 'Schedules', color: '#703e2d', desc: 'View global timetable' },
                      { icon: 'profile', label: 'Workshops', color: '#8b5e4d', desc: 'Join collaborative learning' },
                    ].map((item, idx) => (
                      <div key={idx} className="bg-white/80 dark:bg-[#1f0a12]/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 dark:border-white/5 shadow-xl hover:-translate-y-1 transition-transform cursor-pointer">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-sm" style={{ backgroundColor: `${item.color}15` }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={item.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            {item.icon === 'lab' && <path d="M3 21h18M5 21V7l8-4 8 4v14M9 21v-6M15 21v-6" />}
                            {item.icon === 'equipment' && <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></>}
                            {item.icon === 'schedule' && <><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>}
                            {item.icon === 'profile' && <path d="M2 17L12 22L22 17M2 12L12 17L22 12M12 2L2 7L12 12L22 7L12 2Z" />}
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
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <span className="text-white font-bold text-lg mb-1">CampusFlow Secure</span>
                    <p className="text-white/80 text-sm font-medium">Enterprise grade security protocols.</p>
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
