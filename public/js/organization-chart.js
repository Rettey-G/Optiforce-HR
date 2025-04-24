// Organization Chart JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    checkAuthentication();
    
    // Initialize sidebar toggle
    initSidebar();
    
    // Initialize Google Charts
    google.charts.load('current', {packages: ['orgchart']});
    google.charts.setOnLoadCallback(initCharts);
    
    // Initialize event listeners
    initEventListeners();
    
    // Initialize logout functionality
    initLogout();
});

// Authentication check
function checkAuthentication() {
    // In a real application, this would check session/token validity
    // For demo purposes, we'll redirect to login if no session exists
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    
    if (!isLoggedIn) {
        window.location.href = 'login.html';
        return;
    }
    
    // Organization chart is now accessible to all users, not just admins
}

// Initialize sidebar toggle functionality - no longer needed
function initSidebar() {
    // Sidebar has been removed in favor of the main navigation
    // This function is kept for compatibility
}

// Initialize charts
function initCharts() {
    // Load data for charts
    loadOrganizationData();
}

// Load organization data
function loadOrganizationData() {
    // Fetch employees using fetchApi from api-mock.js if available
    const fetchFunction = typeof fetchApi !== 'undefined' ? fetchApi : fetch;
    fetchFunction('/api/employees')
        .then(response => {
            if (!response.ok) {
                // If API doesn't exist, use mock data for demo
                return Promise.resolve({
                    json: () => Promise.resolve([
                        { 'EMP NO': '001', 'Employee Name': 'John Smith', 'Designation': 'CEO', 'Department': 'Executive', 'Worksite': 'Headquarters', 'JoinDate': '2018-01-15', 'Manager': '', 'Salary': 180000, 'Status': 'Active', 'Email': 'john.smith@optiforce.com', 'Phone': '(555) 123-4567' },
                        { 'EMP NO': '002', 'Employee Name': 'Sarah Johnson', 'Designation': 'Operations Director', 'Department': 'Operations', 'Worksite': 'Headquarters', 'JoinDate': '2018-03-10', 'Manager': '001', 'Salary': 145000, 'Status': 'Active', 'Email': 'sarah.johnson@optiforce.com', 'Phone': '(555) 234-5678' },
                        { 'EMP NO': '003', 'Employee Name': 'Michael Chen', 'Designation': 'Finance Director', 'Department': 'Finance', 'Worksite': 'Headquarters', 'JoinDate': '2018-02-20', 'Manager': '001', 'Salary': 142000, 'Status': 'Active', 'Email': 'michael.chen@optiforce.com', 'Phone': '(555) 345-6789' },
                        { 'EMP NO': '004', 'Employee Name': 'Emily Davis', 'Designation': 'Operations Manager', 'Department': 'Operations', 'Worksite': 'Site A', 'JoinDate': '2019-05-12', 'Manager': '002', 'Salary': 110000, 'Status': 'Active', 'Email': 'emily.davis@optiforce.com', 'Phone': '(555) 456-7890' },
                        { 'EMP NO': '005', 'Employee Name': 'Robert Wilson', 'Designation': 'Logistics Manager', 'Department': 'Operations', 'Worksite': 'Site B', 'JoinDate': '2019-06-18', 'Manager': '002', 'Salary': 105000, 'Status': 'Active', 'Email': 'robert.wilson@optiforce.com', 'Phone': '(555) 567-8901' },
                        { 'EMP NO': '006', 'Employee Name': 'Jessica Lee', 'Designation': 'Accounting Manager', 'Department': 'Finance', 'Worksite': 'Headquarters', 'JoinDate': '2019-04-22', 'Manager': '003', 'Salary': 108000, 'Status': 'Active', 'Email': 'jessica.lee@optiforce.com', 'Phone': '(555) 678-9012' },
                        { 'EMP NO': '007', 'Employee Name': 'David Martinez', 'Designation': 'Budget Manager', 'Department': 'Finance', 'Worksite': 'Headquarters', 'JoinDate': '2019-07-15', 'Manager': '003', 'Salary': 106000, 'Status': 'Active', 'Email': 'david.martinez@optiforce.com', 'Phone': '(555) 789-0123' },
                        { 'EMP NO': '008', 'Employee Name': 'Amanda Brown', 'Designation': 'Team Lead', 'Department': 'Operations', 'Worksite': 'Site A', 'JoinDate': '2020-01-10', 'Manager': '004', 'Salary': 85000, 'Status': 'Active', 'Email': 'amanda.brown@optiforce.com', 'Phone': '(555) 890-1234' },
                        { 'EMP NO': '009', 'Employee Name': 'Kevin Taylor', 'Designation': 'Senior Specialist', 'Department': 'Operations', 'Worksite': 'Site A', 'JoinDate': '2020-03-15', 'Manager': '004', 'Salary': 78000, 'Status': 'Active', 'Email': 'kevin.taylor@optiforce.com', 'Phone': '(555) 901-2345' },
                        { 'EMP NO': '010', 'Employee Name': 'Sophia Garcia', 'Designation': 'Specialist', 'Department': 'Operations', 'Worksite': 'Site B', 'JoinDate': '2020-05-20', 'Manager': '005', 'Salary': 72000, 'Status': 'Active', 'Email': 'sophia.garcia@optiforce.com', 'Phone': '(555) 012-3456' },
                        { 'EMP NO': '011', 'Employee Name': 'James Wilson', 'Designation': 'Junior Specialist', 'Department': 'Operations', 'Worksite': 'Site B', 'JoinDate': '2021-02-15', 'Manager': '005', 'Salary': 65000, 'Status': 'Active', 'Email': 'james.wilson@optiforce.com', 'Phone': '(555) 123-4567' },
                        { 'EMP NO': '012', 'Employee Name': 'Olivia Thomas', 'Designation': 'Senior Accountant', 'Department': 'Finance', 'Worksite': 'Headquarters', 'JoinDate': '2020-02-10', 'Manager': '006', 'Salary': 80000, 'Status': 'Active', 'Email': 'olivia.thomas@optiforce.com', 'Phone': '(555) 234-5678' },
                        { 'EMP NO': '013', 'Employee Name': 'William Clark', 'Designation': 'Accountant', 'Department': 'Finance', 'Worksite': 'Headquarters', 'JoinDate': '2020-08-05', 'Manager': '006', 'Salary': 70000, 'Status': 'Active', 'Email': 'william.clark@optiforce.com', 'Phone': '(555) 345-6789' },
                        { 'EMP NO': '014', 'Employee Name': 'Emma Rodriguez', 'Designation': 'Budget Analyst', 'Department': 'Finance', 'Worksite': 'Headquarters', 'JoinDate': '2020-06-12', 'Manager': '007', 'Salary': 75000, 'Status': 'Active', 'Email': 'emma.rodriguez@optiforce.com', 'Phone': '(555) 456-7890' },
                        { 'EMP NO': '015', 'Employee Name': 'Daniel Lewis', 'Designation': 'Financial Analyst', 'Department': 'Finance', 'Worksite': 'Headquarters', 'JoinDate': '2021-01-20', 'Manager': '007', 'Salary': 72000, 'Status': 'Active', 'Email': 'daniel.lewis@optiforce.com', 'Phone': '(555) 567-8901' }
                    ])
                });
            }
            return response;
        })
        .then(response => response.json())
        .then(employees => {
            // Fetch departments
            fetch('/api/departments')
                .then(response => {
                    if (!response.ok) {
                        // If API doesn't exist, use mock data for demo
                        return Promise.resolve({
                            json: () => Promise.resolve([
                                { id: 1, name: 'Executive', description: 'Executive Leadership' },
                                { id: 2, name: 'Operations', description: 'Operations department' },
                                { id: 3, name: 'Finance', description: 'Finance and Accounting department' },
                                { id: 4, name: 'HR', description: 'Human Resources department' },
                                { id: 5, name: 'IT', description: 'Information Technology department' }
                            ])
                        });
                    }
                    return response;
                })
                .then(response => response.json())
                .then(departments => {
                    // Fetch worksites
                    fetch('/api/worksites')
                        .then(response => {
                            if (!response.ok) {
                                // If API doesn't exist, use mock data for demo
                                return Promise.resolve({
                                    json: () => Promise.resolve([
                                        { id: 1, name: 'Headquarters', location: 'Main Office' },
                                        { id: 2, name: 'Site A', location: 'North Region' },
                                        { id: 3, name: 'Site B', location: 'South Region' },
                                        { id: 4, name: 'Remote', location: 'Various Locations' }
                                    ])
                                });
                            }
                            return response;
                        })
                        .then(response => response.json())
                        .then(worksites => {
                            // Draw charts
                            drawHierarchyChart(employees);
                            drawDepartmentChart(employees, departments);
                            drawWorksiteChart(employees, worksites);
                            
                            // Hide loading indicators
                            document.querySelectorAll('.chart-loading').forEach(loader => {
                                loader.style.display = 'none';
                            });
                        })
                        .catch(error => {
                            console.error('Error loading worksites:', error);
                            showToast('Error loading worksites', 'error');
                        });
                })
                .catch(error => {
                    console.error('Error loading departments:', error);
                    showToast('Error loading departments', 'error');
                });
        })
        .catch(error => {
            console.error('Error loading employees:', error);
            showToast('Error loading employees', 'error');
        });
}

