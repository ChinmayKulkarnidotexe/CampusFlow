'use client';

import { useAuth } from '@/hooks/authContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// ── Request helpers ────────────────────────────────────────────────────────

interface RequestOptions extends RequestInit {
  token?: string;
  body?: Record<string, unknown> | FormData;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, body, ...rest } = options;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...rest.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const fetchOptions: RequestInit = {
    ...rest,
    headers,
  };

  if (body && !(body instanceof FormData)) {
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}

// ── Auth API ──────────────────────────────────────────────────────────────

export const authApi = {
  login: async (email: string, password: string) => {
    return request<{ message: string; requires_otp: boolean; email: string }>(
      '/auth/login',
      { method: 'POST', body: { email, password } }
    );
  },

  verifyOtp: async (email: string, otpCode: string) => {
    return request<{
      access_token: string;
      refresh_token: string;
      token_type: string;
      expires_in: number;
      user: UserResponse;
    }>('/auth/verify-otp', { method: 'POST', body: { email, otp_code: otpCode } });
  },

  refreshToken: async (refreshToken: string) => {
    return request<{
      access_token: string;
      refresh_token: string;
      token_type: string;
      expires_in: number;
    }>('/auth/refresh', { method: 'POST', body: { refresh_token: refreshToken } });
  },
};

// ── User API ──────────────────────────────────────────────────────────────

export interface UserResponse {
  user_id: number;
  full_name: string;
  email: string;
  role_id: number;
  department: string | null;
  created_at: string;
}

export interface CreateUserRequest {
  full_name: string;
  email: string;
  password: string;
  role_id?: number;
  department?: string;
}

export const userApi = {
  // Admin only - list all users
  listUsers: async (token: string) => {
    return request<{ users: UserResponse[] }>('/users', {
      method: 'GET',
      token,
    });
  },

  // Get current user
  getCurrentUser: async (token: string) => {
    return request<{ user: UserResponse }>('/users/me', {
      method: 'GET',
      token,
    });
  },

  // Admin only - get user by ID
  getUser: async (id: number, token: string) => {
    return request<{ user: UserResponse }>(`/users/${id}`, {
      method: 'GET',
      token,
    });
  },

  // Admin only - create user
  createUser: async (data: CreateUserRequest, token: string) => {
    return request<{ user: UserResponse }>('/users', {
      method: 'POST',
      token,
      body: data,
    });
  },

  // Admin only - update user
  updateUser: async (id: number, data: Partial<CreateUserRequest>, token: string) => {
    return request<{ user: UserResponse }>(`/users/${id}`, {
      method: 'PUT',
      token,
      body: data,
    });
  },

  // Admin only - delete user
  deleteUser: async (id: number, token: string) => {
    return request<void>(`/users/${id}`, {
      method: 'DELETE',
      token,
    });
  },
};

// ── Booking API ───────────────────────────────────────────────────────────

export interface Booking {
  booking_id: number;
  user_id: number;
  resource_id: number;
  start_time: string;
  end_time: string;
  booking_status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  purpose: string | null;
}

export interface BookingQuery {
  user_id?: number;
  resource_id?: number;
  booking_status?: string;
}

export interface CreateBookingRequest {
  resource_id: number;
  start_time: string;
  end_time: string;
  purpose?: string;
}

export interface UpdateBookingRequest {
  booking_status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
  start_time?: string;
  end_time?: string;
  purpose?: string;
}

export const bookingApi = {
  // List bookings - admin sees all, user sees their own
  listBookings: async (token: string, params?: BookingQuery) => {
    const query = params ? new URLSearchParams(params as Record<string, string>) : undefined;
    return request<{ bookings: Booking[] }>(`/bookings${query ? '?' + query.toString() : ''}`, {
      method: 'GET',
      token,
    });
  },

  // Get single booking
  getBooking: async (id: number, token: string) => {
    return request<{ booking: Booking }>(`/bookings/${id}`, {
      method: 'GET',
      token,
    });
  },

  // Create new booking
  createBooking: async (data: CreateBookingRequest, token: string) => {
    return request<{ booking: Booking }>(`/bookings`, {
      method: 'POST',
      token,
      body: data,
    });
  },

  // Admin only - approve/reject booking
  updateBooking: async (id: number, data: UpdateBookingRequest, token: string) => {
    return request<{ booking: Booking }>(`/bookings/${id}`, {
      method: 'PUT',
      token,
      body: data,
    });
  },

  // Cancel booking (user cancels their own, admin cancels any)
  cancelBooking: async (id: number, token: string) => {
    return request<{ booking: Booking }>(`/bookings/${id}`, {
      method: 'DELETE',
      token,
    });
  },
};

// ── Physical Resources API ────────────────────────────────────────────────

export interface PhysicalResource {
  resource_id: number;
  resource_name: string;
  resource_type: string;
  capacity: number;
  location: string;
  has_projector: boolean;
  has_ac: boolean;
  department: string | null;
  status: string;
  created_at: string;
}

export interface PhysicalResourceQuery {
  resource_type?: string;
  department?: string;
  status?: string;
  has_projector?: boolean;
  has_ac?: boolean;
}

export const resourceApi = {
  // List all resources - public endpoint, but admin can manage
  listResources: async (params?: PhysicalResourceQuery) => {
    const query = params ? new URLSearchParams(params as Record<string, string>) : undefined;
    return request<{ resources: PhysicalResource[] }>(`/physical-resources${query ? '?' + query.toString() : ''}`, {
      method: 'GET',
    });
  },

  // Get single resource
  getResource: async (id: number) => {
    return request<{ resource: PhysicalResource }>(`/physical-resources/${id}`, {
      method: 'GET',
    });
  },

  // Admin only - create resource
  createResource: async (data: any, token: string) => {
    return request<{ resource: PhysicalResource }>('/physical-resources', {
      method: 'POST',
      token,
      body: data,
    });
  },

  // Admin only - update resource
  updateResource: async (id: number, data: any, token: string) => {
    return request<{ resource: PhysicalResource }>(`/physical-resources/${id}`, {
      method: 'PUT',
      token,
      body: data,
    });
  },

  // Admin only - delete resource
  deleteResource: async (id: number, token: string) => {
    return request<void>(`/physical-resources/${id}`, {
      method: 'DELETE',
      token,
    });
  },
};
