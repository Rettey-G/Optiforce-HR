/**
 * API Mock Service
 * This file provides mock data for API endpoints when deployed to static hosting
 */

// Helper function to handle API calls with fallback mock data
function fetchWithMockFallback(url, mockData) {
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                console.log(`API endpoint ${url} not available, using mock data`);
                // If API doesn't exist, use mock data
                return Promise.resolve({
                    json: () => Promise.resolve(mockData)
                });
            }
            return response;
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
    { 'EMP NO': '001', 'Employee Name': 'John Smith', 'Designation': 'CEO', 'Department': 'Executive', 'Worksite': 'Headquarters', 'JoinDate': '2018-01-15', 'Manager': '', 'Salary': 180000, 'Status': 'Active', 'Email': 'john.smith@optiforce.com', 'Phone': '(555) 123-4567' },
    { 'EMP NO': '002', 'Employee Name': 'Sarah Johnson', 'Designation': 'Operations Director', 'Department': 'Operations', 'Worksite': 'Headquarters', 'JoinDate': '2018-03-10', 'Manager': '001', 'Salary': 145000, 'Status': 'Active', 'Email': 'sarah.johnson@optiforce.com', 'Phone': '(555) 234-5678' },
    { 'EMP NO': '003', 'Employee Name': 'Michael Chen', 'Designation': 'Finance Director', 'Department': 'Finance', 'Worksite': 'Headquarters', 'JoinDate': '2018-02-20', 'Manager': '001', 'Salary': 142000, 'Status': 'Active', 'Email': 'michael.chen@optiforce.com', 'Phone': '(555) 345-6789' },
    { 'EMP NO': '004', 'Employee Name': 'Emily Davis', 'Designation': 'Operations Manager', 'Department': 'Operations', 'Worksite': 'Site A', 'JoinDate': '2019-05-12', 'Manager': '002', 'Salary': 110000, 'Status': 'Active', 'Email': 'emily.davis@optiforce.com', 'Phone': '(555) 456-7890' },
    { 'EMP NO': '005', 'Employee Name': 'Robert Wilson', 'Designation': 'Logistics Manager', 'Department': 'Operations', 'Worksite': 'Site B', 'JoinDate': '2019-06-18', 'Manager': '002', 'Salary': 105000, 'Status': 'Active', 'Email': 'robert.wilson@optiforce.com', 'Phone': '(555) 567-8901' },
    { 'EMP NO': '006', 'Employee Name': 'Jessica Lee', 'Designation': 'Accounting Manager', 'Department': 'Finance', 'Worksite': 'Headquarters', 'JoinDate': '2019-04-22', 'Manager': '003', 'Salary': 108000, 'Status': 'Active', 'Email': 'jessica.lee@optiforce.com', 'Phone': '(555) 678-9012' },
    { 'EMP NO': '007', 'Employee Name': 'David Martinez', 'Designation': 'Budget Manager', 'Department': 'Finance', 'Worksite': 'Headquarters', 'JoinDate': '2019-07-15', 'Manager': '003', 'Salary': 106000, 'Status': 'Active', 'Email': 'david.martinez@optiforce.com', 'Phone': '(555) 789-0123' },
    { 'EMP NO': '008', 'Employee Name': 'Amanda Brown', 'Designation': 'Team Lead', 'Department': 'Operations', 'Worksite': 'Site A', 'JoinDate': '2020-01-10', 'Manager': '004', 'Salary': 85000, 'Status': 'Active', 'Email': 'amanda.brown@optiforce.com', 'Phone': '(555) 890-1234' },
    { 'EMP NO': '009', 'Employee Name': 'Kevin Taylor', 'Designation': 'Senior Specialist', 'Department': 'Operations', 'Worksite': 'Site A', 'JoinDate': '2020-03-15', 'Manager': '004', 'Salary': 78000, 'Status': 'Active', 'Email': 'kevin.taylor@optiforce.com', 'Phone': '(555) 901-2345' },
    { 'EMP NO': '010', 'Employee Name': 'Sophia Garcia', 'Designation': 'Specialist', 'Department': 'Operations', 'Worksite': 'Site B', 'JoinDate': '2020-05-20', 'Manager': '005', 'Salary': 72000, 'Status': 'Active', 'Email': 'sophia.garcia@optiforce.com', 'Phone': '(555) 012-3456' }
];

// Mock data for departments
const mockDepartments = [
    { id: 1, name: 'Executive', description: 'Executive Leadership' },
    { id: 2, name: 'Operations', description: 'Operations department' },
    { id: 3, name: 'Finance', description: 'Finance and Accounting department' },
    { id: 4, name: 'HR', description: 'Human Resources department' },
    { id: 5, name: 'IT', description: 'Information Technology department' }
];

// Mock data for worksites
const mockWorksites = [
    { id: 1, name: 'Headquarters', location: 'Main Office' },
    { id: 2, name: 'Site A', location: 'North Region' },
    { id: 3, name: 'Site B', location: 'South Region' },
    { id: 4, name: 'Remote', location: 'Various Locations' }
];

// API endpoint mapping
const apiEndpoints = {
    '/api/dashboard/stats': mockDashboardStats,
    '/api/dashboard/recent-activities': mockRecentActivities,
    '/api/users': mockUsers,
    '/api/employees': mockEmployees,
    '/api/departments': mockDepartments,
    '/api/worksites': mockWorksites
};

// Generic API fetch function
function fetchApi(endpoint) {
    const mockData = apiEndpoints[endpoint] || [];
    return fetchWithMockFallback(endpoint, mockData);
}
