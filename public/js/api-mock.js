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
let mockEmployees = [];

// Load real employee data from the data folder
async function loadJsonData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load ${url}: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error loading ${url}:`, error);
        return [];
    }
}

// Initialize data loading
(async function() {
    try {
        // Load employees data
        const employeesData = await loadJsonData('../data/employees.json');
        if (employeesData && employeesData.length > 0) {
            // Map the data structure to match what the app expects
            mockEmployees = employeesData.map(emp => ({
                'EMP NO': emp.employeeNumber || '',
                'Employee Name': emp.name || '',
                'Designation': emp.designation || '',
                'Department': emp.department || '',
                'Worksite': emp.workSite || emp.worksite || '',
                'JoinDate': emp.joinedDate || '',
                'Manager': '', // No manager info in the data
                'Salary': parseFloat(emp.salaryUSD) || 0,
                'Status': 'Active',
                'Email': `${emp.name.toLowerCase().replace(/\s+/g, '.')}@optiforce.com`,
                'Phone': emp.mobile || '',
                'Image': emp.image || ''
            }));
            console.log(`Loaded ${mockEmployees.length} employees from data/employees.json`);
        }
        
        // Update department distribution based on real data
        if (mockEmployees.length > 0) {
            const departments = {};
            mockEmployees.forEach(emp => {
                const dept = emp.Department;
                if (dept) {
                    departments[dept] = (departments[dept] || 0) + 1;
                }
            });
            
            mockDashboardStats.departmentDistribution = Object.keys(departments).map(name => ({
                name,
                count: departments[name]
            }));
            
            // Update total employees count
            mockDashboardStats.totalEmployees = mockEmployees.length;
        }
        
        // Load departments data
        const departmentsData = await loadJsonData('../data/departments.json');
        if (departmentsData && departmentsData.length > 0) {
            mockDashboardStats.departments = departmentsData;
        }
        
        // Load worksites data
        const worksitesData = await loadJsonData('../data/worksites.json');
        if (worksitesData && worksitesData.length > 0) {
            mockDashboardStats.worksites = worksitesData;
        }
        
        // Load users data
        const usersData = await loadJsonData('../data/users.json');
        if (usersData && usersData.length > 0) {
            mockUsers = usersData;
        }
        
        // Load activities data
        const activitiesData = await loadJsonData('../data/activities.json');
        if (activitiesData && activitiesData.length > 0) {
            mockRecentActivities = activitiesData.slice(0, 10); // Get the 10 most recent
        }
        
        // Load leave applications data
        const leaveData = await loadJsonData('../data/leave_applications.json');
        if (leaveData && leaveData.length > 0) {
            apiEndpoints['/api/leave/applications'] = leaveData;
        }
        
        // Load payroll data
        const payrollData = await loadJsonData('../data/salaries.json');
        if (payrollData && payrollData.length > 0) {
            apiEndpoints['/api/payroll/data'] = payrollData;
        }
        
        // Load trainings data
        const trainingsData = await loadJsonData('../data/trainings.json');
        if (trainingsData && trainingsData.length > 0) {
            apiEndpoints['/api/trainings'] = trainingsData;
        }
        
        // Load trainers data
        const trainersData = await loadJsonData('../data/trainers.json');
        if (trainersData && trainersData.length > 0) {
            apiEndpoints['/api/trainers'] = trainersData;
        }
        
        console.log('All mock data loaded successfully from data folder');
    } catch (error) {
        console.error('Failed to load data:', error);
    }
})();

// API endpoint mapping
const apiEndpoints = {
    '/api/dashboard/stats': mockDashboardStats,
    '/api/dashboard/recent-activities': { recent: mockRecentActivities },
    '/api/users': mockUsers,
    '/api/employees': mockEmployees,
    '/api/departments': mockDashboardStats.departments,
    '/api/worksites': mockDashboardStats.worksites,
    '/api/employees/names': mockEmployees.map(emp => ({ id: emp['EMP NO'], name: emp['Employee Name'] })),
    '/api/leave/applications': [], // Will be loaded from leave_applications.json
    '/api/payroll/data': [], // Will be loaded from salaries.json
    '/api/trainings': [], // Will be loaded from trainings.json
    '/api/trainers': [] // Will be loaded from trainers.json
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