// Draw department chart
function drawDepartmentChart(employees, departments) {
    const data = new google.visualization.DataTable();
    data.addColumn('string', 'id');
    data.addColumn('string', 'parentId');
    data.addColumn('string', 'tooltip');
    data.addColumn('string', 'nodeContent');
    
    // Add company node
    data.addRow([
        'company',
        '',
        'OptiForce HR',
        createCompanyNode('OptiForce HR', 'Building Better Workplaces')
    ]);
    
    // Add department nodes
    departments.forEach(department => {
        const employeesInDept = employees.filter(emp => emp.Department === department.name);
        data.addRow([
            'dept_' + department.id,
            'company',
            department.name,
            createDepartmentNode(department.name, employeesInDept.length)
        ]);
    });
    
    // Add employee nodes
    employees.forEach(employee => {
        // Find the department for this employee
        const department = departments.find(dept => dept.name === employee.Department);
        if (department) {
            const parentId = 'dept_' + department.id;
            const employeeId = 'emp_' + employee['EMP NO'];
            
            data.addRow([
                employeeId,
                parentId,
                employee['Employee Name'] + ' - ' + employee.Designation,
                createEmployeeNode(employee)
            ]);
        }
    });
    
    // Create the chart
    const chart = new google.visualization.OrgChart(document.getElementById('department-chart-container'));
    
    // Draw the chart
    chart.draw(data, {
        allowHtml: true,
        size: 'large',
        nodeClass: 'google-visualization-orgchart-node'
    });
    
    // Add event listener for employee nodes
    google.visualization.events.addListener(chart, 'select', function() {
        const selection = chart.getSelection();
        if (selection.length > 0) {
            const row = selection[0].row;
            const nodeId = data.getValue(row, 0);
            
            if (nodeId.startsWith('emp_')) {
                const employeeId = nodeId.replace('emp_', '');
                const employee = employees.find(emp => emp['EMP NO'] === employeeId);
                if (employee) {
                    showEmployeeDetails(employee);
                }
            }
        }
    });
}

