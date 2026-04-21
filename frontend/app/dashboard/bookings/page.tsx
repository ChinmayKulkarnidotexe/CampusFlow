'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/authContext';
import { bookingApi, Booking, resourceApi } from '@/app/lib/api';

interface BookingWithResource extends Booking {
  resource_name: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-500 text-white', dot: 'bg-yellow-500' },
  approved: { label: 'Approved', color: 'bg-green-500 text-white', dot: 'bg-green-500' },
  rejected: { label: 'Rejected', color: 'bg-red-500 text-white', dot: 'bg-red-500' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-500 text-white', dot: 'bg-gray-500' },
};

const STATUS_FILTERS = ['All', 'Pending', 'Approved', 'Rejected', 'Cancelled'];

export default function BookingsPage() {
  const { user, accessToken, isAuthenticated, isLoading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<BookingWithResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [cancelBookingId, setCancelBookingId] = useState<number | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchBookings = useCallback(async (filter: string = activeFilter) => {
    setLoading(true);
    setError(null);

    try {
      if (!accessToken) {
        setError('Authentication required. Please sign in.');
        setLoading(false);
        return;
      }

      const data = await bookingApi.listBookings(accessToken);
      const bookingList = data.bookings || [];

      // Fetch resource names
      let resourceMap = new Map<number, string>();
      try {
        const resData = await resourceApi.listResources();
        resData.resources?.forEach(r => resourceMap.set(r.resource_id, r.resource_name));
      } catch { /* ignore */ }

      const bookingsWithResource = bookingList.map((b) => ({
        ...b,
        resource_name: resourceMap.get(b.resource_id) || `Resource #${b.resource_id}`,
      }));

      setBookings(bookingsWithResource);
    } catch (err: any) {
      if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        setError('Your session has expired. Please sign in again.');
        setTimeout(() => {
          window.location.href = '/auth/signin';
        }, 2000);
        return;
      }
      setError(err.message || 'An error occurred while fetching bookings');
    } finally {
      setLoading(false);
    }
  }, [activeFilter, accessToken]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchBookings();
    }
  }, [fetchBookings, authLoading, isAuthenticated]);

  const handleCancelBooking = async (bookingId: number) => {
    setIsCancelling(true);
    setError(null);
    try {
      await bookingApi.cancelBooking(bookingId, accessToken!);
      fetchBookings();
      setCancelBookingId(null);
    } catch (err: any) {
      if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        setError('Your session has expired. Please sign in again.');
        setTimeout(() => {
          window.location.href = '/auth/signin';
        }, 2000);
        return;
      }
      setError(err.message || 'An error occurred while cancelling the booking');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  const filteredBookings = activeFilter === 'All'
    ? bookings
    : bookings.filter((b) => b.booking_status.toLowerCase() === activeFilter.toLowerCase());

  const formatDateTime = (datetimeStr: string) => {
    if (!datetimeStr) return '-';
    const date = new Date(datetimeStr);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen font-sans bg-[#f8f0e8] dark:bg-[#1e2a25]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-180px)]">
          <div className="text-center">
            <div className="inline-block p-6 rounded-full bg-[#f0b8a8]/20 dark:bg-[#344840]/20 mb-4 animate-pulse">
              <div className="text-[#ef6751]">Loading...</div>
            </div>
            <p className="text-[#703e2d] dark:text-[#e8f2ea] text-lg font-medium">Loading your bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans bg-[#f8f0e8] dark:bg-[#1e2a25]">
      <Navbar />

      <header className="bg-[#ef6751] dark:bg-[#26352f] text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">My Bookings</h1>
              <p className="text-white/90 text-lg">Manage and track your resource reservations</p>
            </div>
            <div className="flex items-center gap-4 bg-white/20 dark:bg-black/20 backdrop-blur-md px-6 py-3 rounded-2xl">
              <div className="text-right">
                <div className="text-3xl font-bold">{filteredBookings.length}</div>
                <div className="text-sm opacity-90">Total Bookings</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center">
                <span className="text-white text-2xl">📅</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {error && (
          <div className="mb-6 p-4 bg-[#D3513E]/10 border border-[#D3513E]/30 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="text-[#D3513E]">⚠️</div>
              <div>
                <h4 className="font-bold text-[#D3513E] mb-1">Error Loading Bookings</h4>
                <p className="text-[#8b5e4d] dark:text-[#a8cbb8] text-sm">{error}</p>
                <button onClick={() => fetchBookings()} className="mt-3 text-[#ef6751] hover:underline text-sm font-medium">
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-2xl font-bold text-[#703e2d] dark:text-[#e8f2ea]">Bookings History</h2>
            <p className="text-[#8b5e4d] dark:text-[#a8cbb8]">Filter by status to find your reservations</p>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {STATUS_FILTERS.map((status) => {
              const isActive = activeFilter === status;
              const count = status === 'All' ? bookings.length : filteredBookings.length;
              return (
                <button
                  key={status}
                  onClick={() => handleFilterChange(status)}
                  className={`px-5 py-2.5 rounded-full font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-[#ef6751] text-white'
                      : 'bg-white dark:bg-[#26352f] text-[#703e2d] dark:text-[#a8cbb8] border border-[#f0b8a8] dark:border-[#344840] hover:bg-[#f0b8a8]/20 dark:hover:bg-[#344840]/20'
                  }`}
                >
                  {status}
                  {status !== 'All' && bookings.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-black/10 dark:bg-white/10 rounded-full text-xs">{count}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-[#26352f] rounded-2xl shadow-sm border border-[#f0b8a8]/40 dark:border-[#344840]/40 overflow-hidden">
          {filteredBookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#f0b8a8]/20 dark:bg-[#344840]/20">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#703e2d] dark:text-[#e8f2ea]">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#703e2d] dark:text-[#e8f2ea]">Resource</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#703e2d] dark:text-[#e8f2ea]">Start Time</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#703e2d] dark:text-[#e8f2ea]">End Time</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#703e2d] dark:text-[#e8f2ea]">Purpose</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#703e2d] dark:text-[#e8f2ea]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0b8a8]/20 dark:divide-[#344840]/20">
                  {filteredBookings.map((booking) => {
                    const statusKey = booking.booking_status.toLowerCase();
                    const statusConfig = STATUS_CONFIG[statusKey] || STATUS_CONFIG.pending;
                    return (
                      <tr key={booking.booking_id} className="hover:bg-[#f8f0e8]/50 dark:hover:bg-[#1e2a25]/50 transition-colors">
                        <td className="px-6 py-4 text-[#703e2d] dark:text-[#e8f2ea] font-medium">#{booking.booking_id}</td>
                        <td className="px-6 py-4">
                          <div className="text-[#703e2d] dark:text-[#e8f2ea] font-medium">{booking.resource_name}</div>
                          <div className="text-xs text-[#8b5e4d] dark:text-[#a8cbb8]">ID: {booking.resource_id}</div>
                        </td>
                        <td className="px-6 py-4 text-[#703e2d] dark:text-[#e8f2ea]">{formatDateTime(booking.start_time)}</td>
                        <td className="px-6 py-4 text-[#703e2d] dark:text-[#e8f2ea]">{formatDateTime(booking.end_time)}</td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs truncate text-[#703e2d] dark:text-[#e8f2ea]">{booking.purpose || <span className="text-[#a8cbb8] italic">No purpose specified</span>}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${statusConfig.color}`}>
                            <span className={`w-2 h-2 rounded-full ${statusConfig.dot}`}></span>
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {booking.user_id === user?.user_id && (booking.booking_status.toLowerCase() === 'pending' || booking.booking_status.toLowerCase() === 'approved') && (
                            <button
                              onClick={() => setCancelBookingId(booking.booking_id)}
                              disabled={isCancelling}
                              className="px-3 py-1.5 rounded-lg bg-[#d3513e] hover:bg-[#c04633] text-white text-xs font-medium transition-colors disabled:opacity-70"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 px-6 text-center">
              <div className="inline-block p-6 rounded-full bg-[#f0b8a8]/10 dark:bg-[#344840]/10 mb-4">
                <span className="text-4xl">📅</span>
              </div>
              <h3 className="text-xl font-bold text-[#703e2d] dark:text-[#e8f2ea] mb-2">No bookings found</h3>
              <p className="text-[#8b5e4d] dark:text-[#a8cbb8] mb-6 max-w-md mx-auto">
                {activeFilter === 'All'
                  ? 'You haven\'t made any bookings yet. Browse available resources to get started.'
                  : `No ${activeFilter} bookings found.`}
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-3 bg-[#ef6751] hover:bg-[#d3513e] text-white font-bold rounded-xl transition-all hover:shadow-lg hover:shadow-[#ef6751]/20"
              >
                <span className="text-lg"> ➡ </span>
                Browse Resources
              </Link>
            </div>
          )}
        </div>

        {!error && bookings.length > 0 && filteredBookings.length === 0 && (
          <div className="mt-12 text-center">
            <p className="text-[#8b5e4d] dark:text-[#a8cbb8]">No bookings match the "{activeFilter}" filter.</p>
            <button onClick={() => setActiveFilter('All')} className="mt-4 text-[#ef6751] hover:underline font-medium">
              View All Bookings
            </button>
          </div>
        )}

        {/* Cancel Booking Confirmation Modal */}
        {cancelBookingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-[#26352f] rounded-3xl max-w-md w-full shadow-2xl animate-slide-in-up p-8">
              <h3 className="text-2xl font-bold text-[#703e2d] dark:text-[#e8f2ea] mb-4">Cancel Booking?</h3>
              <p className="text-[#8b5e4d] dark:text-[#c49a92] mb-6">
                Are you sure you want to cancel this booking? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setCancelBookingId(null)}
                  className="flex-1 py-3 rounded-xl font-semibold text-[#703e2d] dark:text-[#c49a92] hover:bg-[#f0b8a8] dark:hover:bg-[#344840] transition-colors"
                >
                  Keep Booking
                </button>
                <button
                  onClick={() => handleCancelBooking(cancelBookingId)}
                  disabled={isCancelling}
                  className="flex-1 py-3 rounded-xl font-bold bg-[#d3513e] hover:bg-[#c04633] text-white disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                >
                  {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
