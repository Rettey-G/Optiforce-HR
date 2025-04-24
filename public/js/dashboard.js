// dashboard.js: Dynamic dashboard for Optiforce HR
// Fetch stats and recent activities from backend API and render charts

document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
        window.location.href = 'login.html';
        return;
    }

    await fetchDashboardData();
    await loadRecentActivities();
    setupActivitiesModal();
    setInterval(loadRecentActivities, 30000); // Reload every 30 seconds
});

// Fetch and process dashboard data
async function fetchDashboardData() {
    try {
        // Use fetchApi from api-mock.js if it exists, otherwise use regular fetch
        const fetchFunction = typeof fetchApi !== 'undefined' ? fetchApi : fetch;
        const response = await fetchFunction('/api/dashboard/stats');
        const data = await response.json();
        updateDashboardStats(data);
        createCharts(data);
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
    }
}

// Update dashboard statistics
function updateDashboardStats(data) {
    try {
        // Update total employees
        const totalEmployeesElement = document.getElementById('total-employees');
        if (totalEmployeesElement) {
            totalEmployeesElement.textContent = data.totalEmployees || 0;
        }

        // Update department stats
        const departmentStatsList = document.getElementById('department-stats');
        if (departmentStatsList) {
            departmentStatsList.innerHTML = '';
            // Use departmentDistribution if available, otherwise fallback
            const deptData = data.departmentDistribution || data.byDepartment || [];
            deptData.forEach(dept => {
                const li = document.createElement('li');
                li.textContent = `${dept.name}: ${dept.count}`;
                departmentStatsList.appendChild(li);
            });
        }

        // Update total departments
        const totalDepartmentsElement = document.getElementById('total-departments');
        if (totalDepartmentsElement) {
            // Use departments if available, otherwise fallback to departmentDistribution
            const departments = data.departments || [];
            const deptCount = departments.length || (data.departmentDistribution ? data.departmentDistribution.length : 0);
            totalDepartmentsElement.textContent = deptCount;
        }

        // Update total nationalities (fallback to 0 if not available)
        const totalNationalitiesElement = document.getElementById('total-nationalities');
        if (totalNationalitiesElement) {
            totalNationalitiesElement.textContent = data.byNationality ? data.byNationality.length : 0;
        }

        // Update total worksites
        const totalWorksitesElement = document.getElementById('total-worksites');
        if (totalWorksitesElement) {
            // Use worksites if available, otherwise fallback
            const worksites = data.worksites || data.byWorksite || [];
            totalWorksitesElement.textContent = worksites.length;
        }
    } catch (error) {
        console.error('Error updating dashboard stats:', error);
    }
}

// Create charts
function createCharts(data) {
    try {
        // Department Chart
        const deptData = data.departmentDistribution || data.byDepartment || [];
        if (deptData.length > 0) {
            createPieChart('departmentChart', deptData, 'Department Distribution');
        }

        // Nationality Chart - fallback to mock data if not available
        const nationalityData = data.byNationality || [
            { name: 'Maldivian', count: 5 },
            { name: 'Bangladeshi', count: 7 },
            { name: 'Indian', count: 3 }
        ];
        createPieChart('nationalityChart', nationalityData, 'Nationality Distribution');

        // Employee Growth Chart - fallback to mock data if not available
        const growthData = data.employeeGrowth || [
            { month: 'Jan', count: 5 },
            { month: 'Feb', count: 7 },
            { month: 'Mar', count: 10 },
            { month: 'Apr', count: 12 },
            { month: 'May', count: 15 }
        ];
        createLineChart('employeeGrowthChart', growthData, 'Employee Growth');

        // Gender Distribution Chart - fallback to mock data if not available
        const genderData = data.byGender || [
            { name: 'Male', count: 12 },
            { name: 'Female', count: 3 }
        ];
        createPieChart('genderChart', genderData, 'Gender Distribution');
    } catch (error) {
        console.error('Error creating charts:', error);
    }
}

// Helper function to create pie charts
function createPieChart(elementId, data, title) {
    const canvas = document.getElementById(elementId);
    if (!canvas || !data || data.length === 0) return;

    try {
        const ctx = canvas.getContext('2d');
        new Chart(ctx, {
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
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: title,
                        font: { size: 16 }
                    },
                    legend: {
                        position: 'bottom',
                        padding: 20
                    }
                }
            }
        });
    } catch (error) {
        console.error(`Error creating pie chart ${elementId}:`, error);
    }
}

// Helper function to create line chart
function createLineChart(canvasId, data, title) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !data || data.length === 0) return;

    try {
        const ctx = canvas.getContext('2d');
        
        // Check if data has month or year property
        const hasMonth = data[0].hasOwnProperty('month');
        const hasYear = data[0].hasOwnProperty('year');
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(item => hasMonth ? item.month : (hasYear ? item.year : '')),
                datasets: [{
                    label: 'Employees',
                    data: data.map(item => item.count),
                    borderColor: '#4e73df',
                    backgroundColor: 'rgba(78, 115, 223, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: title,
                        font: { size: 16 }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error(`Error creating line chart ${canvasId}:`, error);
    }
}

// Setup activities modal
function setupActivitiesModal() {
    const modal = document.getElementById('activitiesModal');
    const viewAllBtn = document.getElementById('viewAllActivities');
    const closeBtn = document.querySelector('.close');

    viewAllBtn.onclick = function() {
        modal.style.display = 'block';
        loadAllActivities();
    }

    closeBtn.onclick = function() {
        modal.style.display = 'none';
    }

    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    }
}

// Load recent activities (max 10)
async function loadRecentActivities() {
    try {
        // Use fetchApi from api-mock.js if it exists, otherwise use regular fetch
        const fetchFunction = typeof fetchApi !== 'undefined' ? fetchApi : fetch;
        const res = await fetchFunction('/api/dashboard/recent-activities');
        const data = await res.json();
        
        const container = document.getElementById('activitiesList');
        if (!container) return;

        renderActivities(container, data.recent ? data.recent.slice(0, 10) : data.slice(0, 10));
    } catch (err) {
        console.error('Failed to load recent activities:', err);
    }
}

// Load all activities for modal
async function loadAllActivities() {
    try {
        // Use fetchApi from api-mock.js if it exists, otherwise use regular fetch
        const fetchFunction = typeof fetchApi !== 'undefined' ? fetchApi : fetch;
        const res = await fetchFunction('/api/dashboard/recent-activities');
        const data = await res.json();
        
        const container = document.getElementById('allActivitiesList');
        if (!container) return;

        renderActivities(container, data.recent || data);
    } catch (err) {
        console.error('Failed to load all activities:', err);
    }
}

// Helper function to render activities
function renderActivities(container, activities) {
    container.innerHTML = '';
    
    // Show reload time
    const reloadTime = document.createElement('div');
    reloadTime.className = 'reload-time';
    reloadTime.textContent = 'Last updated: ' + new Date().toLocaleTimeString();
    container.appendChild(reloadTime);

    if (activities && activities.length > 0) {
        activities.forEach(activity => {
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
                actionLabel = 'Updated';
                actionColor = '#2196F3';
                actionIcon = '✏️';
            }

            const time = new Date(activity.timestamp).toLocaleString();
            div.innerHTML = `
                <span style="color:${actionColor};">${actionIcon} ${actionLabel}</span>
                <span class="activity-details">${activity.details}</span>
                <span class="activity-time">${time}</span>
            `;
            container.appendChild(div);
        });
    } else {
        const noActivities = document.createElement('div');
        noActivities.className = 'no-activities';
        noActivities.textContent = 'No recent activities';
        container.appendChild(noActivities);
    }
}
