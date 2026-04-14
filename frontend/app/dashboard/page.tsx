'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

// Mock data for resources
const resources = [
  {
    id: 1,
    name: 'Physics Laboratory A',
    category: 'Laboratory',
    capacity: '30 students',
    equipment: ['Oscilloscopes', 'Multimeters', 'Power Supplies', 'Breadboards'],
    price: '$25/hour',
    availability: ['Mon 9AM-12PM', 'Wed 2PM-5PM', 'Fri 10AM-1PM'],
    image: 'lab',
    status: 'available',
  },
  {
    id: 2,
    name: 'Computer Science Lab',
    category: 'Laboratory',
    capacity: '40 students',
    equipment: ['High-end PCs', 'Graphics Cards', 'Network Switches', 'Servers'],
    price: '$30/hour',
    availability: ['Tue 9AM-12PM', 'Thu 1PM-4PM', 'Sat 10AM-2PM'],
    image: 'computer',
    status: 'available',
  },
  {
    id: 3,
    name: '3D Printer Kit',
    category: 'Equipment',
    capacity: '1 person',
    equipment: ['Prusa i3 MK3S', 'Filament Spools', 'Calibration Tools'],
    price: '$15/hour',
    availability: ['Daily 8AM-10PM'],
    image: 'equipment',
    status: 'maintenance',
  },
  {
    id: 4,
    name: 'Electronics Workstation',
    category: 'Equipment',
    capacity: '2 people',
    equipment: ['Soldering Stations', 'Power Supplies', 'Logic Analyzers', 'Bench Tools'],
    price: '$20/hour',
    availability: ['Mon-Fri 9AM-6PM'],
    image: 'electronics',
    status: 'available',
  },
  {
    id: 5,
    name: 'Study Room 101',
    category: 'Classroom',
    capacity: '6 people',
    equipment: ['Whiteboard', 'Projector', 'Conferencing System'],
    price: '$10/hour',
    availability: ['Daily 8AM-10PM'],
    image: 'classroom',
    status: 'available',
  },
  {
    id: 6,
    name: 'Group Study Pod',
    category: 'Classroom',
    capacity: '4 people',
    equipment: ['Smart Display', 'Whiteboard', 'Comfortable Seating'],
    price: '$8/hour',
    availability: ['Mon-Fri 10AM-8PM'],
    image: 'pod',
    status: 'booked',
  },
];

const categories = ['All', 'Laboratory', 'Equipment', 'Classroom'];

