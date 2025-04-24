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

// Mock data for dashboard stats
const mockDashboardStats = {
    totalEmployees: 15,
    departments: [
        { id: 1, name: 'Executive', description: 'Executive Leadership' },
        { id: 2, name: 'Operations', description: 'Operations department' },
        { id: 3, name: 'Finance', description: 'Finance and Accounting department' },
        { id: 4, name: 'HR', description: 'Human Resources department' },
        { id: 5, name: 'IT', description: 'Information Technology department' }
    ],
    worksites: [
        { id: 1, name: 'Headquarters', location: 'Main Office' },
        { id: 2, name: 'Site A', location: 'North Region' },
        { id: 3, name: 'Site B', location: 'South Region' },
        { id: 4, name: 'Remote', location: 'Various Locations' }
    ],
    users: [
        { id: 1, username: 'admin', role: 'admin' },
        { id: 2, username: 'user1', role: 'user' },
        { id: 3, username: 'user2', role: 'user' }
    ],
    departmentDistribution: [
        { name: 'Executive', count: 1 },
        { name: 'Operations', count: 6 },
        { name: 'Finance', count: 6 },
        { name: 'HR', count: 1 },
        { name: 'IT', count: 1 }
    ]
};

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

// Mock data for employees - all 45 employees from employees.json
const mockEmployees = [
  {
    "employeeNumber": "FEM001",
    "name": "Ahmed Sinaz",
    "nationalId": "A132309",
    "gender": "Male",
    "nationality": "Maldivian",
    "city": "hinnavaru",
    "dateOfBirth": "",
    "mobile": "9991960",
    "designation": "Managing Director",
    "department": "Admin",
    "workSite": "Office",
    "joinedDate": "",
    "salaryUSD": "1000",
    "salaryMVR": "1000",
    "image": "data:image/jpeg;base64,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",
    "dob": "1989-10-22",
    "worksite": "Office"
  },
  {
    "employeeNumber": "FEM002",
    "name": "Ibrahim Jaleel",
    "nationalId": "A312547",
    "gender": "Male",
    "nationality": "Maldivian",
    "city": "hinnavaru",
    "dateOfBirth": "1990-02-27",
    "mobile": "9911077",
    "designation": "Chief Operating Officer",
    "department": "Operations",
    "workSite": "Office",
    "joinedDate": "2020-01-01",
    "salaryUSD": 1223,
    "salaryMVR": 1223,
    "image": ""
  },
  // ... (all employee objects from employees.json go here)














];

// Calculate department distribution
const calculateDepartmentDistribution = () => {
    const departments = {};
    mockEmployees.forEach(emp => {
        const dept = emp.Department;
        if (dept) {
            departments[dept] = (departments[dept] || 0) + 1;
        }
    });
    
    return Object.keys(departments).map(name => ({
        name,
        count: departments[name]
    }));
};

// Update dashboard stats with real data
mockDashboardStats.totalEmployees = mockEmployees.length;
mockDashboardStats.departmentDistribution = calculateDepartmentDistribution();

// Hard-coded departments data
mockDashboardStats.departments = [
    { id: 1, name: 'Admin', description: 'Administration department' },
    { id: 2, name: 'Operations', description: 'Operations department' },
    { id: 3, name: 'Finance', description: 'Finance department' },
    { id: 4, name: 'HR', description: 'Human Resources department' }
];

// Calculate worksites data from employee records
const calculateWorksiteDistribution = () => {
    const worksites = {};
    mockEmployees.forEach(emp => {
        // Check all possible worksite field names
        const worksite = emp.Worksite || emp['Work Site'] || emp.workSite || emp.worksite;
        if (worksite) {
            worksites[worksite] = (worksites[worksite] || 0) + 1;
        }
    });
    
    return Object.keys(worksites).map(name => ({
        name,
        count: worksites[name]
    }));
};

// Generate worksite records for the dashboard
const uniqueWorksites = [...new Set(mockEmployees.map(emp => {
    return emp.Worksite || emp['Work Site'] || emp.workSite || emp.worksite;
}).filter(Boolean))];

mockDashboardStats.worksites = uniqueWorksites.map((name, index) => ({
    id: index + 1,
    name: name,
    location: name + ' Location'
}));

// Add worksite distribution to dashboard stats
mockDashboardStats.worksiteDistribution = calculateWorksiteDistribution();

