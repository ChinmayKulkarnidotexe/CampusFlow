'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/authContext';
import { PhysicalResource, resourceApi } from '@/app/lib/api';

const mapResourceTypeToCategory = (resourceType: string): string => {
  const typeMap: Record<string, string> = {
    computer_lab: 'Laboratory',
    science_lab: 'Laboratory',
    laboratory: 'Laboratory',
    lecture_hall: 'Classroom',
    classroom: 'Classroom',
    seminar_room: 'Classroom',
    auditorium: 'Classroom',
    equipment: 'Equipment',
  };
  return typeMap[resourceType] || 'Classroom';
};

export default function ResourcesPage() {
  const { isAuthenticated } = useAuth();
  const [activeCategory, setActiveCategory] = useState('All');
  const [resources, setResources] = useState<PhysicalResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await resourceApi.listResources();
        setResources(data.resources || []);
      } catch (err: any) {
        setError('Failed to load resources. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  const filteredResources = activeCategory === 'All'
    ? resources
    : resources.filter((r) => mapResourceTypeToCategory(r.resource_type) === activeCategory);

  const categories = ['All', 'Laboratory', 'Equipment', 'Classroom'];

  return (
    <div className="min-h-screen font-sans bg-[#f8f0e8] dark:bg-[#1e2a25]">
      <Navbar />

      {/* Header */}
      <header className="bg-[#ef6751] dark:bg-[#26352f] text-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Explore Resources</h1>
              <p className="text-white/90 text-lg">Browse available labs, equipment, and classrooms</p>
            </div>
            <div className="flex items-center gap-4 bg-white/20 dark:bg-black/20 backdrop-blur-md px-6 py-3 rounded-2xl">
              <div className="text-right">
                <div className="text-3xl font-bold">{resources.filter(r => r.status === 'available').length}</div>
                <div className="text-sm opacity-90">Available Resources</div>
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
        {error && (
          <div className="mb-6 p-4 bg-[#D3513E]/10 border border-[#D3513E]/30 rounded-xl">
            <div className="flex items-start gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D3513E" strokeWidth="2" className="mt-1 flex-shrink-0">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div>
                <h4 className="font-bold text-[#D3513E] mb-1">Error</h4>
                <p className="text-[#8b5e4d] dark:text-[#a8cbb8] text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-2xl font-bold text-[#703e2d] dark:text-[#e8f2ea]">All Resources</h2>
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
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ef6751]"></div>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-xl font-bold text-[#703e2d] dark:text-[#e8f2ea] mb-2">No resources found</h3>
            <p className="text-[#8b5e4d] dark:text-[#a8cbb8]">Try adjusting your filter or check back later</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredResources.map((resource) => {
              const category = mapResourceTypeToCategory(resource.resource_type);
              const status = resource.status;

              return (
                <div
                  key={resource.resource_id}
                  className="group bg-white dark:bg-[#26352f] rounded-2xl border border-[#f0b8a8]/40 dark:border-[#344840]/40 overflow-hidden hover:shadow-xl hover:border-[#ef6751]/50 dark:hover:border-[#ef6751]/50 transition-all duration-300"
                >
                  {/* Header */}
                  <div className="p-6 border-b border-[#f0b8a8]/30 dark:border-[#344840]/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        category === 'Laboratory' ? 'bg-[#f0b8a8] text-[#703e2d]' :
                        category === 'Equipment' ? 'bg-[#d3513e]/20 text-[#d3513e]' :
                        'bg-[#344840]/20 text-[#344840]'
                      }`}>
                        {category}
                      </span>
                      <span className={`text-sm font-medium ${
                        status === 'available' ? 'text-[#84AE92]' :
                        status === 'maintenance' ? 'text-[#d3513e]' : 'text-[#8b5e4d]'
                      }`}>
                        {status === 'available' ? 'Available' : status === 'maintenance' ? 'Maintenance' : 'Booked'}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-[#703e2d] dark:text-[#e8f2ea] mb-1">{resource.resource_name}</h3>
                    <p className="text-[#8b5e4d] dark:text-[#a8cbb8] text-sm">{resource.capacity} capacity • {resource.location}</p>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#8b5e4d] dark:text-[#a8cbb8] mb-2">Facilities</h4>
                      <div className="flex flex-wrap gap-2">
                        {resource.has_projector && <span className="px-2 py-1 bg-[#f0b8a8]/20 dark:bg-[#344840]/30 text-[#8b5e4d] dark:text-[#a8cbb8] text-xs rounded">Projector</span>}
                        {resource.has_ac && <span className="px-2 py-1 bg-[#f0b8a8]/20 dark:bg-[#344840]/30 text-[#8b5e4d] dark:text-[#a8cbb8] text-xs rounded">AC</span>}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#8b5e4d] dark:text-[#a8cbb8] mb-2">Status</h4>
                      <div className="text-sm text-[#703e2d] dark:text-[#e8f2ea]">
                        {resource.status === 'available' ? 'Ready for booking' : resource.status}
                      </div>
                    </div>

                    {status === 'available' ? (
                      <Link
                        href={isAuthenticated ? '/dashboard' : '/auth/signin'}
                        className="w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 bg-[#ef6751] hover:bg-[#d3513e] text-white shadow-lg shadow-[#ef6751]/20 hover:shadow-[#ef6751]/30"
                      >
                        Book Now
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                      </Link>
                    ) : (
                      <div className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 bg-[#f0b8a8]/20 dark:bg-[#344840]/20 text-[#8b5e4d] dark:text-[#a8cbb8] cursor-not-allowed">
                        {status === 'maintenance' ? 'Under Maintenance' : 'Already Booked'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