export default function DashboardPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [bookingModal, setBookingModal] = useState<{ show: boolean; resource?: typeof resources[0] }>({ show: false });
  const [bookingDetails, setBookingDetails] = useState({ date: '', time: '', duration: '1' });
  const [isBooking, setIsBooking] = useState(false);

  const filteredResources = activeCategory === 'All'
    ? resources
    : resources.filter((r) => r.category === activeCategory);

  const handleBook = (resource: typeof resources[0]) => {
    setBookingModal({ show: true, resource });
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBooking(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsBooking(false);
      setBookingModal({ show: false });
      alert('Booking confirmed! Check your email for details.');
    } catch {
      setIsBooking(false);
    }
  };

  return (
    <div className="min-h-screen font-sans bg-[#f8f0e8] dark:bg-[#1e2a25]">
      <Navbar />

      {/* Header */}
      <header className="bg-[#ef6751] dark:bg-[#26352f] text-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">My Dashboard</h1>
              <p className="text-white/90 text-lg">Manage your bookings and explore available resources</p>
            </div>
            <div className="flex items-center gap-4 bg-white/20 dark:bg-black/20 backdrop-blur-md px-6 py-3 rounded-2xl">
              <div className="text-right">
                <div className="text-3xl font-bold">5</div>
                <div className="text-sm opacity-90">Active Bookings</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Bookings', value: '24', icon: 'calendar' },
            { label: 'Hours Used', value: '156', icon: 'clock' },
            { label: 'Labs Visited', value: '8', icon: 'lab' },
            { label: 'Equipment Used', value: '12', icon: 'equipment' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white dark:bg-[#26352f] p-6 rounded-2xl shadow-sm border border-[#f0b8a8]/30 dark:border-[#344840]/30">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#f0b8a8]/20 dark:bg-[#344840]/20 flex items-center justify-center text-[#ef6751]">
                  {stat.icon === 'calendar' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>}
                  {stat.icon === 'clock' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
                  {stat.icon === 'lab' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15" /></svg>}
                  {stat.icon === 'equipment' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>}
                </div>
              </div>
              <div className="text-3xl font-bold text-[#703e2d] dark:text-[#e8f2ea] mb-1">{stat.value}</div>
              <div className="text-sm font-medium text-[#8b5e4d] dark:text-[#a8cbb8]">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-2xl font-bold text-[#703e2d] dark:text-[#e8f2ea]">Available Resources</h2>
            <p className="text-[#8b5e4d] dark:text-[#a8cbb8]">Select a category to filter resources</p>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-full font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-[#ef6751] text-white'
                    : 'bg-white dark:bg-[#26352f] text-[#703e2d] dark:text-[#a8cbb8] border border-[#f0b8a8] dark:border-[#344840] hover:bg-[#f0b8a8]/20 dark:hover:bg-[#344840]/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredResources.map((resource) => (
            <div
              key={resource.id}
              className="group bg-white dark:bg-[#26352f] rounded-2xl border border-[#f0b8a8]/40 dark:border-[#344840]/40 overflow-hidden hover:shadow-xl hover:border-[#ef6751]/50 dark:hover:border-[#ef6751]/50 transition-all duration-300"
            >
              {/* Header */}
              <div className="p-6 border-b border-[#f0b8a8]/30 dark:border-[#344840]/30">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    resource.category === 'Laboratory' ? 'bg-[#f0b8a8] text-[#703e2d]' :
                    resource.category === 'Equipment' ? 'bg-[#d3513e]/20 text-[#d3513e]' :
                    'bg-[#344840]/20 text-[#344840]'
                  }`}>
                    {resource.category}
                  </span>
                  <span className={`text-sm font-medium ${
                    resource.status === 'available' ? 'text-[#84AE92]' :
                    resource.status === 'maintenance' ? 'text-[#d3513e]' : 'text-[#8b5e4d]'
                  }`}>
                    {resource.status === 'available' ? 'Available' : resource.status === 'maintenance' ? 'Maintenance' : 'Booked'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#703e2d] dark:text-[#e8f2ea] mb-1">{resource.name}</h3>
                <p className="text-[#8b5e4d] dark:text-[#a8cbb8] text-sm">{resource.capacity} • {resource.price}</p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#8b5e4d] dark:text-[#a8cbb8] mb-2">Equipment</h4>
                  <div className="flex flex-wrap gap-2">
                    {resource.equipment.slice(0, 3).map((eq, idx) => (
                      <span key={idx} className="px-2 py-1 bg-[#f0b8a8]/20 dark:bg-[#344840]/30 text-[#8b5e4d] dark:text-[#a8cbb8] text-xs rounded">
                        {eq}
                      </span>
                    ))}
                    {resource.equipment.length > 3 && (
                      <span className="px-2 py-1 bg-[#f0b8a8]/10 dark:bg-[#344840]/20 text-[#8b5e4d] dark:text-[#a8cbb8] text-xs rounded">
                        +{resource.equipment.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#8b5e4d] dark:text-[#a8cbb8] mb-2">Available Times</h4>
                  <div className="text-sm text-[#703e2d] dark:text-[#e8f2ea]">
                    {resource.availability.slice(0, 2).join(', ')}
                    {resource.availability.length > 2 && '...'}
                  </div>
                </div>

                <button
                  onClick={() => handleBook(resource)}
                  disabled={resource.status !== 'available'}
                  className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                    resource.status === 'available'
                      ? 'bg-[#ef6751] hover:bg-[#d3513e] text-white shadow-lg shadow-[#ef6751]/20 hover:shadow-[#ef6751]/30'
                      : 'bg-[#f0b8a8]/20 dark:bg-[#344840]/20 text-[#8b5e4d] dark:text-[#a8cbb8] cursor-not-allowed'
                  }`}
                >
                  {resource.status === 'available' ? (
                    <>
                      Book Now
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </>
                  ) : (
                    resource.status === 'maintenance' ? 'Under Maintenance' : 'Already Booked'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Booking Modal */}
      {bookingModal.show && bookingModal.resource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#26352f] rounded-3xl max-w-lg w-full shadow-2xl animate-slide-in-up">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-[#703e2d] dark:text-[#e8f2ea]">Book Resource</h3>
                <button
                  onClick={() => setBookingModal({ show: false })}
                  className="text-[#8b5e4d] dark:text-[#a8cbb8] hover:text-[#ef6751] transition-colors"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="mb-6 p-4 bg-[#f0b8a8]/20 dark:bg-[#344840]/30 rounded-xl">
                <h4 className="font-bold text-[#703e2d] dark:text-[#e8f2ea] mb-1">{bookingModal.resource.name}</h4>
                <p className="text-[#8b5e4d] dark:text-[#a8cbb8] text-sm">{bookingModal.resource.category}</p>
              </div>

              <form onSubmit={handleSubmitBooking} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-[#703e2d] dark:text-[#e8f2ea] mb-2">Select Date</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-[#f8f0e8] dark:bg-[#1e2a25] border border-[#f0b8a8] dark:border-[#344840] text-[#703e2d] dark:text-[#e8f2ea] focus:ring-2 focus:ring-[#ef6751] focus:border-transparent outline-none transition-all"
                    value={bookingDetails.date}
                    onChange={(e) => setBookingDetails({ ...bookingDetails, date: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#703e2d] dark:text-[#e8f2ea] mb-2">Select Time</label>
                  <select
                    required
                    className="w-full px-4 py-3 rounded-xl bg-[#f8f0e8] dark:bg-[#1e2a25] border border-[#f0b8a8] dark:border-[#344840] text-[#703e2d] dark:text-[#e8f2ea] focus:ring-2 focus:ring-[#ef6751] focus:border-transparent outline-none transition-all"
                    value={bookingDetails.time}
                    onChange={(e) => setBookingDetails({ ...bookingDetails, time: e.target.value })}
                  >
                    <option value="">Choose a time slot...</option>
                    {bookingModal.resource.availability.map((time, idx) => (
                      <option key={idx} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#703e2d] dark:text-[#e8f2ea] mb-2">Duration (hours)</label>
                  <select
                    required
                    className="w-full px-4 py-3 rounded-xl bg-[#f8f0e8] dark:bg-[#1e2a25] border border-[#f0b8a8] dark:border-[#344840] text-[#703e2d] dark:text-[#e8f2ea] focus:ring-2 focus:ring-[#ef6751] focus:border-transparent outline-none transition-all"
                    value={bookingDetails.duration}
                    onChange={(e) => setBookingDetails({ ...bookingDetails, duration: e.target.value })}
                  >
                    {[1, 2, 3, 4, 5, 6].map((h) => (
                      <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#f0b8a8]/30 dark:border-[#344840]/30">
                  <div className="text-sm text-[#8b5e4d] dark:text-[#a8cbb8]">
                    Total: <span className="font-bold text-[#ef6751]">
                      ${(Number(bookingModal.resource.price.replace('$', '').replace('/hour', '')) * Number(bookingDetails.duration)).toFixed(2)}
                    </span>
                  </div>
                  <button
                    type="submit"
                    disabled={isBooking}
                    className="px-8 py-3 bg-[#ef6751] hover:bg-[#d3513e] text-white font-bold rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isBooking ? 'Booking...' : 'Confirm Booking'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
