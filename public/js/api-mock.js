/**
 * API Mock Service
 * This file provides mock data for API endpoints when deployed to static hosting
 */

// Helper function to handle API calls with fallback mock data
function fetchWithMockFallback(url, options, mockData) {
    // In static deployment, immediately return mock data without attempting real fetch
    if (window.location.hostname === 'opitiforcepro.netlify.app' || 
        window.location.hostname === 'optiforce-hr-dashboard.windsurf.build' ||
        window.location.hostname.includes('netlify') ||
        window.location.hostname.includes('windsurf')) {
        console.log(`Static deployment detected, using mock data for ${url}`);
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockData)
        });
    }
    
    // For local development, try real fetch first
    return fetch(url, options)
        .then(response => {
            if (!response.ok) {
                console.log(`API endpoint ${url} not available, using mock data`);
                // If API doesn't exist, use mock data
                return {
                    ok: true,
                    json: () => Promise.resolve(mockData)
                };
            }
            return response;
        })
        .catch(error => {
            console.log(`Fetch error for ${url}, using mock data:`, error);
            return {
                ok: true,
                json: () => Promise.resolve(mockData)
            };
        });
}

// Dashboard stats will be generated dynamically from employee data ONLY.


// Mock data for recent activities - initial declaration
let mockRecentActivities = [
    { id: 1, username: 'admin', action: 'CREATE', description: 'created a new employee record', timestamp: new Date(2025, 3, 23, 15, 30, 0).toISOString() },
    { id: 2, username: 'admin', action: 'UPDATE', description: 'updated department structure', timestamp: new Date(2025, 3, 23, 14, 45, 0).toISOString() },
    { id: 3, username: 'user1', action: 'LOGIN', description: 'logged into the system', timestamp: new Date(2025, 3, 23, 14, 30, 0).toISOString() },
    { id: 4, username: 'admin', action: 'DELETE', description: 'removed an inactive user account', timestamp: new Date(2025, 3, 23, 13, 15, 0).toISOString() },
    { id: 5, username: 'user2', action: 'VIEW', description: 'viewed employee records', timestamp: new Date(2025, 3, 23, 12, 0, 0).toISOString() },
    { id: 6, username: 'admin', action: 'UPDATE', description: 'updated company policies', timestamp: new Date(2025, 3, 22, 16, 45, 0).toISOString() }
];

// Mock data for users
const mockUsers = [
    { id: 1, username: 'admin', role: 'admin', lastLogin: new Date(2025, 3, 23, 9, 0, 0).toISOString() },
    { id: 2, username: 'john.doe', role: 'user', lastLogin: new Date(2025, 3, 22, 14, 30, 0).toISOString() },
    { id: 3, username: 'jane.smith', role: 'user', lastLogin: new Date(2025, 3, 21, 11, 15, 0).toISOString() },
    { id: 4, username: 'manager1', role: 'manager', lastLogin: new Date(2025, 3, 20, 16, 45, 0).toISOString() },
    { id: 5, username: 'hr.admin', role: 'admin', lastLogin: new Date(2025, 3, 19, 10, 30, 0).toISOString() }
];

// Dynamically loaded employee data
let dynamicEmployees = [];
let employeesLoaded = false;

async function loadEmployees() {
    if (employeesLoaded) return dynamicEmployees;
    try {
        const res = await fetch('/data/employees.json');
        if (!res.ok) throw new Error('Failed to load employees.json');
        dynamicEmployees = await res.json();
        employeesLoaded = true;
        return dynamicEmployees;
    } catch (e) {
        console.error('Error loading employees.json:', e);
        dynamicEmployees = [];
        employeesLoaded = true;
        return dynamicEmployees;
    }
}

