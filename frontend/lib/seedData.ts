// Seed data for DBMS Booking System
// Compatible with backend schema for users, physical_resources, and bookings tables

export interface User {
  user_id: number;
  full_name: string;
  email: string;
  role_id: number;
  department: string;
  created_at: string;
}

export interface PhysicalResource {
  resource_id: number;
  resource_name: string;
  resource_type: string;
  capacity: number;
  location: string;
  status: string;
  created_at: string;
}

export interface Booking {
  booking_id: number;
  user_id: number;
  resource_id: number;
  start_time: string;
  end_time: string;
  booking_status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  purpose: string;
  created_at: string;
}

// Sample Users (roles: student=1, faculty=2, admin=3)
export const users: User[] = [
  {
    user_id: 1,
    full_name: "Alice Johnson",
    email: "alice.johnson@university.edu",
    role_id: 1,
    department: "Computer Science",
    created_at: "2025-09-01T08:00:00Z"
  },
  {
    user_id: 2,
    full_name: "Dr. Robert Smith",
    email: "robert.smith@university.edu",
    role_id: 2,
    department: "Physics",
    created_at: "2025-08-15T09:30:00Z"
  },
  {
    user_id: 3,
    full_name: "Emily Davis",
    email: "emily.davis@university.edu",
    role_id: 1,
    department: "Mathematics",
    created_at: "2025-09-10T10:15:00Z"
  },
  {
    user_id: 4,
    full_name: "Dr. Michael Chen",
    email: "michael.chen@university.edu",
    role_id: 2,
    department: "Computer Science",
    created_at: "2025-07-20T14:00:00Z"
  },
  {
    user_id: 5,
    full_name: "Sarah Wilson",
    email: "sarah.wilson@university.edu",
    role_id: 3,
    department: "Administration",
    created_at: "2025-06-01T08:30:00Z"
  },
  {
    user_id: 6,
    full_name: "David Brown",
    email: "david.brown@university.edu",
    role_id: 1,
    department: "Chemistry",
    created_at: "2025-09-05T11:45:00Z"
  }
];

// Sample Physical Resources (labs, classrooms, etc.)
export const physicalResources: PhysicalResource[] = [
  {
    resource_id: 1,
    resource_name: "Computer Lab A",
    resource_type: "computer_lab",
    capacity: 30,
    location: "Engineering Building, Room 101",
    status: "available",
    created_at: "2025-01-15T09:00:00Z"
  },
  {
    resource_id: 2,
    resource_name: "Physics Lab 1",
    resource_type: "science_lab",
    capacity: 25,
    location: "Science Block, Room 205",
    status: "available",
    created_at: "2025-01-15T09:00:00Z"
  },
  {
    resource_id: 3,
    resource_name: "Lecture Hall 1",
    resource_type: "lecture_hall",
    capacity: 100,
    location: "Main Building, Ground Floor",
    status: "available",
    created_at: "2025-01-15T09:00:00Z"
  },
  {
    resource_id: 4,
    resource_name: "Chemistry Lab A",
    resource_type: "science_lab",
    capacity: 20,
    location: "Science Block, Room 301",
    status: "available",
    created_at: "2025-01-15T09:00:00Z"
  },
  {
    resource_id: 5,
    resource_name: "Mathematics Room",
    resource_type: "classroom",
    capacity: 40,
    location: "Mathematics Building, Room 102",
    status: "available",
    created_at: "2025-01-15T09:00:00Z"
  },
  {
    resource_id: 6,
    resource_name: "Seminar Room B",
    resource_type: "seminar_room",
    capacity: 15,
    location: "Research Block, Room 210",
    status: "available",
    created_at: "2025-01-15T09:00:00Z"
  },
  {
    resource_id: 7,
    resource_name: "Computer Lab B",
    resource_type: "computer_lab",
    capacity: 28,
    location: "Engineering Building, Room 105",
    status: "available",
    created_at: "2025-01-15T09:00:00Z"
  },
  {
    resource_id: 8,
    resource_name: "Auditorium",
    resource_type: "auditorium",
    capacity: 200,
    location: "Main Building, First Floor",
    status: "available",
    created_at: "2025-01-15T09:00:00Z"
  }
];

