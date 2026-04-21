'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/authContext';
import { bookingApi, type PhysicalResource, resourceApi, userApi } from '@/app/lib/api';

interface BookingWithDetails {
  booking_id: number;
  user_id: number;
  resource_id: number;
  start_time: string;
  end_time: string;
  booking_status: string;
  purpose: string | null;
  resource_name?: string;
  user_name?: string;
  user_email?: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, isLoading: authLoading, accessToken } = useAuth();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [resources, setResources] = useState<PhysicalResource[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'bookings' | 'resources' | 'users'>('bookings');
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      window.location.href = '/auth/signin';
    } else if (!isAdmin) {
      window.location.href = '/dashboard';
    }
  }, [isAuthenticated, isAdmin, authLoading]);

  // Fetch bookings when tab is active
  useEffect(() => {
    if (isAdmin && activeTab === 'bookings') {
      fetchBookings();
    }
  }, [activeTab, isAdmin, accessToken]);

  const fetchBookings = async () => {
    if (!accessToken) return;
    setIsLoadingBookings(true);
    setError(null);
    try {
      const data = await bookingApi.listBookings(accessToken);
      const bookingList = data.bookings || [];

      // Fetch resources to get names
      const resourceData = await resourceApi.listResources();
      const resourceMap = new Map<number, string>();
      resourceData.resources?.forEach(r => {
        resourceMap.set(r.resource_id, r.resource_name);
      });

      // Map resource names to bookings
      const bookingsWithDetails = bookingList.map((b: any) => ({
        ...b,
        resource_name: resourceMap.get(b.resource_id) || `Resource #${b.resource_id}`,
      }));

      setBookings(bookingsWithDetails);
    } catch (err: any) {
      setError('Failed to load bookings: ' + err.message);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const fetchResources = async () => {
    setIsLoadingResources(true);
    setError(null);
    try {
      const data = await resourceApi.listResources();
      setResources(data.resources || []);
    } catch (err: any) {
      setError('Failed to load resources');
    } finally {
      setIsLoadingResources(false);
    }
  };

  const fetchUsers = async () => {
    if (!accessToken) return;
    setIsLoadingUsers(true);
    setError(null);
    try {
      const data = await userApi.listUsers(accessToken);
      setUsers(data.users || []);
    } catch (err: any) {
      setError('Failed to load users');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleApprove = async (bookingId: number) => {
    setError(null);
    try {
      await bookingApi.updateBooking(bookingId, { booking_status: 'approved' }, accessToken || '');
      fetchBookings();
    } catch (err: any) {
      setError('Failed to approve booking');
    }
  };

  const handleReject = async (bookingId: number) => {
    setError(null);
    try {
      await bookingApi.updateBooking(bookingId, { booking_status: 'rejected' }, accessToken || '');
      fetchBookings();
    } catch (err: any) {
      setError('Failed to reject booking');
    }
  };

  const handleDelete = async (bookingId: number) => {
    setError(null);
    try {
      await bookingApi.cancelBooking(bookingId, accessToken || '');
      fetchBookings();
    } catch (err: any) {
      setError('Failed to delete booking');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-500 text-white';
      case 'rejected':
        return 'bg-red-500 text-white';
      case 'cancelled':
        return 'bg-gray-500 text-white';
      case 'pending':
      default:
        return 'bg-yellow-500 text-white';
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ef6751]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-transparent">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-7xl w-full">
          {/* Header */}
          <div className="mb-8">
            <div className="inline-block px-4 py-1.5 rounded-full bg-[#f0b8a8]/30 dark:bg-[#3a1520] text-[#ef6751] text-xs font-bold uppercase tracking-widest mb-4">
              Admin Dashboard
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#703e2d] dark:text-[#eed9d6]">
              Welcome, {user?.full_name}
            </h1>
            <p className="text-[#8b5e4d] dark:text-[#c49a92] mt-2">
              Manage bookings, resources, and users across the campus.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-600 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-[#1f0a12] rounded-2xl p-6 shadow-lg border border-[#f0b8a8]/20 dark:border-[#3a1520]/30">
              <div className="text-sm text-[#8b5e4d] dark:text-[#c49a92] font-medium">Total Bookings</div>
              <div className="text-3xl font-bold text-[#703e2d] dark:text-[#eed9d6] mt-2">{bookings.length}</div>
            </div>
            <div className="bg-white dark:bg-[#1f0a12] rounded-2xl p-6 shadow-lg border border-[#f0b8a8]/20 dark:border-[#3a1520]/30">
              <div className="text-sm text-[#8b5e4d] dark:text-[#c49a92] font-medium">Pending Approval</div>
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-500 mt-2">
                {bookings.filter((b: any) => b.booking_status?.toLowerCase() === 'pending').length}
              </div>
            </div>
            <div className="bg-white dark:bg-[#1f0a12] rounded-2xl p-6 shadow-lg border border-[#f0b8a8]/20 dark:border-[#3a1520]/30">
              <div className="text-sm text-[#8b5e4d] dark:text-[#c49a92] font-medium">Active Resources</div>
              <div className="text-3xl font-bold text-[#ef6751] mt-2">{resources.length}</div>
            </div>
            <div className="bg-white dark:bg-[#1f0a12] rounded-2xl p-6 shadow-lg border border-[#f0b8a8]/20 dark:border-[#3a1520]/30">
              <div className="text-sm text-[#8b5e4d] dark:text-[#c49a92] font-medium">Registered Users</div>
              <div className="text-3xl font-bold text-[#ef6751] mt-2">{users.length}</div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => {
                setActiveTab('bookings');
                if (!isLoadingBookings) fetchBookings();
              }}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                activeTab === 'bookings'
                  ? 'bg-[#ef6751] text-white shadow-lg shadow-[#ef6751]/25'
                  : 'bg-white dark:bg-[#1f0a12] text-[#703e2d] dark:text-[#c49a92] hover:bg-[#f0b8a8]/50 dark:hover:bg-[#3a1520]'
              }`}
            >
              Manage Bookings
            </button>
            <button
              onClick={() => {
                setActiveTab('resources');
                if (!isLoadingResources) fetchResources();
              }}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                activeTab === 'resources'
                  ? 'bg-[#ef6751] text-white shadow-lg shadow-[#ef6751]/25'
                  : 'bg-white dark:bg-[#1f0a12] text-[#703e2d] dark:text-[#c49a92] hover:bg-[#f0b8a8]/50 dark:hover:bg-[#3a1520]'
              }`}
            >
              Manage Resources
            </button>
            <button
              onClick={() => {
                setActiveTab('users');
                if (!isLoadingUsers) fetchUsers();
              }}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                activeTab === 'users'
                  ? 'bg-[#ef6751] text-white shadow-lg shadow-[#ef6751]/25'
                  : 'bg-white dark:bg-[#1f0a12] text-[#703e2d] dark:text-[#c49a92] hover:bg-[#f0b8a8]/50 dark:hover:bg-[#3a1520]'
              }`}
            >
              Manage Users
            </button>
          </div>

          {/* Content Area */}
          <div className="bg-white dark:bg-[#1f0a12] rounded-2xl shadow-xl border border-[#f0b8a8]/20 dark:border-[#3a1520]/30 overflow-hidden">
            {activeTab === 'bookings' && (
              <>
                <div className="p-6 border-b border-[#f0b8a8]/20 dark:border-[#3a1520]/30">
                  <h2 className="text-xl font-bold text-[#703e2d] dark:text-[#eed9d6]">All Booking Requests</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#f0b8a8]/10 dark:bg-[#3a1520]/30">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold text-[#703e2d] dark:text-[#eed9d6]">ID</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-[#703e2d] dark:text-[#eed9d6]">User</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-[#703e2d] dark:text-[#eed9d6]">Resource</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-[#703e2d] dark:text-[#eed9d6]">Dates</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-[#703e2d] dark:text-[#eed9d6]">Purpose</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-[#703e2d] dark:text-[#eed9d6]">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-[#703e2d] dark:text-[#eed9d6]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0b8a8]/20 dark:divide-[#3a1520]/30">
                      {isLoadingBookings ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-[#8b5e4d] dark:text-[#c49a92]">
                            Loading bookings...
                          </td>
                        </tr>
                      ) : bookings.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-[#8b5e4d] dark:text-[#c49a92]">
                            No bookings found.
                          </td>
                        </tr>
                      ) : (
                        bookings.map((booking: BookingWithDetails) => (
                          <tr key={booking.booking_id}>
                            <td className="px-6 py-4 text-sm text-[#703e2d] dark:text-[#eed9d6]">
                              #{booking.booking_id}
                            </td>
                            <td className="px-6 py-4 text-sm text-[#703e2d] dark:text-[#eed9d6]">
                              <div className="font-medium">{booking.user_name || `User ${booking.user_id}`}</div>
                              <div className="text-xs text-[#8b5e4d] dark:text-[#c49a92]">
                                {booking.user_email || `user_${booking.user_id}@university.edu`}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-[#703e2d] dark:text-[#eed9d6]">
                              {booking.resource_name || `Resource #${booking.resource_id}`}
                            </td>
                            <td className="px-6 py-4 text-sm text-[#8b5e4d] dark:text-[#c49a92]">
                              <div>{new Date(booking.start_time).toLocaleDateString()}</div>
                              <div className="text-xs">
                                {new Date(booking.start_time).toLocaleTimeString()} - {new Date(booking.end_time).toLocaleTimeString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-[#703e2d] dark:text-[#eed9d6]">
                              {booking.purpose || '-'}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(booking.booking_status)}`}>
                                {booking.booking_status?.toUpperCase() || 'PENDING'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                {booking.booking_status?.toLowerCase() === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => handleApprove(booking.booking_id)}
                                      className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-medium transition-colors"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleReject(booking.booking_id)}
                                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition-colors"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => handleDelete(booking.booking_id)}
                                  className="px-3 py-1.5 rounded-lg bg-gray-600 hover:bg-gray-700 text-white text-xs font-medium transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {activeTab === 'resources' && (
              <>
                <div className="p-6 border-b border-[#f0b8a8]/20 dark:border-[#3a1520]/30 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-[#703e2d] dark:text-[#eed9d6]">Physical Resources</h2>
                  <button className="px-4 py-2 bg-[#ef6751] hover:bg-[#d3513e] text-white rounded-lg text-sm font-medium transition-colors">
                    + Add Resource
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#f0b8a8]/10 dark:bg-[#3a1520]/30">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold text-[#703e2d] dark:text-[#eed9d6]">ID</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-[#703e2d] dark:text-[#eed9d6]">Name</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-[#703e2d] dark:text-[#eed9d6]">Type</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-[#703e2d] dark:text-[#eed9d6]">Location</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-[#703e2d] dark:text-[#eed9d6]">Capacity</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-[#703e2d] dark:text-[#eed9d6]">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0b8a8]/20 dark:divide-[#3a1520]/30">
                      {isLoadingResources ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-[#8b5e4d] dark:text-[#c49a92]">
                            Loading resources...
                          </td>
                        </tr>
                      ) : resources.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-[#8b5e4d] dark:text-[#c49a92]">
                            No resources found.
                          </td>
                        </tr>
                      ) : (
                        resources.map((resource: PhysicalResource) => (
                          <tr key={resource.resource_id}>
                            <td className="px-6 py-4 text-sm text-[#703e2d] dark:text-[#eed9d6]">
                              #{resource.resource_id}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-[#703e2d] dark:text-[#eed9d6]">
                              {resource.resource_name}
                            </td>
                            <td className="px-6 py-4 text-sm text-[#8b5e4d] dark:text-[#c49a92]">
                              {resource.resource_type}
                            </td>
                            <td className="px-6 py-4 text-sm text-[#8b5e4d] dark:text-[#c49a92]">
                              {resource.location}
                            </td>
                            <td className="px-6 py-4 text-sm text-[#8b5e4d] dark:text-[#c49a92]">
                              {resource.capacity}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                resource.status === 'available'
                                  ? 'bg-green-500 text-white'
                                  : 'bg-yellow-500 text-white'
                              }`}>
                                {resource.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {activeTab === 'users' && (
              <>
                <div className="p-6 border-b border-[#f0b8a8]/20 dark:border-[#3a1520]/30">
                  <h2 className="text-xl font-bold text-[#703e2d] dark:text-[#eed9d6]">Registered Users</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#f0b8a8]/10 dark:bg-[#3a1520]/30">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold text-[#703e2d] dark:text-[#eed9d6]">ID</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-[#703e2d] dark:text-[#eed9d6]">Name</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-[#703e2d] dark:text-[#eed9d6]">Email</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-[#703e2d] dark:text-[#eed9d6]">Role</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-[#703e2d] dark:text-[#eed9d6]">Department</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0b8a8]/20 dark:divide-[#3a1520]/30">
                      {isLoadingUsers ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-[#8b5e4d] dark:text-[#c49a92]">
                            Loading users...
                          </td>
                        </tr>
                      ) : users.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-[#8b5e4d] dark:text-[#c49a92]">
                            No users found.
                          </td>
                        </tr>
                      ) : (
                        users.map((u: any) => (
                          <tr key={u.user_id}>
                            <td className="px-6 py-4 text-sm text-[#703e2d] dark:text-[#eed9d6]">#{u.user_id}</td>
                            <td className="px-6 py-4 text-sm font-medium text-[#703e2d] dark:text-[#eed9d6]">
                              {u.full_name}
                            </td>
                            <td className="px-6 py-4 text-sm text-[#8b5e4d] dark:text-[#c49a92]">{u.email}</td>
                            <td className="px-6 py-4 text-sm text-[#8b5e4d] dark:text-[#c49a92]">
                              {u.role_name || `role_${u.role_id}`}
                            </td>
                            <td className="px-6 py-4 text-sm text-[#8b5e4d] dark:text-[#c49a92]">
                              {u.department || '-'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
