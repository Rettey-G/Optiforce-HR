// Admin Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    checkAuthentication();
    
    // Initialize sidebar toggle
    initSidebar();
    
    // Initialize navigation
    initNavigation();
    
    // Load dashboard data
    loadDashboardData();
    
    // Load user management data
    loadUsers();
    
    // Load employees data
    loadEmployees();
    
    // Load departments data
    loadDepartments();
    
    // Load worksites data
    loadWorksites();
    
    // Initialize event listeners for forms
    initFormHandlers();
    
    // Initialize logout functionality
    initLogout();
});

// Authentication check
function checkAuthentication() {
    // In a real application, this would check session/token validity
    // For demo purposes, we'll redirect to login if no session exists
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const userRole = sessionStorage.getItem('userRole');
    
    if (!isLoggedIn) {
        window.location.href = '/login.html';
        return;
    }
    
    // Only allow admin users to access this page
    if (userRole !== 'admin') {
        window.location.href = '/dashboard.html';
        return;
    }
    
    // Update admin name in sidebar
    document.getElementById('admin-name').textContent = sessionStorage.getItem('username') || 'Admin User';
}

// Initialize sidebar toggle functionality
function initSidebar() {
    document.getElementById('sidebarCollapse').addEventListener('click', function() {
        document.getElementById('sidebar').classList.toggle('active');
        document.getElementById('content').classList.toggle('active');
    });
}

// Initialize navigation between sections
function initNavigation() {
    const navLinks = document.querySelectorAll('#sidebar a[data-section]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.parentElement.classList.remove('active'));
            
            // Add active class to clicked link
            this.parentElement.classList.add('active');
            
            // Hide all content sections
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Show the selected section
            const sectionId = this.getAttribute('data-section');
            document.getElementById(sectionId).classList.add('active');
        });
    });
}

// Load dashboard data
function loadDashboardData() {
    // Load statistics using the fetchApi function from api-mock.js
    fetchApi('/api/dashboard/stats')
        .then(response => response.json())
        .then(data => {
            document.getElementById('total-employees').textContent = data.totalEmployees || 0;
            document.getElementById('total-departments').textContent = data.departments?.length || 0;
            document.getElementById('total-worksites').textContent = data.worksites?.length || 0;
            document.getElementById('total-users').textContent = data.users?.length || 0;
            
            // Create department distribution chart
            createDepartmentChart(data.departmentDistribution);
        })
        .catch(error => {
            console.error('Error loading dashboard stats:', error);
            showToast('Error loading dashboard statistics', 'error');
            
            // Set fallback values
            document.getElementById('total-employees').textContent = '15';
            document.getElementById('total-departments').textContent = '5';
            document.getElementById('total-worksites').textContent = '4';
            document.getElementById('total-users').textContent = '3';
            
            // Create fallback chart
            createDepartmentChart([
                { name: 'Executive', count: 1 },
                { name: 'Operations', count: 6 },
                { name: 'Finance', count: 6 },
                { name: 'HR', count: 1 },
                { name: 'IT', count: 1 }
            ]);
        });
    
    // Load recent activities using the fetchApi function from api-mock.js
    fetchApi('/api/dashboard/recent-activities')
        .then(response => response.json())
        .then(activities => {
            const activitiesList = document.getElementById('recent-activities-list');
            if (!activitiesList) return;
            
            activitiesList.innerHTML = '';
            
            activities.slice(0, 5).forEach(activity => {
                const li = document.createElement('li');
                li.className = 'list-group-item d-flex justify-content-between align-items-center';
                
                const badgeClass = getActionBadgeClass(activity.action);
                
                li.innerHTML = `
                    <div>
                        <span class="badge ${badgeClass} me-2">${activity.action}</span>
                        <strong>${activity.username}</strong> ${activity.description}
                    </div>
                    <small class="text-muted">${new Date(activity.timestamp).toLocaleString()}</small>
                `;
                
                activitiesList.appendChild(li);
            });
        })
        .catch(error => {
            console.error('Error loading recent activities:', error);
            showToast('Error loading recent activities', 'error');
            
            // Create fallback activities
            const activitiesList = document.getElementById('recent-activities-list');
            if (!activitiesList) return;
            
            activitiesList.innerHTML = '';
            
            const mockActivities = [
                { id: 1, username: 'admin', action: 'CREATE', description: 'created a new employee record', timestamp: new Date(2025, 3, 23, 15, 30, 0).toISOString() },
                { id: 2, username: 'admin', action: 'UPDATE', description: 'updated department structure', timestamp: new Date(2025, 3, 23, 14, 45, 0).toISOString() },
                { id: 3, username: 'user1', action: 'LOGIN', description: 'logged into the system', timestamp: new Date(2025, 3, 23, 14, 30, 0).toISOString() },
                { id: 4, username: 'admin', action: 'DELETE', description: 'removed an inactive user account', timestamp: new Date(2025, 3, 23, 13, 15, 0).toISOString() },
                { id: 5, username: 'user2', action: 'VIEW', description: 'viewed employee records', timestamp: new Date(2025, 3, 23, 12, 0, 0).toISOString() }
            ];
            
            mockActivities.forEach(activity => {
                const li = document.createElement('li');
                li.className = 'list-group-item d-flex justify-content-between align-items-center';
                
                const badgeClass = getActionBadgeClass(activity.action);
                
                li.innerHTML = `
                    <div>
                        <span class="badge ${badgeClass} me-2">${activity.action}</span>
                        <strong>${activity.username}</strong> ${activity.description}
                    </div>
                    <small class="text-muted">${new Date(activity.timestamp).toLocaleString()}</small>
                `;
                
                activitiesList.appendChild(li);
            });
        });
}

