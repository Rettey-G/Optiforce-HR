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

// Mock data for recent activities
const mockRecentActivities = [
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

// Mock data for employees
const mockEmployees = [
    { 'EMP NO': 'FEM001', 'Employee Name': 'Ahmed Sinaz', 'Designation': 'Managing Director', 'Department': 'Admin', 'Worksite': 'Office', 'JoinDate': '2020-01-01', 'Manager': '', 'Salary': 1000, 'Status': 'Active', 'Email': 'ahmed.sinaz@optiforce.com', 'Phone': '9991960' },
    { 'EMP NO': 'FEM002', 'Employee Name': 'Hussain Rasheed', 'Designation': 'Operations Manager', 'Department': 'Operations', 'Worksite': 'Office', 'JoinDate': '2020-02-15', 'Manager': 'FEM001', 'Salary': 800, 'Status': 'Active', 'Email': 'hussain.rasheed@optiforce.com', 'Phone': '7908523' },
    { 'EMP NO': 'FEM003', 'Employee Name': 'Mohamed Naseer', 'Designation': 'Accountant', 'Department': 'Finance', 'Worksite': 'Office', 'JoinDate': '2020-03-10', 'Manager': 'FEM001', 'Salary': 750, 'Status': 'Active', 'Email': 'mohamed.naseer@optiforce.com', 'Phone': '7782095' },
    { 'EMP NO': 'FEM004', 'Employee Name': 'Fathimath Shamma', 'Designation': 'HR Officer', 'Department': 'HR', 'Worksite': 'Office', 'JoinDate': '2020-04-05', 'Manager': 'FEM001', 'Salary': 700, 'Status': 'Active', 'Email': 'fathimath.shamma@optiforce.com', 'Phone': '7865432' },
    { 'EMP NO': 'FEM005', 'Employee Name': 'Aishath Raufa', 'Designation': 'Admin Assistant', 'Department': 'Admin', 'Worksite': 'Office', 'JoinDate': '2020-05-20', 'Manager': 'FEM001', 'Salary': 650, 'Status': 'Active', 'Email': 'aishath.raufa@optiforce.com', 'Phone': '7908765' },
    { 'EMP NO': 'FEM006', 'Employee Name': 'Ibrahim Manik', 'Designation': 'Driver', 'Department': 'Operations', 'Worksite': 'Bowser', 'JoinDate': '2021-01-10', 'Manager': 'FEM002', 'Salary': 500, 'Status': 'Active', 'Email': 'ibrahim.manik@optiforce.com', 'Phone': '7654321' },
    { 'EMP NO': 'FEM007', 'Employee Name': 'Ali Rasheed', 'Designation': 'Driver', 'Department': 'Operations', 'Worksite': 'Bowser', 'JoinDate': '2021-02-15', 'Manager': 'FEM002', 'Salary': 500, 'Status': 'Active', 'Email': 'ali.rasheed@optiforce.com', 'Phone': '7908111' },
    { 'EMP NO': 'FEM008', 'Employee Name': 'Mohamed Zahir', 'Designation': 'Driver', 'Department': 'Operations', 'Worksite': 'Bowser', 'JoinDate': '2021-01-11', 'Manager': 'FEM002', 'Salary': 500, 'Status': 'Active', 'Email': 'mohamed.zahir@optiforce.com', 'Phone': '7706226' },
    { 'EMP NO': 'FEM009', 'Employee Name': 'Abdul Kalam Azad', 'Designation': 'Driver', 'Department': 'Operations', 'Worksite': 'Bowser', 'JoinDate': '2022-10-18', 'Manager': 'FEM002', 'Salary': 500, 'Status': 'Active', 'Email': 'abdul.kalam@optiforce.com', 'Phone': '9141139' },
    { 'EMP NO': 'FEM010', 'Employee Name': 'Dinahar Jojo Trimothy', 'Designation': 'Driver', 'Department': 'Operations', 'Worksite': 'Bowser', 'JoinDate': '2022-05-16', 'Manager': 'FEM002', 'Salary': 500, 'Status': 'Active', 'Email': 'dinahar.jojo@optiforce.com', 'Phone': '9651444' },
    { 'EMP NO': 'FEM012', 'Employee Name': 'Md Rubel', 'Designation': 'Driver', 'Department': 'Operations', 'Worksite': 'Bowser', 'JoinDate': '2022-05-16', 'Manager': 'FEM002', 'Salary': 500, 'Status': 'Active', 'Email': 'md.rubel@optiforce.com', 'Phone': '7867564' },
    { 'EMP NO': 'FEM013', 'Employee Name': 'Md Shahin Alam', 'Designation': 'Driver', 'Department': 'Operations', 'Worksite': 'Bowser', 'JoinDate': '2022-11-01', 'Manager': 'FEM002', 'Salary': 500, 'Status': 'Active', 'Email': 'md.shahin@optiforce.com', 'Phone': '7989765' },
    { 'EMP NO': 'FEM014', 'Employee Name': 'Md Shamim Hossain', 'Designation': 'Driver', 'Department': 'Operations', 'Worksite': 'Bowser', 'JoinDate': '2022-11-01', 'Manager': 'FEM002', 'Salary': 500, 'Status': 'Active', 'Email': 'md.shamim@optiforce.com', 'Phone': '7654987' },
    { 'EMP NO': 'FEM015', 'Employee Name': 'Md Harun', 'Designation': 'Driver', 'Department': 'Operations', 'Worksite': 'Bowser', 'JoinDate': '2022-11-01', 'Manager': 'FEM002', 'Salary': 500, 'Status': 'Active', 'Email': 'md.harun@optiforce.com', 'Phone': '7908000' },
    { 'EMP NO': 'FEM016', 'Employee Name': 'Md Shahjahan', 'Designation': 'Driver', 'Department': 'Operations', 'Worksite': 'Bowser', 'JoinDate': '2022-11-01', 'Manager': 'FEM002', 'Salary': 500, 'Status': 'Active', 'Email': 'md.shahjahan@optiforce.com', 'Phone': '7908999' }
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

// Hard-coded worksites data
mockDashboardStats.worksites = [
    { id: 1, name: 'Office', location: 'Main Office' },
    { id: 2, name: 'Bowser', location: 'Fuel Delivery' }
];

// Mock recent activities
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

// API endpoint mapping
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
