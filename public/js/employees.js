// employees.js: Employees page interactivity

document.addEventListener('DOMContentLoaded', async () => {
    await loadAndRenderEmployees();
    setupFilters();
    setupEmployeeActions();
    await loadRecentActivitiesOnEmployeesPage();
    loadDepartments();
    loadWorksites();
});

async function loadRecentActivitiesOnEmployeesPage() {
    const container = document.getElementById('recentActivities');
    if (!container) return;
    container.innerHTML = '<div style="color:#888;font-size:13px;">Loading recent activities...</div>';
    try {
        // Use fetchApi from api-mock.js if available
        const fetchFunction = typeof fetchApi !== 'undefined' ? fetchApi : fetch;
        const res = await fetchFunction('/api/dashboard/recent-activities');
        const data = await res.json();
        if (!data.recent || !data.recent.length) {
            container.innerHTML = '<div style="color:#888;font-size:13px;">No recent activities.</div>';
            return;
        }

        // Get the first 10 activities for recent display
        const recentActivities = data.recent.slice(0, 10);
        const hasMore = data.recent.length > 10;

        container.innerHTML = `
            <div class="activities-header">
                <h3>Recent Activities</h3>
                ${hasMore ? '<button id="viewAllActivities" class="view-all-btn">View All</button>' : ''}
            </div>
            <div class="activities-list"></div>
        `;

        const activitiesList = container.querySelector('.activities-list');
        recentActivities.forEach(activity => {
            const div = document.createElement('div');
            div.className = 'activity-item';
            let actionType = activity.action || 'updated';
            let actionLabel = '';
            let actionColor = '#2196F3';
            let actionIcon = '✏️';
            if (actionType === 'added' || actionType === 'add') {
                actionLabel = 'Added';
                actionColor = '#43a047';
                actionIcon = '➕';
            } else if (actionType === 'deleted' || actionType === 'delete') {
                actionLabel = 'Deleted';
                actionColor = '#e53935';
                actionIcon = '🗑️';
            } else {
                actionLabel = 'Edited';
                actionColor = '#2196F3';
                actionIcon = '✏️';
            }
            let user = activity.by || activity.user || 'You';
            let time = activity.time || activity.timestamp || '';
            div.innerHTML = `<span style="color:${actionColor};font-weight:bold;">${actionIcon} ${actionLabel}</span> <b>${activity['Employee Name']}</b> (${activity.Designation})<span style="color:#888;"> by ${user}</span> <span style="color:#555; font-size:12px;">${time}</span>`;
            activitiesList.appendChild(div);
        });

        // Add modal for viewing all activities
        if (hasMore) {
            const modal = document.createElement('div');
            modal.id = 'allActivitiesModal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>All Activities</h2>
                        <span class="close-btn">&times;</span>
                    </div>
                    <div class="all-activities-list">
                        ${data.recent.map(activity => {
                            let actionType = activity.action || 'updated';
                            let actionLabel = '';
                            let actionColor = '#2196F3';
                            let actionIcon = '✏️';
                            if (actionType === 'added' || actionType === 'add') {
                                actionLabel = 'Added';
                                actionColor = '#43a047';
                                actionIcon = '➕';
                            } else if (actionType === 'deleted' || actionType === 'delete') {
                                actionLabel = 'Deleted';
                                actionColor = '#e53935';
                                actionIcon = '🗑️';
                            } else {
                                actionLabel = 'Edited';
                                actionColor = '#2196F3';
                                actionIcon = '✏️';
                            }
                            let user = activity.by || activity.user || 'You';
                            let time = activity.time || activity.timestamp || '';
                            return `
                                <div class="activity-item">
                                    <span style="color:${actionColor};font-weight:bold;">${actionIcon} ${actionLabel}</span> 
                                    <b>${activity['Employee Name']}</b> (${activity.Designation})
                                    <span style="color:#888;"> by ${user}</span> 
                                    <span style="color:#555; font-size:12px;">${time}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            // Add event listeners for modal
            document.getElementById('viewAllActivities').addEventListener('click', () => {
                modal.style.display = 'block';
            });

            modal.querySelector('.close-btn').addEventListener('click', () => {
                modal.style.display = 'none';
            });

            window.addEventListener('click', (event) => {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }
    } catch (err) {
        container.innerHTML = '<div style="color:#c00;">Failed to load recent activities.</div>';
        console.error('Failed to load activities:', err);
    }
}


function setupEmployeeActions() {
    // Add Employee
    const addEmployeeBtn = document.getElementById('addEmployeeBtn');
    if (addEmployeeBtn) {
        addEmployeeBtn.addEventListener('click', () => {
            showEmployeeModal();
        });
    }

    // Setup image preview
    const imageInput = document.getElementById('image');
    const imagePreview = document.getElementById('imagePreview');
    
    imageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        } else {
            imagePreview.innerHTML = '';
        }
    });

    // Delegate Edit, View, Delete
    document.getElementById('employeesGrid').addEventListener('click', async (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        
        const id = btn.dataset.id;
        const emp = window._allEmployees.find(emp => emp['EMP NO'] === id);
        
        if (!emp) {
            console.error('Employee not found:', id);
            return;
        }
        
        if (btn.classList.contains('view-btn')) {
            showViewEmployeeModal(emp);
        } else if (btn.classList.contains('edit-btn')) {
            showEmployeeModal(emp, false);
        } else if (btn.classList.contains('delete-btn')) {
            if (!confirm(`Are you sure you want to delete employee ${emp['Employee Name']} (${emp['EMP NO']})?`)) return;
            
            try {
                const response = await fetch(`/api/employees/${emp['EMP NO']}`, { 
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    await loadAndRenderEmployees();
                    await loadRecentActivitiesOnEmployeesPage();
                    alert('Employee deleted successfully');
                } else {
                    const errorData = await response.json();
                    alert('Failed to delete employee: ' + (errorData.error || 'Unknown error'));
                }
            } catch (err) {
                console.error('Error deleting employee:', err);
                alert('Error deleting employee: ' + err.message);
            }
        }
    });

    // Modal Save (form submit)
    document.getElementById('employeeForm').onsubmit = async function (e) {
        e.preventDefault();
        const modal = document.getElementById('employeeModal');
        const isEdit = modal.dataset.id;
        
        try {
            const formData = collectEmployeeFormData();
            let response;
            
            if (isEdit) {
                response = await fetch(`/api/employees/${isEdit}`, {
                    method: 'PUT',
                    body: formData // FormData handles content-type automatically
                });
            } else {
                response = await fetch('/api/employees', {
                    method: 'POST',
                    body: formData // FormData handles content-type automatically
                });
            }

            if (response.ok) {
                closeEmployeeModal();
                await loadAndRenderEmployees();
                await loadRecentActivitiesOnEmployeesPage();
            } else {
                const errorData = await response.json();
                alert('Failed to save employee: ' + (errorData.error || 'Unknown error'));
            }
        } catch (err) {
            console.error('Error saving employee:', err);
            alert('Failed to save employee: ' + err.message);
        }
    };

    // Cancel/close buttons
    document.querySelectorAll('.close-btn, .cancel-btn').forEach(btn => {
        btn.onclick = function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        };
    });

    // Click outside to close
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    };
}

function showEmployeeModal(emp = {}, readOnly = false) {
    const modal = document.getElementById('employeeModal');
    const form = document.getElementById('employeeForm');
    document.getElementById('modalTitle').innerText = emp['EMP NO'] ? (readOnly ? 'View Employee' : 'Edit Employee') : 'Add Employee';

    // Populate dropdowns
    const employees = window._allEmployees || [];
    const getUnique = (arr, field) => [...new Set(arr.map(e => (e[field] || e[field.replace(/ /g, '')] || '').trim()).filter(Boolean))];
    const departmentOptions = getUnique(employees, 'Department');
    const designationOptions = getUnique(employees, 'Designation');
    const worksiteOptions = getUnique(employees, 'Work Site');
    form.department.innerHTML = '<option value="">Select</option>' + departmentOptions.map(opt => `<option value="${opt}">${opt}</option>`).join('');
    form.designation.innerHTML = '<option value="">Select</option>' + designationOptions.map(opt => `<option value="${opt}">${opt}</option>`).join('');
    form.worksite.innerHTML = '<option value="">Select</option>' + worksiteOptions.map(opt => `<option value="${opt}">${opt}</option>`).join('');

    // Populate fields
    form.name.value = emp['Employee Name'] || '';
    form.employeeNumber.value = emp['EMP NO'] || generateEmployeeNumber();
    form.gender.value = emp.Gender || '';
    form.nationality.value = emp.Nationality || '';
    form.city.value = emp['city / island'] || '';
    
    // Enable date fields
    form.dob.value = emp['Date of Birth'] ? formatDateForInput(emp['Date of Birth']) : '';
    form.dob.disabled = false;
    form.dob.style.backgroundColor = '#ffffff';
    
    form.joinedDate.value = emp['Joined Date'] ? formatDateForInput(emp['Joined Date']) : '';
    form.joinedDate.disabled = false;
    form.joinedDate.style.backgroundColor = '#ffffff';
    
    form.mobile.value = emp['Mobile Number (Work no)'] || '';
    form.designation.value = emp.Designation || '';
    form.department.value = emp.Department || '';
    form.worksite.value = emp['Work Site'] || '';
    form.salary_usd.value = emp['salary (USD)'] || '';
    form.salary_mvr.value = emp['salary (MVR)'] || '';

    // Reset file input and show image preview if exists
    form.image.value = ''; // Reset file input
    const imagePreview = document.getElementById('imagePreview');
    if (emp.image) {
        imagePreview.innerHTML = `<img src="${emp.image}" alt="Employee preview">`;
    } else {
        imagePreview.innerHTML = '';
    }

    // Set fields readonly in view mode
    [...form.elements].forEach(el => {
        if (el.tagName === 'BUTTON') return;
        if (el.type === 'file') {
            el.disabled = readOnly;
        } else {
            el.readOnly = readOnly;
        }
    });

    // Show/hide save button
    const saveBtn = form.querySelector('.save-btn');
    saveBtn.style.display = readOnly ? 'none' : '';

    // Set modal data-id for editing
    modal.dataset.id = emp['EMP NO'] || '';
    modal.style.display = 'block';
}

function generateEmployeeNumber() {
    // Get all current employee numbers
    const employees = window._allEmployees || [];
    const empNums = employees.map(emp => {
        const num = emp['EMP NO']?.replace('FEM', '') || '0';
        return parseInt(num, 10);
    }).filter(num => !isNaN(num));

    // Find the highest number and add 1
    const highestNum = Math.max(0, ...empNums);
    const nextNum = (highestNum + 1).toString().padStart(3, '0');
    return 'FEM' + nextNum;
}


function collectEmployeeFormData() {
    const form = document.getElementById('employeeForm');
    const formData = new FormData();
    
    formData.append('Employee Name', form.name.value);
    formData.append('EMP NO', form.employeeNumber.value);
    formData.append('Joined Date', form.joinedDate.value);
    formData.append('Work Site', form.worksite.value);
    formData.append('Gender', form.gender.value);
    formData.append('Department', form.department.value);
    formData.append('Designation', form.designation.value);
    formData.append('Nationality', form.nationality.value);
    formData.append('city / island', form.city.value);
    formData.append('Date of Birth', form.dob.value);
    formData.append('Mobile Number (Work no)', form.mobile.value);
    formData.append('salary (USD)', form.salary_usd.value);
    formData.append('salary (MVR)', form.salary_mvr.value);

    // Handle image file
    const imageFile = form.image.files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }

    return formData;
}

function closeEmployeeModal() {
    const modal = document.getElementById('employeeModal');
    modal.style.display = 'none';
    modal.dataset.id = '';
    document.getElementById('employeeForm').reset();
}

// Utility to convert date to yyyy-mm-dd for input fields
function formatDateForInput(dateStr) {
    if (!dateStr) return '';
    // Accepts formats like 21-Mar-11 and converts to yyyy-mm-dd
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        const months = {
            Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
            Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
        };
        let year = parts[2];
        if (year.length === 2) year = '20' + year;
        return `${year}-${months[parts[1]]}-${parts[0].padStart(2, '0')}`;
    }
    return dateStr;
}

// Separate View Employee Modal logic from Edit Modal
function showViewEmployeeModal(emp = {}) {
    const modal = document.getElementById('viewEmployeeModal');
    const details = document.getElementById('employeeDetails');
    
    details.innerHTML = `
        <div class="view-employee-content">
            <div class="employee-image-section">
                <img src="${emp.image || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNlMWU1ZTgiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjM1IiByPSIyMCIgZmlsbD0iI2M0YzRjNCIvPjxwYXRoIGQ9Ik0yMCw4NWMwLTIwLDE1LTM1LDMwLTM1czMwLDE1LDMwLDM1IiBmaWxsPSIjYzRjNGM0Ii8+PC9zdmc+'}" 
                    class="employee-detail-image" alt="${emp['Employee Name'] || 'Employee'}">
            </div>
            <div class="employee-info-section">
                <h2>${emp['Employee Name'] || 'N/A'}</h2>
                <div class="detail-grid">
                    <div class="detail-item">
                        <strong>Employee #:</strong>
                        <span>${emp['EMP NO'] || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Department:</strong>
                        <span>${emp['Department'] || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Designation:</strong>
                        <span>${emp['Designation'] || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Work Site:</strong>
                        <span>${emp['Work Site'] || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Joined Date:</strong>
                        <span>${emp['Joined Date'] || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Gender:</strong>
                        <span>${emp['Gender'] || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Nationality:</strong>
                        <span>${emp['Nationality'] || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <strong>City/Island:</strong>
                        <span>${emp['city / island'] || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Mobile:</strong>
                        <span>${emp['Mobile Number (Work no)'] || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Date of Birth:</strong>
                        <span>${emp['Date of Birth'] || 'N/A'}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}


async function loadAndRenderEmployees() {
    try {
        // Use fetchApi from api-mock.js if available
        const fetchFunction = typeof fetchApi !== 'undefined' ? fetchApi : fetch;
        const response = await fetchFunction('/api/employees');
        const employees = await response.json();
        
        // Store all employees globally for filtering
        window._allEmployees = employees;
        
        // Render employee grid
        renderEmployeeGrid(employees);
        
        // Populate worksite filter
        populateWorksiteFilter(employees);
        
        // Create charts based on employee data
        await loadAndCreateCharts();
        
    } catch (error) {
        console.error('Error loading employees:', error);
        document.getElementById('employeesGrid').innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load employees. Please try again later.</p>
            </div>
        `;
    }
}

function renderEmployeeGrid(employees) {
    const grid = document.getElementById('employeesGrid');
    grid.innerHTML = '';
    
    if (!employees || employees.length === 0) {
        grid.innerHTML = '<div class="no-employees">No employees found</div>';
        return;
    }
    
    employees.forEach(emp => {
        const card = document.createElement('div');
        card.className = 'employee-card';
        
        const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNlMWU1ZTgiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjM1IiByPSIyMCIgZmlsbD0iI2M0YzRjNCIvPjxwYXRoIGQ9Ik0yMCw4NWMwLTIwLDE1LTM1LDMwLTM1czMwLDE1LDMwLDM1IiBmaWxsPSIjYzRjNGM0Ii8+PC9zdmc+';
        const imageUrl = emp.image || defaultAvatar;
        
        card.innerHTML = `
            <img src="${imageUrl}" alt="${emp['Employee Name'] || 'Employee'}" class="employee-image" onerror="this.src='${defaultAvatar}'">
            <div class="employee-info">
                <h3 class="employee-name">${emp['Employee Name'] || 'N/A'}</h3>
                <div class="employee-details">
                    <p><strong>EMP NO:</strong> ${emp['EMP NO'] || 'N/A'}</p>
                    <p><strong>Designation:</strong> ${emp['Designation'] || 'N/A'}</p>
                    <p><strong>Department:</strong> ${emp['Department'] || 'N/A'}</p>
                    <p><strong>Work Site:</strong> ${emp['Work Site'] || 'N/A'}</p>
                    <p><strong>Joined:</strong> ${emp['Joined Date'] || 'N/A'}</p>
                </div>
            </div>
            <div class="employee-actions">
                <button class="action-btn view-btn" data-id="${emp['EMP NO']}">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="action-btn edit-btn" data-id="${emp['EMP NO']}">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="action-btn delete-btn" data-id="${emp['EMP NO']}">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function populateWorksiteFilter(employees) {
    const filter = document.getElementById('worksiteFilter');
    if (!filter) return;
    
    // Extract all possible worksite values, checking all possible field names
    const worksites = [...new Set(employees.map(e => {
        // Check all possible field names for worksite
        return e.Worksite || e['Work Site'] || e.workSite || e.worksite || 'Unknown';
    }).filter(Boolean))];
    
    // Sort worksites alphabetically for better UX
    worksites.sort();
    
    // Populate the filter dropdown
    filter.innerHTML = '<option value="">All Worksites</option>' +
        worksites.map(w => `<option value="${w}">${w}</option>`).join('');
}

function setupFilters() {
    const searchInput = document.getElementById('searchInput');
    const worksiteFilter = document.getElementById('worksiteFilter');
    searchInput.addEventListener('input', filterEmployees);
    worksiteFilter.addEventListener('change', filterEmployees);
}

function filterEmployees() {
    const searchValue = document.getElementById('searchInput').value.toLowerCase();
    const worksiteValue = document.getElementById('worksiteFilter').value;
    const employees = window._allEmployees || [];
    
    const filtered = employees.filter(emp => {
        const matchesSearch = emp['Employee Name']?.toLowerCase().includes(searchValue) ||
                            emp['EMP NO']?.toLowerCase().includes(searchValue) ||
                            emp['Designation']?.toLowerCase().includes(searchValue) ||
                            emp['Department']?.toLowerCase().includes(searchValue);
        
        // Check all possible worksite field names
        const empWorksite = emp['Worksite'] || emp['Work Site'] || emp.workSite || emp.worksite || '';
        const matchesWorksite = !worksiteValue || empWorksite === worksiteValue;
        
        return matchesSearch && matchesWorksite;
    });
    
    renderEmployeeGrid(filtered);
    
    // Update charts with filtered data
    loadAndCreateCharts();
}

// Update dashboard statistics and create charts based on employee data
async function loadAndCreateCharts() {
    try {
        const employees = window._allEmployees || [];
        if (!employees.length) return;
        
        // Create department distribution chart
        createDepartmentChart(employees);
        
        // Create worksite distribution chart
        createWorksiteChart(employees);
        
        // Create gender distribution chart
        createGenderChart(employees);
    } catch (error) {
        console.error('Error creating employee charts:', error);
    }
}

// Create department distribution chart
function createDepartmentChart(employees) {
    const canvas = document.getElementById('departmentChart');
    if (!canvas) return;
    
    // Clear any existing chart
    if (window.chartInstances && window.chartInstances['departmentChart']) {
        window.chartInstances['departmentChart'].destroy();
    }
    
    // Group employees by department
    const departmentCounts = {};
    employees.forEach(emp => {
        const dept = emp['Department'] || 'Unknown';
        departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
    });
    
    // Prepare data for chart
    const data = Object.entries(departmentCounts).map(([name, count]) => ({ name, count }));
    
    // Create chart
    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.map(item => item.name),
            datasets: [{
                data: data.map(item => item.count),
                backgroundColor: [
                    '#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b',
                    '#5a5c69', '#858796', '#6f42c1', '#20c9a6', '#f8f9fc'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Department Distribution',
                    font: { size: 16 }
                },
                legend: {
                    position: 'bottom',
                    padding: 20
                }
            }
        }
    });
    
    // Store chart instance
    if (!window.chartInstances) window.chartInstances = {};
    window.chartInstances['departmentChart'] = chart;
}

// Create worksite distribution chart
function createWorksiteChart(employees) {
    const canvas = document.getElementById('worksiteChart');
    if (!canvas) return;
    
    // Clear any existing chart
    if (window.chartInstances && window.chartInstances['worksiteChart']) {
        window.chartInstances['worksiteChart'].destroy();
    }
    
    // Group employees by worksite
    const worksiteCounts = {};
    employees.forEach(emp => {
        // Check all possible field names for worksite
        const worksite = emp['Worksite'] || emp['Work Site'] || emp.workSite || emp.worksite || 'Unknown';
        worksiteCounts[worksite] = (worksiteCounts[worksite] || 0) + 1;
    });
    
    // Prepare data for chart
    const data = Object.entries(worksiteCounts).map(([name, count]) => ({ name, count }));
    
    // Sort data by count in descending order
    data.sort((a, b) => b.count - a.count);
    
    // Create chart
    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.map(item => item.name),
            datasets: [{
                data: data.map(item => item.count),
                backgroundColor: [
                    '#36b9cc', '#1cc88a', '#4e73df', '#f6c23e', '#e74a3b',
                    '#5a5c69', '#858796', '#6f42c1', '#20c9a6', '#f8f9fc'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Worksite Distribution',
                    font: { size: 16 }
                },
                legend: {
                    position: 'bottom',
                    padding: 20
                }
            }
        }
    });
    
    // Store chart instance
    if (!window.chartInstances) window.chartInstances = {};
    window.chartInstances['worksiteChart'] = chart;
}

// Create gender distribution chart
function createGenderChart(employees) {
    const canvas = document.getElementById('genderChart');
    if (!canvas) return;
    
    // Clear any existing chart
    if (window.chartInstances && window.chartInstances['genderChart']) {
        window.chartInstances['genderChart'].destroy();
    }
    
    // Group employees by gender
    const genderCounts = {};
    employees.forEach(emp => {
        // Check all possible field names for gender and normalize values
        let gender = emp['Gender'] || emp['gender'] || 'Unknown';
        
        // Normalize gender values for consistency
        if (gender.toLowerCase() === 'male' || gender.toLowerCase() === 'm') {
            gender = 'Male';
        } else if (gender.toLowerCase() === 'female' || gender.toLowerCase() === 'f') {
            gender = 'Female';
        }
        
        genderCounts[gender] = (genderCounts[gender] || 0) + 1;
    });
    
    // Prepare data for chart
    const data = Object.entries(genderCounts).map(([name, count]) => ({ name, count }));
    
    // Create chart
    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.map(item => item.name),
            datasets: [{
                data: data.map(item => item.count),
                backgroundColor: [
                    '#4e73df', '#e74a3b', '#1cc88a', '#f6c23e', '#36b9cc',
                    '#5a5c69', '#858796', '#6f42c1', '#20c9a6', '#f8f9fc'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Gender Distribution',
                    font: { size: 16 }
                },
                legend: {
                    position: 'bottom',
                    padding: 20
                }
            }
        }
    });
    
    // Store chart instance
    if (!window.chartInstances) window.chartInstances = {};
    window.chartInstances['genderChart'] = chart;
}

// Department and Worksite Management
async function loadDepartments() {
    try {
        // Use fetchApi from api-mock.js if available
        const fetchFunction = typeof fetchApi !== 'undefined' ? fetchApi : fetch;
        const response = await fetchFunction('/api/departments');
        const departments = await response.json();
        renderDepartments(departments);
        updateDepartmentSelect(departments);
    } catch (err) {
        console.error('Error loading departments:', err);
    }
}

async function loadWorksites() {
    try {
        // Use fetchApi from api-mock.js if available
        const fetchFunction = typeof fetchApi !== 'undefined' ? fetchApi : fetch;
        const response = await fetchFunction('/api/worksites');
        const worksites = await response.json();
        renderWorksites(worksites);
        updateWorksiteSelect(worksites);
    } catch (err) {
        console.error('Error loading worksites:', err);
    }
}

function renderDepartments(departments) {
    const container = document.getElementById('departments-container');
    container.innerHTML = departments.map(dept => `
        <div class="department-item" data-id="${dept.id}">
            <div class="item-info">
                <h5>${dept.name}</h5>
                <p>${dept.code}</p>
            </div>
            <div class="item-actions">
                <button class="edit-btn" onclick="editDepartment('${dept.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" onclick="deleteDepartment('${dept.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function renderWorksites(worksites) {
    const container = document.getElementById('worksites-container');
    container.innerHTML = worksites.map(site => `
        <div class="worksite-item" data-id="${site.id}">
            <div class="item-info">
                <h5>${site.name}</h5>
                <p>${site.location}</p>
            </div>
            <div class="item-actions">
                <button class="edit-btn" onclick="editWorksite('${site.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" onclick="deleteWorksite('${site.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Department form handling
document.getElementById('department-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = {
        name: document.getElementById('department-name').value,
        code: document.getElementById('department-code').value,
        description: document.getElementById('department-description').value
    };

    try {
        const response = await fetch('/api/departments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            document.getElementById('department-form').reset();
            loadDepartments();
        }
    } catch (err) {
        console.error('Error adding department:', err);
    }
});

// Worksite form handling
document.getElementById('worksite-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = {
        name: document.getElementById('worksite-name').value,
        location: document.getElementById('worksite-location').value,
        description: document.getElementById('worksite-description').value
    };

    try {
        const response = await fetch('/api/worksites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            document.getElementById('worksite-form').reset();
            loadWorksites();
        }
    } catch (err) {
        console.error('Error adding worksite:', err);
    }
});

async function editDepartment(id) {
    try {
        const response = await fetch(`/api/departments/${id}`);
        const dept = await response.json();
        document.getElementById('department-name').value = dept.name;
        document.getElementById('department-code').value = dept.code;
        document.getElementById('department-description').value = dept.description;
        document.getElementById('department-form').dataset.editId = id;
    } catch (err) {
        console.error('Error loading department:', err);
    }
}

async function editWorksite(id) {
    try {
        const response = await fetch(`/api/worksites/${id}`);
        const site = await response.json();
        document.getElementById('worksite-name').value = site.name;
        document.getElementById('worksite-location').value = site.location;
        document.getElementById('worksite-description').value = site.description;
        document.getElementById('worksite-form').dataset.editId = id;
    } catch (err) {
        console.error('Error loading worksite:', err);
    }
}

async function deleteDepartment(id) {
    if (confirm('Are you sure you want to delete this department?')) {
        try {
            const response = await fetch(`/api/departments/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                loadDepartments();
            }
        } catch (err) {
            console.error('Error deleting department:', err);
        }
    }
}

async function deleteWorksite(id) {
    if (confirm('Are you sure you want to delete this worksite?')) {
        try {
            const response = await fetch(`/api/worksites/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                loadWorksites();
            }
        } catch (err) {
            console.error('Error deleting worksite:', err);
        }
    }
}

// Update selects
function updateDepartmentSelect(departments) {
    const select = document.getElementById('department');
    select.innerHTML = '<option value="">Select</option>' + 
        departments.map(dept => `<option value="${dept.id}">${dept.name}</option>`).join('');
}

function updateWorksiteSelect(worksites) {
    const select = document.getElementById('worksite');
    select.innerHTML = '<option value="">Select</option>' + 
        worksites.map(site => `<option value="${site.id}">${site.name}</option>`).join('');
}

// Initialize department and worksite management
document.addEventListener('DOMContentLoaded', () => {
    loadDepartments();
    loadWorksites();
});