// Mock leave applications
const mockLeaveApplications = [
    { id: 1, employeeId: 'FEM004', employeeName: 'Fathimath Shamma', leaveType: 'Annual', startDate: '2025-05-01', endDate: '2025-05-05', days: 5, reason: 'Family vacation', status: 'Approved', appliedDate: '2025-04-15' },
    { id: 2, employeeId: 'FEM006', employeeName: 'Ibrahim Manik', leaveType: 'Sick', startDate: '2025-04-28', endDate: '2025-04-29', days: 2, reason: 'Not feeling well', status: 'Pending', appliedDate: '2025-04-27' },
    { id: 3, employeeId: 'FEM005', employeeName: 'Aishath Raufa', leaveType: 'Annual', startDate: '2025-06-10', endDate: '2025-06-15', days: 6, reason: 'Personal', status: 'Pending', appliedDate: '2025-04-20' },
    { id: 4, employeeId: 'FEM008', employeeName: 'Mohamed Zahir', leaveType: 'Casual', startDate: '2025-05-12', endDate: '2025-05-12', days: 1, reason: 'Family event', status: 'Approved', appliedDate: '2025-05-05' },
    { id: 5, employeeId: 'FEM003', employeeName: 'Mohamed Naseer', leaveType: 'Sick', startDate: '2025-04-18', endDate: '2025-04-19', days: 2, reason: 'Fever', status: 'Rejected', appliedDate: '2025-04-18' }
];

// Mock payroll data
// Generate payroll data dynamically from employees
async function getPayrollData() {
    const employees = await loadEmployees();
    return employees.map(emp => ({
        employeeId: emp['EMP NO'],
        employeeName: emp['Employee Name'],
        department: emp.Department,
        designation: emp.Designation,
        basicSalary: emp.Salary,
        allowances: Math.floor(emp.Salary * 0.2),
        deductions: Math.floor(emp.Salary * 0.05),
        netSalary: Math.floor(emp.Salary * 1.15),
        paymentDate: '2025-04-01',
        paymentStatus: 'Paid'
    }));
}

// Mock trainings data
const mockTrainings = [
    { id: 1, title: 'Safety Training', description: 'Basic safety procedures', startDate: '2025-05-15', endDate: '2025-05-16', department: 'Operations', trainer: 'External Trainer', status: 'Scheduled' },
    { id: 2, title: 'Customer Service', description: 'Improving customer interactions', startDate: '2025-06-10', endDate: '2025-06-11', department: 'Admin', trainer: 'Ahmed Sinaz', status: 'Scheduled' },
    { id: 3, title: 'Financial Reporting', description: 'New accounting procedures', startDate: '2025-04-05', endDate: '2025-04-06', department: 'Finance', trainer: 'Mohamed Naseer', status: 'Completed' }
];

// Mock trainers data
const mockTrainers = [
    { id: 1, name: 'Ahmed Sinaz', specialization: 'Management', contact: '9991960', email: 'ahmed.sinaz@optiforce.com' },
    { id: 2, name: 'Mohamed Naseer', specialization: 'Finance', contact: '7782095', email: 'mohamed.naseer@optiforce.com' },
    { id: 3, name: 'External Trainer', specialization: 'Safety', contact: '7777777', email: 'trainer@safetyorg.com' }
];

console.log('All mock data initialized successfully');

// Define API endpoints before they're used in fetchApi
const apiEndpoints = {
    '/api/dashboard/stats': async () => {
        const employees = await loadEmployees();
        // Calculate stats dynamically from employees
        // Build department distribution and unique department array from actual data
        const allDepartments = employees.map(emp => emp.Department || emp.department || emp.departmentName || '').map(d => d && d.trim()).filter(Boolean).filter(d => d.toLowerCase() !== 'o');
        const departmentCounts = allDepartments.reduce((acc, d) => {
            acc[d] = (acc[d] || 0) + 1;
            return acc;
        }, {});
        const departments = Object.keys(departmentCounts);
        // Normalize worksite property for all employees
        function getWorksite(emp) {
            return (
                emp['Work Site'] ||
                emp.workSite ||
                emp.worksite ||
                emp.worksiteName ||
                ''
            ).toString().trim();
        }
        const allWorksites = employees.map(getWorksite).filter(Boolean).filter(w => w.toLowerCase() !== 'o');
        const worksiteCounts = allWorksites.reduce((acc, w) => {
            acc[w] = (acc[w] || 0) + 1;
            return acc;
        }, {});
        const worksites = Object.keys(worksiteCounts);
        const deptDist = departments.map(name => ({
            name,
            count: departmentCounts[name] || 0
        }));
        const worksiteDist = worksites.map(name => ({
            name,
            count: worksiteCounts[name] || 0
        }));
        const nationalityDist = [...new Set(employees.map(emp => emp.Nationality || emp.nationality || ''))].filter(Boolean).map(name => ({ name, count: employees.filter(e => (e.Nationality || e.nationality) === name).length }));
        return {
            totalEmployees: employees.length,
            departments,
            worksites,
            departmentDistribution: deptDist,
            worksiteDistribution: worksiteDist,
            byNationality: nationalityDist
        };
    },
    '/api/dashboard/recent-activities': { recent: mockRecentActivities },
    '/api/users': mockUsers,
    '/api/employees': async () => await loadEmployees(),
    '/api/departments': async () => {
        const employees = await loadEmployees();
        return [...new Set(employees.map(emp => emp.Department || emp.department || ''))].filter(Boolean);
    },
    '/api/worksites': async () => {
        const employees = await loadEmployees();
        return [...new Set(employees.map(emp => emp['Work Site'] || emp.workSite || emp.worksite || ''))].filter(Boolean);
    },
    '/api/employees/names': async () => {
        const employees = await loadEmployees();
        return employees.map(emp => ({ id: emp['EMP NO'], name: emp['Employee Name'] }));
    },
    '/api/leave/applications': mockLeaveApplications,
    '/api/payroll/data': async () => await getPayrollData(),
    '/api/trainings': mockTrainings,
    '/api/trainers': mockTrainers
};