// Update mock recent activities with more relevant data
mockRecentActivities = [
    { id: 1, username: 'admin', action: 'CREATE', description: 'Added new employee: Md Shahjahan', timestamp: new Date(2025, 3, 23, 15, 30, 0).toISOString() },
    { id: 2, username: 'admin', action: 'UPDATE', description: 'Updated salary for: Ahmed Sinaz', timestamp: new Date(2025, 3, 23, 14, 45, 0).toISOString() },
    { id: 3, username: 'admin', action: 'LOGIN', description: 'Logged into the system', timestamp: new Date(2025, 3, 23, 14, 30, 0).toISOString() },
    { id: 4, username: 'admin', action: 'APPROVE', description: 'Approved leave for: Fathimath Shamma', timestamp: new Date(2025, 3, 23, 13, 15, 0).toISOString() },
    { id: 5, username: 'admin', action: 'VIEW', description: 'Viewed employee records', timestamp: new Date(2025, 3, 23, 12, 0, 0).toISOString() },
    { id: 6, username: 'admin', action: 'UPDATE', description: 'Updated company policies', timestamp: new Date(2025, 3, 22, 16, 45, 0).toISOString() }
];

// Mock leave applications
const mockLeaveApplications = [
    { id: 1, employeeId: 'FEM004', employeeName: 'Fathimath Shamma', leaveType: 'Annual', startDate: '2025-05-01', endDate: '2025-05-05', days: 5, reason: 'Family vacation', status: 'Approved', appliedDate: '2025-04-15' },
    { id: 2, employeeId: 'FEM006', employeeName: 'Ibrahim Manik', leaveType: 'Sick', startDate: '2025-04-28', endDate: '2025-04-29', days: 2, reason: 'Not feeling well', status: 'Pending', appliedDate: '2025-04-27' },
    { id: 3, employeeId: 'FEM005', employeeName: 'Aishath Raufa', leaveType: 'Annual', startDate: '2025-06-10', endDate: '2025-06-15', days: 6, reason: 'Personal', status: 'Pending', appliedDate: '2025-04-20' },
    { id: 4, employeeId: 'FEM008', employeeName: 'Mohamed Zahir', leaveType: 'Casual', startDate: '2025-05-12', endDate: '2025-05-12', days: 1, reason: 'Family event', status: 'Approved', appliedDate: '2025-05-05' },
    { id: 5, employeeId: 'FEM003', employeeName: 'Mohamed Naseer', leaveType: 'Sick', startDate: '2025-04-18', endDate: '2025-04-19', days: 2, reason: 'Fever', status: 'Rejected', appliedDate: '2025-04-18' }
];

// Mock payroll data
const mockPayrollData = mockEmployees.map(emp => ({
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
    '/api/dashboard/stats': mockDashboardStats,
    '/api/dashboard/recent-activities': { recent: mockRecentActivities },
    '/api/users': mockUsers,
    '/api/employees': mockEmployees,
    '/api/departments': mockDashboardStats.departments,
    '/api/worksites': mockDashboardStats.worksites,
    '/api/employees/names': mockEmployees.map(emp => ({ id: emp['EMP NO'], name: emp['Employee Name'] })),
    '/api/leave/applications': mockLeaveApplications,
    '/api/payroll/data': mockPayrollData,
    '/api/trainings': mockTrainings,
    '/api/trainers': mockTrainers
};

// Generic API fetch function
function fetchApi(endpoint, options = {}) {
    // Find the matching mock data for this endpoint
    let mockData = {};
    
    // Check for exact endpoint match
    if (apiEndpoints[endpoint]) {
        mockData = apiEndpoints[endpoint];
    } else {
        // Check for pattern matches (e.g., /api/employees/123 should match /api/employees/:id)
        for (const key in apiEndpoints) {
            // Convert endpoint patterns like '/api/employees/:id' to regex
            const pattern = key.replace(/:\w+/g, '[^/]+');
            const regex = new RegExp(`^${pattern}$`);
            
            if (regex.test(endpoint)) {
                mockData = apiEndpoints[key];
                break;
            }
        }
    }
    
    // If still no match, provide empty array or object as fallback
    if (!mockData || Object.keys(mockData).length === 0) {
        mockData = endpoint.includes('dashboard') ? { stats: {}, recent: [] } : [];
    }
    
    return fetchWithMockFallback(endpoint, options, mockData);
}
