'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type UserRole = 'admin' | 'student' | 'faculty' | 'lab_assistant';

interface User {
  user_id: number;
  full_name: string;
  email: string;
  role_id: number;
  role_name?: UserRole; // Backend might not always return role_name
  department: string | null;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isFaculty: boolean;
  isStudent: boolean;
  isLoading: boolean;
  error: string | null;
  requiresOTP: boolean;
  otpEmail: string;
  login: (email: string, password: string) => Promise<void>;
  verifyOTP: (email: string, otpCode: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACCESS_TOKEN_KEY = 'campusflow-access-token';
const REFRESH_TOKEN_KEY = 'campusflow-refresh-token';
const USER_KEY = 'campusflow-user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requiresOTP, setRequiresOTP] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');

  useEffect(() => {
    // Load persisted session on mount
    const storedUser = localStorage.getItem(USER_KEY);
    const storedToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (storedUser && storedToken && storedRefreshToken) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setAccessToken(storedToken);
        setRefreshToken(storedRefreshToken);
      } catch {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  // Persist session to localStorage
  const persistSession = (user: User, accessToken: string, refreshToken: string) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  };

  // Clear session from localStorage
  const clearSession = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('pending-login-email');
    localStorage.removeItem('pending-login-password');
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    setRequiresOTP(false);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Login failed');
      }

      // Check if OTP is required (backend always returns requires_otp: true currently)
      if (data.requires_otp) {
        setRequiresOTP(true);
        setOtpEmail(email);
        // Store credentials for OTP verification
        localStorage.setItem('pending-login-email', email);
        localStorage.setItem('pending-login-password', password);
      } else if (data.access_token) {
        // Direct login without OTP (if backend changes)
        persistSession(data.user, data.access_token, data.refresh_token || '');
        setAccessToken(data.access_token);
        setRefreshToken(data.refresh_token);
        setUser(data.user);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (email: string, otpCode: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp_code: otpCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'OTP verification failed');
      }

      // Store tokens and user
      persistSession(data.user, data.access_token, data.refresh_token);
      setAccessToken(data.access_token);
      setRefreshToken(data.refresh_token);
      setUser(data.user);
      setRequiresOTP(false);
      setOtpEmail('');

      // Clear pending credentials
      localStorage.removeItem('pending-login-email');
      localStorage.removeItem('pending-login-password');

      // Redirect to appropriate dashboard based on role
      if (data.user.role_name === 'admin' || data.user.role_id === 1) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify OTP');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ full_name: name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Registration failed');
      }

      // Registration successful - redirect to signin
      router.push('/auth/signin?registered=true');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    clearSession();
    router.push('/auth/signin');
  };

  // Refresh access token using refresh token
  const refreshTokenAPI = async () => {
    const rt = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!rt) {
      logout();
      return;
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: rt }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      persistSession(user!, data.access_token, data.refresh_token);
      setAccessToken(data.access_token);
    } catch {
      logout();
    }
  };

  const value: AuthContextType = {
    user,
    accessToken,
    refreshToken,
    isAuthenticated: !!accessToken,
    isAdmin: user?.role_name === 'admin' || user?.role_id === 1,
    isFaculty: user?.role_name === 'faculty' || user?.role_id === 2,
    isStudent: user?.role_name === 'student' || user?.role_id === 3,
    isLoading,
    error,
    requiresOTP,
    otpEmail,
    login,
    verifyOTP,
    register,
    logout,
    refreshToken: refreshTokenAPI,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