// Generic API fetch function
async function fetchApi(endpoint, options = {}) {
    // Find the matching mock data for this endpoint
    let mockData = {};
    
    // Check for exact endpoint match
    if (apiEndpoints[endpoint]) {
        mockData = apiEndpoints[endpoint];
        // If the endpoint is an async function, call it
        if (typeof mockData === 'function') {
            mockData = await mockData();
        }
    } else {
        // Check for pattern matches (e.g., /api/employees/123 should match /api/employees/:id)
        for (const key in apiEndpoints) {
            // Convert endpoint patterns like '/api/employees/:id' to regex
            const pattern = key.replace(/:\w+/g, '[^/]+');
            const regex = new RegExp(`^${pattern}$`);
            
            if (regex.test(endpoint)) {
                mockData = apiEndpoints[key];
                if (typeof mockData === 'function') {
                    mockData = await mockData();
                }
                break;
            }
        }
    }
    
    // Dynamically serve employee and dashboard data
    if (endpoint === '/api/employees') {
        const employees = await loadEmployees();
        return fetchWithMockFallback(endpoint, options, employees);
    }
    if (endpoint === '/api/employees/names') {
        const employees = await loadEmployees();
        const names = employees.map(emp => ({ id: emp.employeeNumber || emp['EMP NO'] || emp.id, name: emp.name || emp['Employee Name'] }));
        return fetchWithMockFallback(endpoint, options, names);
    }
    if (endpoint === '/api/dashboard/stats') {
        const employees = await loadEmployees();
        // Calculate stats dynamically
        const departments = [...new Set(employees.map(e => e.department || e['Department']))].filter(Boolean);
        const worksites = [...new Set(employees.map(e => e.workSite || e['Work Site'] || e.worksite))].filter(Boolean);
        const nationalities = [...new Set(employees.map(e => e.nationality || e['Nationality']))].filter(Boolean);
        // Department distribution
        const deptDist = departments.map(dept => ({ name: dept, count: employees.filter(e => (e.department || e['Department']) === dept).length }));
        // Worksite distribution
        const worksiteDist = worksites.map(ws => ({ worksite: ws, count: employees.filter(e => (e.workSite || e['Work Site'] || e.worksite) === ws).length }));
        // Nationality distribution
        const nationalityDist = nationalities.map(nat => ({ name: nat, count: employees.filter(e => (e.nationality || e['Nationality']) === nat).length }));
        const stats = {
            totalEmployees: employees.length,
            departments: departments.map((name, i) => ({ id: i+1, name })),
            worksites: worksites.map((name, i) => ({ id: i+1, name })),
            departmentDistribution: deptDist,
            worksiteDistribution: worksiteDist,
            byNationality: nationalityDist
        };
        return fetchWithMockFallback(endpoint, options, stats);
    }
    // Fallback to old logic for other endpoints
    if (!mockData || Object.keys(mockData).length === 0) {
        mockData = endpoint.includes('dashboard') ? { stats: {}, recent: [] } : [];
    }
    return fetchWithMockFallback(endpoint, options, mockData);
}