// Draw hierarchical organization chart
function drawHierarchyChart(employees) {
    // Get the container
    const container = document.getElementById('hierarchy-chart-container');
    if (!container) return;
    
    // Find CEO (employee with no manager)
    const ceo = employees.find(emp => !emp.Manager || emp.Manager === '');
    if (!ceo) return;
    
    // Create CEO node
    const ceoElement = document.querySelector('.level-1.rectangle');
    if (ceoElement) {
        ceoElement.innerHTML = createHierarchyEmployeeCard(ceo);
    }
    
    // Find directors (employees reporting directly to CEO)
    const directors = employees.filter(emp => emp.Manager === ceo['EMP NO']);
    
    // Create director nodes
    const directorElements = document.querySelectorAll('.level-2.rectangle');
    directors.forEach((director, index) => {
        if (index < directorElements.length) {
            directorElements[index].innerHTML = createHierarchyEmployeeCard(director);
            
            // Find managers reporting to this director
            const managers = employees.filter(emp => emp.Manager === director['EMP NO']);
            
            // Get the manager container for this director
            const directorLi = directorElements[index].closest('li');
            const managerWrapper = directorLi.querySelector('.level-3-wrapper');
            
            if (managerWrapper) {
                // Clear existing manager elements
                managerWrapper.innerHTML = '';
                
                // Create manager nodes
                managers.forEach(manager => {
                    const managerLi = document.createElement('li');
                    
                    // Create manager element
                    const managerH3 = document.createElement('h3');
                    managerH3.className = 'level-3 rectangle';
                    managerH3.innerHTML = createHierarchyEmployeeCard(manager);
                    managerLi.appendChild(managerH3);
                    
                    // Find employees reporting to this manager
                    const directReports = employees.filter(emp => emp.Manager === manager['EMP NO']);
                    
                    if (directReports.length > 0) {
                        // Create employee wrapper
                        const employeeWrapper = document.createElement('ol');
                        employeeWrapper.className = 'level-4-wrapper';
                        
                        // Create employee nodes
                        directReports.forEach(employee => {
                            const employeeLi = document.createElement('li');
                            
                            // Create employee element
                            const employeeH4 = document.createElement('h4');
                            employeeH4.className = 'level-4 rectangle';
                            employeeH4.innerHTML = createHierarchyEmployeeCard(employee);
                            employeeLi.appendChild(employeeH4);
                            
                            employeeWrapper.appendChild(employeeLi);
                        });
                        
                        managerLi.appendChild(employeeWrapper);
                    }
                    
                    managerWrapper.appendChild(managerLi);
                });
            }
        }
    });
    
    // Add click handlers for the hierarchy chart nodes
    document.querySelectorAll('.level-2, .level-3').forEach(node => {
        node.addEventListener('click', function(e) {
            // Find the next level wrapper that's a sibling
            const parent = this.parentNode;
            const nextLevelWrapper = parent.querySelector('.level-3-wrapper, .level-4-wrapper');
            if (nextLevelWrapper) {
                nextLevelWrapper.classList.toggle('collapsed');
                e.stopPropagation(); // Prevent event bubbling
            }
        });
    });
}