// Create department distribution chart
function createDepartmentChart(departmentData) {
    if (!departmentData || departmentData.length === 0) return;
    
    const ctx = document.getElementById('department-chart').getContext('2d');
    
    const labels = departmentData.map(item => item.name);
    const data = departmentData.map(item => item.count);
    const backgroundColors = generateChartColors(departmentData.length);
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Generate random colors for chart
function generateChartColors(count) {
    const colors = [
        '#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b',
        '#5a5c69', '#858796', '#6f42c1', '#20c9a6', '#fd7e14'
    ];
    
    // If we need more colors than we have predefined, generate random ones
    if (count > colors.length) {
        for (let i = colors.length; i < count; i++) {
            const r = Math.floor(Math.random() * 255);
            const g = Math.floor(Math.random() * 255);
            const b = Math.floor(Math.random() * 255);
            colors.push(`rgb(${r}, ${g}, ${b})`);
        }
    }
    
    return colors.slice(0, count);
}

// Get badge class based on action
function getActionBadgeClass(action) {
    switch (action.toLowerCase()) {
        case 'added':
            return 'bg-success';
        case 'updated':
            return 'bg-primary';
        case 'deleted':
            return 'bg-danger';
        default:
            return 'bg-secondary';
    }
}

// Load users for user management
function loadUsers() {
    fetchApi('/api/users')
        .then(response => response.json())
        .then(users => {
            const usersTable = document.getElementById('users-table');
            usersTable.innerHTML = '';
            
            if (users.length === 0) {
                usersTable.innerHTML = '<tr><td colspan="4" class="text-center">No users found</td></tr>';
                return;
            }
            
            users.forEach(user => {
                const row = document.createElement('tr');
                
                // Don't allow deleting the main admin account
                const deleteButton = user.id === 1 && user.username === 'admin' 
                    ? '' 
                    : `<button class="btn btn-sm btn-danger delete-user-btn" data-id="${user.id}">
                         <i class="fas fa-trash"></i>
                       </button>`;
                
                row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.username}</td>
                    <td><span class="badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'}">${user.role}</span></td>
                    <td class="action-buttons">
                        <button class="btn btn-sm btn-warning reset-password-btn" data-id="${user.id}" data-username="${user.username}">
                            <i class="fas fa-key"></i>
                        </button>
                        <button class="btn btn-sm btn-primary edit-user-btn" data-id="${user.id}" data-username="${user.username}" data-role="${user.role}">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${deleteButton}
                    </td>
                `;
                
                usersTable.appendChild(row);
            });
            
            // Add event listeners for user actions
            initUserActionButtons();
        })
        .catch(error => {
            console.error('Error loading users:', error);
            showToast('Error loading users', 'error');
        });
}

// Initialize user action buttons
function initUserActionButtons() {
    // Edit user buttons
    document.querySelectorAll('.edit-user-btn').forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            const username = this.getAttribute('data-username');
            const role = this.getAttribute('data-role');
            
            document.getElementById('edit-user-id').value = userId;
            document.getElementById('edit-username').value = username;
            document.getElementById('edit-role').value = role;
            
            // Clear password field
            document.getElementById('edit-password').value = '';
            
            // Show modal
            const editUserModal = new bootstrap.Modal(document.getElementById('editUserModal'));
            editUserModal.show();
        });
    });
    
    // Reset password buttons
    document.querySelectorAll('.reset-password-btn').forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            const username = this.getAttribute('data-username');
            
            document.getElementById('reset-user-id').value = userId;
            document.getElementById('reset-username').textContent = username;
            
            // Clear password fields
            document.getElementById('new-password').value = '';
            document.getElementById('confirm-new-password').value = '';
            
            // Show modal
            const resetPasswordModal = new bootstrap.Modal(document.getElementById('resetPasswordModal'));
            resetPasswordModal.show();
        });
    });
    
    // Delete user buttons
    document.querySelectorAll('.delete-user-btn').forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            const username = this.closest('tr').querySelector('td:nth-child(2)').textContent;
            
            // Set confirmation message
            document.getElementById('confirmation-message').textContent = `Are you sure you want to delete user "${username}"?`;
            
            // Set action for confirmation button
            const confirmBtn = document.getElementById('confirm-action-btn');
            confirmBtn.setAttribute('data-action', 'delete-user');
            confirmBtn.setAttribute('data-id', userId);
            
            // Show confirmation modal
            const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
            confirmationModal.show();
        });
    });
}

// Load employees for employee management
function loadEmployees() {
    fetchApi('/api/employees')
        .then(response => response.json())
        .then(employees => {
            const employeesTable = document.getElementById('employees-table');
            employeesTable.innerHTML = '';
            
            if (employees.length === 0) {
                employeesTable.innerHTML = '<tr><td colspan="6" class="text-center">No employees found</td></tr>';
                return;
            }
            
            // Display only first 10 employees in admin dashboard
            employees.slice(0, 10).forEach(employee => {
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>${employee['EMP NO'] || 'N/A'}</td>
                    <td>${employee['Employee Name'] || 'N/A'}</td>
                    <td>${employee['Department'] || 'N/A'}</td>
                    <td>${employee['Designation'] || 'N/A'}</td>
                    <td>${employee['Work Site'] || 'N/A'}</td>
                    <td class="action-buttons">
                        <a href="/employees.html?id=${employee['EMP NO']}" class="btn btn-sm btn-primary">
                            <i class="fas fa-eye"></i>
                        </a>
                    </td>
                `;
                
                employeesTable.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error loading employees:', error);
            showToast('Error loading employees', 'error');
        });
}

// Load departments
function loadDepartments() {
    fetchApi('/api/departments')
        .then(response => response.json())
        .then(departments => {
            const departmentsTable = document.getElementById('departments-table');
            departmentsTable.innerHTML = '';
            
            if (departments.length === 0) {
                departmentsTable.innerHTML = '<tr><td colspan="4" class="text-center">No departments found</td></tr>';
                return;
            }
            
            departments.forEach(department => {
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>${department.id}</td>
                    <td>${department.name}</td>
                    <td>${department.description || 'N/A'}</td>
                    <td class="action-buttons">
                        <button class="btn btn-sm btn-primary edit-department-btn" data-id="${department.id}" data-name="${department.name}" data-description="${department.description || ''}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-department-btn" data-id="${department.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                
                departmentsTable.appendChild(row);
            });
            
            // Add event listeners for department actions
            initDepartmentActionButtons();
        })
        .catch(error => {
            console.error('Error loading departments:', error);
            showToast('Error loading departments', 'error');
        });
}

// Initialize department action buttons
function initDepartmentActionButtons() {
    // Edit department buttons
    document.querySelectorAll('.edit-department-btn').forEach(button => {
        button.addEventListener('click', function() {
            // Implementation would go here
            showToast('Edit department functionality not implemented in demo', 'warning');
        });
    });
    
    // Delete department buttons
    document.querySelectorAll('.delete-department-btn').forEach(button => {
        button.addEventListener('click', function() {
            // Implementation would go here
            showToast('Delete department functionality not implemented in demo', 'warning');
        });
    });
}

// Load worksites
function loadWorksites() {
    fetchApi('/api/worksites')
        .then(response => response.json())
        .then(worksites => {
            const worksitesTable = document.getElementById('worksites-table');
            worksitesTable.innerHTML = '';
            
            if (worksites.length === 0) {
                worksitesTable.innerHTML = '<tr><td colspan="4" class="text-center">No worksites found</td></tr>';
                return;
            }
            
            worksites.forEach(worksite => {
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>${worksite.id}</td>
                    <td>${worksite.name}</td>
                    <td>${worksite.location || 'N/A'}</td>
                    <td class="action-buttons">
                        <button class="btn btn-sm btn-primary edit-worksite-btn" data-id="${worksite.id}" data-name="${worksite.name}" data-location="${worksite.location || ''}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-worksite-btn" data-id="${worksite.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                
                worksitesTable.appendChild(row);
            });
            
            // Add event listeners for worksite actions
            initWorksiteActionButtons();
        })
        .catch(error => {
            console.error('Error loading worksites:', error);
            showToast('Error loading worksites', 'error');
        });
}

// Initialize worksite action buttons
function initWorksiteActionButtons() {
    // Edit worksite buttons
    document.querySelectorAll('.edit-worksite-btn').forEach(button => {
        button.addEventListener('click', function() {
            // Implementation would go here
            showToast('Edit worksite functionality not implemented in demo', 'warning');
        });
    });
    
    // Delete worksite buttons
    document.querySelectorAll('.delete-worksite-btn').forEach(button => {
        button.addEventListener('click', function() {
            // Implementation would go here
            showToast('Delete worksite functionality not implemented in demo', 'warning');
        });
    });
}

// Initialize form handlers
function initFormHandlers() {
    // Add user form
    document.getElementById('save-user-btn').addEventListener('click', function() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const role = document.getElementById('role').value;
        
        // Validate form
        if (!username || !password || !confirmPassword) {
            showToast('Please fill in all required fields', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }
        
        // In a real application, this would send data to the server
        // For demo purposes, we'll just show a success message
        showToast('User added successfully', 'success');
        
        // Close modal and reset form
        const modal = bootstrap.Modal.getInstance(document.getElementById('addUserModal'));
        modal.hide();
        document.getElementById('add-user-form').reset();
        
        // Reload users
        loadUsers();
    });
    
    // Update user form
    document.getElementById('update-user-btn').addEventListener('click', function() {
        const userId = document.getElementById('edit-user-id').value;
        const username = document.getElementById('edit-username').value;
        const password = document.getElementById('edit-password').value;
        const role = document.getElementById('edit-role').value;
        
        // Validate form
        if (!username) {
            showToast('Username is required', 'error');
            return;
        }
        
        // In a real application, this would send data to the server
        // For demo purposes, we'll just show a success message
        showToast('User updated successfully', 'success');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editUserModal'));
        modal.hide();
        
        // Reload users
        loadUsers();
    });
    
    // Reset password form
    document.getElementById('confirm-reset-btn').addEventListener('click', function() {
        const userId = document.getElementById('reset-user-id').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmNewPassword = document.getElementById('confirm-new-password').value;
        
        // Validate form
        if (!newPassword || !confirmNewPassword) {
            showToast('Please fill in all required fields', 'error');
            return;
        }
        
        if (newPassword !== confirmNewPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }
        
        // In a real application, this would send data to the server
        // For demo purposes, we'll just show a success message
        showToast('Password reset successfully', 'success');
        
        // Close modal and reset form
        const modal = bootstrap.Modal.getInstance(document.getElementById('resetPasswordModal'));
        modal.hide();
        document.getElementById('reset-password-form').reset();
    });
    
    // Confirmation modal action
    document.getElementById('confirm-action-btn').addEventListener('click', function() {
        const action = this.getAttribute('data-action');
        const id = this.getAttribute('data-id');
        
        if (action === 'delete-user') {
            // In a real application, this would send a delete request to the server
            // For demo purposes, we'll just show a success message
            showToast('User deleted successfully', 'success');
            
            // Reload users
            loadUsers();
        }
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('confirmationModal'));
        modal.hide();
    });
    
    // Add department form
    document.getElementById('save-department-btn').addEventListener('click', function() {
        const departmentName = document.getElementById('department-name').value;
        const departmentDescription = document.getElementById('department-description').value;
        
        // Validate form
        if (!departmentName) {
            showToast('Department name is required', 'error');
            return;
        }
        
        // In a real application, this would send data to the server
        // For demo purposes, we'll just show a success message
        showToast('Department added successfully', 'success');
        
        // Close modal and reset form
        const modal = bootstrap.Modal.getInstance(document.getElementById('addDepartmentModal'));
        modal.hide();
        document.getElementById('add-department-form').reset();
        
        // Reload departments
        loadDepartments();
    });
    
    // Add worksite form
    document.getElementById('save-worksite-btn').addEventListener('click', function() {
        const worksiteName = document.getElementById('worksite-name').value;
        const worksiteLocation = document.getElementById('worksite-location').value;
        
        // Validate form
        if (!worksiteName || !worksiteLocation) {
            showToast('All fields are required', 'error');
            return;
        }
        
        // In a real application, this would send data to the server
        // For demo purposes, we'll just show a success message
        showToast('Worksite added successfully', 'success');
        
        // Close modal and reset form
        const modal = bootstrap.Modal.getInstance(document.getElementById('addWorksiteModal'));
        modal.hide();
        document.getElementById('add-worksite-form').reset();
        
        // Reload worksites
        loadWorksites();
    });
    
    // System settings form
    document.getElementById('general-settings-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // In a real application, this would send data to the server
        // For demo purposes, we'll just show a success message
        showToast('Settings saved successfully', 'success');
    });
    
    // Backup button
    document.getElementById('backup-btn').addEventListener('click', function() {
        // In a real application, this would trigger a backup process
        // For demo purposes, we'll just show a success message
        showToast('Backup created successfully', 'success');
        
        // Update last backup date
        const now = new Date();
        document.getElementById('last-backup-date').textContent = now.toLocaleString();
    });
    
    // Restore button
    document.getElementById('restore-btn').addEventListener('click', function() {
        const file = document.getElementById('restore-file').files[0];
        
        if (!file) {
            showToast('Please select a backup file', 'error');
            return;
        }
        
        // In a real application, this would process the backup file
        // For demo purposes, we'll just show a success message
        showToast('System restored successfully', 'success');
    });
}

// Initialize logout functionality
function initLogout() {
    // Logout buttons
    document.getElementById('logout-btn').addEventListener('click', logout);
    document.getElementById('dropdown-logout').addEventListener('click', logout);
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

// Create folder for admin avatar if it doesn't exist
function createImgFolder() {
    // This would be handled server-side in a real application
    console.log('Ensuring img folder exists for admin avatar');
}
