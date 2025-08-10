export type DepartmentType = 'Engineering' | 'Science' | 'Arts' | 'Administration' | 'Other';

export interface FacilityItem {
  name: string;
  available: boolean;
  image_url?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  lat: number;
  lng: number;
  type: DepartmentType;
  facilities: FacilityItem[];
  image_urls: string[];
  faculty_count: number;
}

export interface StaffMember {
  id: string;
  department_id: string;
  name: string;
  designation: string;
  qualification: string;
  email: string;
  photo_url?: string;
}

// --- Mock Data (replace with Supabase later) ---
const center = { lat: 11.2749, lng: 77.6099 };

const createDept = (
  id: number,
  name: string,
  code: string,
  dx: number,
  dy: number,
  type: DepartmentType,
): Department => ({
  id: String(id),
  name,
  code,
  description: `${name} offering programs and research opportunities.`,
  lat: center.lat + dx,
  lng: center.lng + dy,
  type,
  facilities: [
    { name: 'Seminar Hall', available: true },
    { name: 'Conference Hall', available: id % 2 === 0 },
    { name: 'Library Section', available: id % 3 !== 0 },
  ],
  image_urls: [
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?q=80&w=1600&auto=format&fit=crop',
  ],
  faculty_count: 10 + (id % 5),
});

const departments: Department[] = [
  createDept(1, 'CTUG Block', 'CTUG', 0.0012, 0.001, 'Engineering'),
  createDept(2, 'IT Block', 'IT', 0.0002, -0.0006, 'Engineering'),
  createDept(3, 'Science & Humanities', 'SH', -0.0006, 0.0008, 'Science'),
  createDept(4, 'MBA Block', 'MBA', 0.0016, -0.0002, 'Arts'),
  createDept(5, 'Admin Block', 'ADMIN', -0.0002, -0.0005, 'Administration'),
  createDept(6, 'Mechanical Dept', 'MECH', -0.001, -0.0001, 'Engineering'),
  createDept(7, 'Civil Dept', 'CIV', 0.0007, -0.001, 'Engineering'),
];

const randomName = (i: number) => `Dr. ${['A.', 'S.', 'K.', 'M.', 'L.'][i % 5]} ${['Kumar', 'Priya', 'Anand', 'Selvi', 'Rao'][i % 5]}`;

const staffCache = new Map<string, StaffMember[]>();

function generateStaffForDepartment(deptId: string, deptName: string): StaffMember[] {
  const list: StaffMember[] = Array.from({ length: 10 }, (_, i) => ({
    id: `${deptId}-${i + 1}`,
    department_id: deptId,
    name: randomName(i),
    designation: i === 0 ? 'HOD' : i < 3 ? 'Associate Professor' : 'Assistant Professor',
    qualification: ['Ph.D', 'M.E', 'M.Tech', 'M.S', 'B.E'][i % 5],
    email: `faculty${i + 1}@college.edu`,
    photo_url: `https://i.pravatar.cc/96?img=${(i % 70) + 1}`,
  }));
  return list;
}

export async function getDepartments(): Promise<Department[]> {
  // Placeholder async to match future Supabase call
  return Promise.resolve(departments);
}

export async function getDepartmentStaff(departmentId: string): Promise<StaffMember[]> {
  if (!staffCache.has(departmentId)) {
    const dept = departments.find(d => d.id === departmentId);
    staffCache.set(departmentId, generateStaffForDepartment(departmentId, dept?.name || 'Department'));
  }
  return Promise.resolve(staffCache.get(departmentId)!);
}