// Create hierarchy employee card
function createHierarchyEmployeeCard(employee) {
    // Use random profile images for demo if no image is provided
    const profileImages = [
        'img/profile1.jpg', 'img/profile2.jpg', 'img/profile3.jpg', 'img/profile4.jpg',
        'img/profile5.jpg', 'img/profile6.jpg', 'img/profile7.jpg', 'img/profile8.jpg'
    ];
    const randomIndex = Math.floor(Math.random() * profileImages.length);
    const imageSrc = employee.image ? employee.image : profileImages[randomIndex];
    
    // Format join date
    let joinDate = '';
    if (employee.JoinDate) {
        const date = new Date(employee.JoinDate);
        joinDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
    
    // Get employee salary if available
    const salary = employee.Salary ? `$${employee.Salary.toLocaleString()}` : '';
    
    // Get employee status
    const status = employee.Status || 'Active';
    
    // Calculate years of service
    let yearsOfService = '';
    if (employee.JoinDate) {
        const joinYear = new Date(employee.JoinDate).getFullYear();
        const currentYear = new Date().getFullYear();
        const years = currentYear - joinYear;
        yearsOfService = `${years} year${years !== 1 ? 's' : ''}`;
    }
    
    return `
        <div class="employee-card" data-employee-id="${employee['EMP NO']}" onclick="showEmployeeDetails(${JSON.stringify(employee).replace(/"/g, "'")}); event.stopPropagation();">
            <img src="${imageSrc}" alt="${employee['Employee Name']}" class="employee-photo" onerror="this.src='img/default-avatar.png'">
            <div class="employee-info">
                <div class="employee-name">${employee['Employee Name']}</div>
                <div class="employee-title">${employee.Designation || 'Employee'}</div>
                <div class="employee-details">
                    <div class="employee-id">ID: ${employee['EMP NO']}</div>
                    <div class="employee-department">Dept: ${employee.Department || ''}</div>
                    <div class="employee-worksite">Location: ${employee.Worksite || ''}</div>
                    <div class="employee-joined">Joined: ${joinDate} (${yearsOfService})</div>
                    ${salary ? `<div class="employee-salary">Salary: ${salary}</div>` : ''}
                    ${status ? `<div class="employee-status">Status: ${status}</div>` : ''}
                    ${employee.Email ? `<div class="employee-email">Email: ${employee.Email}</div>` : ''}
                </div>
            </div>
        </div>
    `;
}

// Draw worksite chart
function drawWorksiteChart(employees, worksites) {
    const data = new google.visualization.DataTable();
    data.addColumn('string', 'id');
    data.addColumn('string', 'parentId');
    data.addColumn('string', 'tooltip');
    data.addColumn('string', 'nodeContent');
    
    // Add company node
    data.addRow([
        'company',
        '',
        'OptiForce HR',
        createCompanyNode('OptiForce HR', 'Building Better Workplaces')
    ]);
    
    // Add worksite nodes
    worksites.forEach(worksite => {
        const employeesInSite = employees.filter(emp => emp['Work Site'] === worksite.name);
        data.addRow([
            'site_' + worksite.id,
            'company',
            worksite.name,
            createWorksiteNode(worksite.name, worksite.location, employeesInSite.length)
        ]);
    });
    
    // Add employee nodes
    employees.forEach(employee => {
        // Find the worksite for this employee
        const worksite = worksites.find(site => site.name === employee['Work Site']);
        if (worksite) {
            const parentId = 'site_' + worksite.id;
            const employeeId = 'emp_' + employee['EMP NO'];
            
            data.addRow([
                employeeId,
                parentId,
                employee['Employee Name'] + ' - ' + employee.Designation,
                createEmployeeNode(employee)
            ]);
        }
    });
    
    // Create the chart
    const chart = new google.visualization.OrgChart(document.getElementById('worksite-chart-container'));
    
    // Draw the chart
    chart.draw(data, {
        allowHtml: true,
        size: 'large',
        nodeClass: 'google-visualization-orgchart-node'
    });
    
    // Add event listener for employee nodes
    google.visualization.events.addListener(chart, 'select', function() {
        const selection = chart.getSelection();
        if (selection.length > 0) {
            const row = selection[0].row;
            const nodeId = data.getValue(row, 0);
            
            if (nodeId.startsWith('emp_')) {
                const employeeId = nodeId.replace('emp_', '');
                const employee = employees.find(emp => emp['EMP NO'] === employeeId);
                if (employee) {
                    showEmployeeDetails(employee);
                }
            }
        }
    });
}

// Draw combined chart
function drawCombinedChart(employees, departments, worksites) {
    const data = new google.visualization.DataTable();
    data.addColumn('string', 'id');
    data.addColumn('string', 'parentId');
    data.addColumn('string', 'tooltip');
    data.addColumn('string', 'nodeContent');
    
    // Add company node
    data.addRow([
        'company',
        '',
        'OptiForce HR',
        createCompanyNode('OptiForce HR', 'Building Better Workplaces')
    ]);
    
    // Add department nodes
    departments.forEach(department => {
        const employeesInDept = employees.filter(emp => emp.Department === department.name);
        data.addRow([
            'dept_' + department.id,
            'company',
            department.name,
            createDepartmentNode(department.name, employeesInDept.length)
        ]);
    });
    
    // Find managers/directors for each department
    departments.forEach(department => {
        const employeesInDept = employees.filter(emp => emp.Department === department.name);
        
        // Find department head (manager/director)
        const departmentHeads = employeesInDept.filter(emp => 
            emp.Designation.toLowerCase().includes('manager') || 
            emp.Designation.toLowerCase().includes('director') || 
            emp.Designation.toLowerCase().includes('head'));
        
        // If department head exists, add them directly under department
        departmentHeads.forEach(manager => {
            const managerId = 'emp_' + manager['EMP NO'];
            data.addRow([
                managerId,
                'dept_' + department.id,
                manager['Employee Name'] + ' - ' + manager.Designation,
                createEmployeeNode(manager)
            ]);
        });
        
        // Add team leads under managers
        const teamLeads = employeesInDept.filter(emp => 
            emp.Designation.toLowerCase().includes('lead') || 
            emp.Designation.toLowerCase().includes('supervisor') ||
            emp.Designation.toLowerCase().includes('senior'));
        
        teamLeads.forEach(lead => {
            // Find the most appropriate manager to report to
            let managerFound = false;
            
            for (const manager of departmentHeads) {
                // Skip if this is the same person
                if (manager['EMP NO'] === lead['EMP NO']) continue;
                
                const managerId = 'emp_' + manager['EMP NO'];
                const leadId = 'emp_' + lead['EMP NO'];
                
                data.addRow([
                    leadId,
                    managerId,
                    lead['Employee Name'] + ' - ' + lead.Designation,
                    createEmployeeNode(lead)
                ]);
                
                managerFound = true;
                break;
            }
            
            // If no manager found, report directly to department
            if (!managerFound && !departmentHeads.some(m => m['EMP NO'] === lead['EMP NO'])) {
                const leadId = 'emp_' + lead['EMP NO'];
                
                data.addRow([
                    leadId,
                    'dept_' + department.id,
                    lead['Employee Name'] + ' - ' + lead.Designation,
                    createEmployeeNode(lead)
                ]);
            }
        });
        
        // Add regular employees under team leads or managers
        const regularEmployees = employeesInDept.filter(emp => 
            !emp.Designation.toLowerCase().includes('manager') && 
            !emp.Designation.toLowerCase().includes('director') && 
            !emp.Designation.toLowerCase().includes('head') &&
            !emp.Designation.toLowerCase().includes('lead') && 
            !emp.Designation.toLowerCase().includes('supervisor') &&
            !emp.Designation.toLowerCase().includes('senior'));
        
        regularEmployees.forEach(employee => {
            // Try to find a team lead in the same department
            let supervisorFound = false;
            
            // First try to assign to team leads
            for (const lead of teamLeads) {
                const leadId = 'emp_' + lead['EMP NO'];
                const employeeId = 'emp_' + employee['EMP NO'];
                
                data.addRow([
                    employeeId,
                    leadId,
                    employee['Employee Name'] + ' - ' + employee.Designation,
                    createEmployeeNode(employee)
                ]);
                
                supervisorFound = true;
                break;
            }
            
            // If no team lead, try to assign to a manager
            if (!supervisorFound && departmentHeads.length > 0) {
                const manager = departmentHeads[0];
                const managerId = 'emp_' + manager['EMP NO'];
                const employeeId = 'emp_' + employee['EMP NO'];
                
                data.addRow([
                    employeeId,
                    managerId,
                    employee['Employee Name'] + ' - ' + employee.Designation,
                    createEmployeeNode(employee)
                ]);
                
                supervisorFound = true;
            }
            
            // If no supervisor found, report directly to department
            if (!supervisorFound) {
                const employeeId = 'emp_' + employee['EMP NO'];
                
                data.addRow([
                    employeeId,
                    'dept_' + department.id,
                    employee['Employee Name'] + ' - ' + employee.Designation,
                    createEmployeeNode(employee)
                ]);
            }
        });
    });
    
    // Create the chart
    const chart = new google.visualization.OrgChart(document.getElementById('combined-chart-container'));
    
    // Draw the chart
    chart.draw(data, {
        allowHtml: true,
        size: 'large',
        nodeClass: 'google-visualization-orgchart-node'
    });
    
    // Add event listener for employee nodes
    google.visualization.events.addListener(chart, 'select', function() {
        const selection = chart.getSelection();
        if (selection.length > 0) {
            const row = selection[0].row;
            const nodeId = data.getValue(row, 0);
            
            if (nodeId.startsWith('emp_')) {
                const employeeId = nodeId.replace('emp_', '');
                const employee = employees.find(emp => emp['EMP NO'] === employeeId);
                if (employee) {
                    showEmployeeDetails(employee);
                }
            }
        }
    });
}

// Create company node HTML
function createCompanyNode(name, tagline) {
    return `
        <div class="company-node">
            <img src="img/logo.png" alt="${name}" class="company-logo" onerror="this.src='img/admin-avatar.png'">
            <p class="company-name">${name}</p>
            <p class="company-tagline">${tagline}</p>
        </div>
    `;
}

// Create department node HTML
function createDepartmentNode(name, employeeCount) {
    return `
        <div class="department-node">
            <i class="fas fa-building department-icon"></i>
            <p class="department-name">${name}</p>
            <p class="department-count">${employeeCount} Employees</p>
        </div>
    `;
}

// Create worksite node HTML
function createWorksiteNode(name, location, employeeCount) {
    return `
        <div class="worksite-node">
            <i class="fas fa-map-marker-alt worksite-icon"></i>
            <p class="worksite-name">${name}</p>
            <p class="worksite-location">${location}</p>
            <p class="department-count">${employeeCount} Employees</p>
        </div>
    `;
}

// Create employee node HTML
function createEmployeeNode(employee) {
    // Use random profile images for demo
    const profileImages = [
        'img/profile1.jpg', 'img/profile2.jpg', 'img/profile3.jpg', 'img/profile4.jpg',
        'img/profile5.jpg', 'img/profile6.jpg', 'img/profile7.jpg', 'img/profile8.jpg'
    ];
    
    // Select a random image or use the employee's image if available
    const randomIndex = Math.floor(Math.random() * profileImages.length);
    const imageSrc = employee.image ? employee.image : profileImages[randomIndex];
    const joinedDate = employee['Joined Date'] ? new Date(employee['Joined Date']).toLocaleDateString() : 'N/A';
    
    return `
        <div class="employee-node" data-employee-id="${employee['EMP NO']}">
            <div class="employee-photo-container">
                <img src="${imageSrc}" alt="${employee['Employee Name']}" class="employee-photo" onerror="this.src='img/default-avatar.png'">
            </div>
            <div class="employee-info">
                <div class="employee-name">${employee['Employee Name']}</div>
                <div class="employee-title">${employee.Designation || 'Employee'}</div>
            </div>
        </div>
    `;
}

// Show employee details in modal
function showEmployeeDetails(employee) {
    const modal = document.getElementById('employeeDetailsModal');
    if (!modal) return;
    
    const modalTitle = modal.querySelector('.modal-title');
    const modalBody = modal.querySelector('.modal-body');
    
    if (modalTitle && modalBody) {
        modalTitle.textContent = employee['Employee Name'] || 'Employee Details';
        
        // Format join date
        let joinDate = 'Not available';
        if (employee.JoinDate) {
            const date = new Date(employee.JoinDate);
            joinDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        }
        
        // Calculate years of service
        let yearsOfService = 'N/A';
        if (employee.JoinDate) {
            const joinYear = new Date(employee.JoinDate).getFullYear();
            const currentYear = new Date().getFullYear();
            const years = currentYear - joinYear;
            yearsOfService = `${years} year${years !== 1 ? 's' : ''}`;
        }
        
        // Use random profile images for demo
        const profileImages = [
            'img/profile1.jpg', 'img/profile2.jpg', 'img/profile3.jpg', 'img/profile4.jpg',
            'img/profile5.jpg', 'img/profile6.jpg', 'img/profile7.jpg', 'img/profile8.jpg'
        ];
        const randomIndex = Math.floor(Math.random() * profileImages.length);
        const imageSrc = employee.image ? employee.image : profileImages[randomIndex];
        
        modalBody.innerHTML = `
            <div class="row">
                <div class="col-md-4 text-center mb-3">
                    <img src="${imageSrc}" alt="${employee['Employee Name']}" class="img-fluid rounded-circle employee-modal-photo" style="max-width: 150px;" onerror="this.src='img/default-avatar.png'">
                </div>
                <div class="col-md-8">
                    <ul class="list-group">
                        <li class="list-group-item"><strong>Employee ID:</strong> ${employee['EMP NO'] || 'N/A'}</li>
                        <li class="list-group-item"><strong>Designation:</strong> ${employee.Designation || 'N/A'}</li>
                        <li class="list-group-item"><strong>Department:</strong> ${employee.Department || 'N/A'}</li>
                        <li class="list-group-item"><strong>Worksite:</strong> ${employee.Worksite || 'N/A'}</li>
                        <li class="list-group-item"><strong>Join Date:</strong> ${joinDate}</li>
                        <li class="list-group-item"><strong>Years of Service:</strong> ${yearsOfService}</li>
                        ${employee.Salary ? `<li class="list-group-item"><strong>Salary:</strong> $${employee.Salary.toLocaleString()}</li>` : ''}
                        ${employee.Status ? `<li class="list-group-item"><strong>Status:</strong> ${employee.Status}</li>` : ''}
                        ${employee.Email ? `<li class="list-group-item"><strong>Email:</strong> ${employee.Email}</li>` : ''}
                        ${employee.Phone ? `<li class="list-group-item"><strong>Phone:</strong> ${employee.Phone}</li>` : ''}
                    </ul>
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header bg-light">
                            <h5 class="mb-0">Employee Actions</h5>
                        </div>
                        <div class="card-body">
                            <div class="d-flex justify-content-between flex-wrap">
                                <button class="btn btn-outline-primary btn-sm mb-2"><i class="fas fa-edit"></i> Edit Profile</button>
                                <button class="btn btn-outline-success btn-sm mb-2"><i class="fas fa-file-alt"></i> Documents</button>
                                <button class="btn btn-outline-info btn-sm mb-2"><i class="fas fa-chart-line"></i> Performance</button>
                                <button class="btn btn-outline-secondary btn-sm mb-2"><i class="fas fa-history"></i> History</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Show the modal
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }
}

// Initialize event listeners
function initEventListeners() {
    // Toggle view button
    const toggleViewBtn = document.getElementById('toggle-view-btn');
    if (toggleViewBtn) {
        toggleViewBtn.addEventListener('click', function() {
            const chartContainers = document.querySelectorAll('.chart-container, .org-chart-container');
            chartContainers.forEach(container => {
                if (container.classList.contains('list-view')) {
                    container.classList.remove('list-view');
                    toggleViewBtn.innerHTML = '<i class="fas fa-list"></i> List View';
                } else {
                    container.classList.add('list-view');
                    toggleViewBtn.innerHTML = '<i class="fas fa-sitemap"></i> Chart View';
                }
            });
        });
    }
    
    // Expand all button
    const expandAllBtn = document.getElementById('expand-all-btn');
    if (expandAllBtn) {
        expandAllBtn.addEventListener('click', function() {
            const chartContainers = document.querySelectorAll('.chart-container, .org-chart-container');
            chartContainers.forEach(container => {
                const collapsedNodes = container.querySelectorAll('.collapsed-node');
                collapsedNodes.forEach(node => {
                    node.classList.remove('collapsed-node');
                });
                
                // For the new hierarchy chart
                const collapsedLists = container.querySelectorAll('.level-3-wrapper.collapsed, .level-4-wrapper.collapsed');
                collapsedLists.forEach(list => {
                    list.classList.remove('collapsed');
                });
            });
        });
    }
    
    // Collapse all button
    const collapseAllBtn = document.getElementById('collapse-all-btn');
    if (collapseAllBtn) {
        collapseAllBtn.addEventListener('click', function() {
            const chartContainers = document.querySelectorAll('.chart-container, .org-chart-container');
            chartContainers.forEach(container => {
                const expandedNodes = container.querySelectorAll('.expanded-node');
                expandedNodes.forEach(node => {
                    node.classList.add('collapsed-node');
                });
                
                // For the new hierarchy chart
                const expandedLists = container.querySelectorAll('.level-3-wrapper, .level-4-wrapper');
                expandedLists.forEach(list => {
                    list.classList.add('collapsed');
                });
            });
        });
    }
    
    // Add click handlers for the hierarchy chart nodes
    document.querySelectorAll('.level-2, .level-3').forEach(node => {
        node.addEventListener('click', function(e) {
            // Find the next level wrapper that's a sibling
            const parent = this.parentNode;
            const nextLevelWrapper = parent.querySelector('.level-3-wrapper, .level-4-wrapper');
            if (nextLevelWrapper) {
                nextLevelWrapper.classList.toggle('collapsed');
                e.stopPropagation(); // Prevent event bubbling
            }
        });
    });
}

// Initialize logout functionality
function initLogout() {
    // Logout buttons
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    const dropdownLogout = document.getElementById('dropdown-logout');
    if (dropdownLogout) {
        dropdownLogout.addEventListener('click', logout);
    }
}

// Logout function
function logout() {
    // Clear session storage
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('username');
    
    // Redirect to login page
    window.location.href = '/login.html';
}

// Show toast notification
function showToast(message, type = 'info') {
    // Check if toast container exists, if not create it
    let toastContainer = document.querySelector('.toast-container');
    
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${getToastBgClass(type)} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    // Add toast to container
    toastContainer.appendChild(toast);
    
    // Initialize Bootstrap toast
    const bsToast = new bootstrap.Toast(toast, {
        autohide: true,
        delay: 3000
    });
    
    // Show toast
    bsToast.show();
    
    // Remove toast after it's hidden
    toast.addEventListener('hidden.bs.toast', function() {
        toast.remove();
    });
}

// Get toast background class based on type
function getToastBgClass(type) {
    switch (type) {
        case 'success':
            return 'success';
        case 'error':
            return 'danger';
        case 'warning':
            return 'warning';
        default:
            return 'info';
    }
}