// Sample Bookings with various statuses
export const bookings: Booking[] = [
  // Pending bookings
  {
    booking_id: 1,
    user_id: 1,
    resource_id: 1,
    start_time: "2026-04-20T09:00:00Z",
    end_time: "2026-04-20T11:00:00Z",
    booking_status: "pending",
    purpose: "Final project demonstration for Software Engineering course",
    created_at: "2026-04-14T10:00:00Z"
  },
  {
    booking_id: 2,
    user_id: 3,
    resource_id: 5,
    start_time: "2026-04-22T14:00:00Z",
    end_time: "2026-04-22T16:00:00Z",
    booking_status: "pending",
    purpose: "Study group session for Advanced Mathematics",
    created_at: "2026-04-14T11:30:00Z"
  },
  {
    booking_id: 3,
    user_id: 6,
    resource_id: 4,
    start_time: "2026-04-25T10:00:00Z",
    end_time: "2026-04-25T13:00:00Z",
    booking_status: "pending",
    purpose: "Organic chemistry lab practice",
    created_at: "2026-04-14T14:00:00Z"
  },

  // Approved bookings
  {
    booking_id: 4,
    user_id: 2,
    resource_id: 2,
    start_time: "2026-04-15T09:00:00Z",
    end_time: "2026-04-15T12:00:00Z",
    booking_status: "approved",
    purpose: "Quantum Mechanics practical examination",
    created_at: "2026-04-01T09:00:00Z"
  },
  {
    booking_id: 5,
    user_id: 2,
    resource_id: 3,
    start_time: "2026-04-16T10:00:00Z",
    end_time: "2026-04-16T12:00:00Z",
    booking_status: "approved",
    purpose: "Thermodynamics lecture",
    created_at: "2026-04-02T10:00:00Z"
  },
  {
    booking_id: 6,
    user_id: 4,
    resource_id: 1,
    start_time: "2026-04-17T14:00:00Z",
    end_time: "2026-04-17T16:00:00Z",
    booking_status: "approved",
    purpose: "Database Management Systems lab session",
    created_at: "2026-04-05T14:00:00Z"
  },
  {
    booking_id: 7,
    user_id: 6,
    resource_id: 4,
    start_time: "2026-04-18T09:00:00Z",
    end_time: "2026-04-18T12:00:00Z",
    booking_status: "approved",
    purpose: "Analytical chemistry practical",
    created_at: "2026-04-10T09:00:00Z"
  },

  // Rejected bookings
  {
    booking_id: 8,
    user_id: 1,
    resource_id: 7,
    start_time: "2026-04-12T09:00:00Z",
    end_time: "2026-04-12T11:00:00Z",
    booking_status: "rejected",
    purpose: "Game development workshop",
    created_at: "2026-04-01T08:00:00Z"
  },
  {
    booking_id: 9,
    user_id: 3,
    resource_id: 3,
    start_time: "2026-04-13T08:00:00Z",
    end_time: "2026-04-13T10:00:00Z",
    booking_status: "rejected",
    purpose: "Student party",
    created_at: "2026-04-05T08:00:00Z"
  },

  // Cancelled bookings
  {
    booking_id: 10,
    user_id: 4,
    resource_id: 6,
    start_time: "2026-04-10T14:00:00Z",
    end_time: "2026-04-10T16:00:00Z",
    booking_status: "cancelled",
    purpose: "Algorithm design workshop",
    created_at: "2026-04-01T14:00:00Z"
  },
  {
    booking_id: 11,
    user_id: 2,
    resource_id: 8,
    start_time: "2026-04-11T10:00:00Z",
    end_time: "2026-04-11T12:00:00Z",
    booking_status: "cancelled",
    purpose: "Physics department meeting",
    created_at: "2026-04-01T10:00:00Z"
  }
];
