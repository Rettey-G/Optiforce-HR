// dashboard.js: Dynamic dashboard for Optiforce HR
// Fetch stats and recent activities from backend API and render charts

document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
        window.location.href = '/login.html';
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
        const response = await fetch('/api/dashboard/stats');
        const data = await response.json();
        updateDashboardStats(data);
        createCharts(data);
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
    }
}

// Update dashboard statistics
function updateDashboardStats(data) {
    // Update total employees
    document.getElementById('total-employees').textContent = data.totalEmployees;

    // Update department stats
    const departmentStatsList = document.getElementById('department-stats');
    departmentStatsList.innerHTML = '';
    data.byDepartment.forEach(dept => {
        const li = document.createElement('li');
        li.textContent = `${dept.name}: ${dept.count}`;
        departmentStatsList.appendChild(li);
    });

    // Update total departments
    document.getElementById('total-departments').textContent = data.byDepartment.length;

    // Update total nationalities
    document.getElementById('total-nationalities').textContent = data.byNationality.length;

    // Update total worksites
    document.getElementById('total-worksites').textContent = data.byWorksite.length;
}

// Create charts
function createCharts(data) {
    // Department Chart
    createPieChart('departmentChart', data.byDepartment, 'Department Distribution');

    // Nationality Chart
    createPieChart('nationalityChart', data.byNationality, 'Nationality Distribution');

    // Worksite Chart
    createPieChart('worksiteChart', data.byWorksite, 'Worksite Distribution');

    // Gender Chart
    createPieChart('genderChart', data.byGender, 'Gender Distribution');

    // Growth Chart
    createLineChart('growthChart', data.byYear, 'Employee Growth');
}

// Helper function to create pie charts
function createPieChart(canvasId, data, title) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.map(item => item.name),
            datasets: [{
                data: data.map(item => item.count),
                backgroundColor: [
                    '#4CAF50',
                    '#2196F3',
                    '#FFC107',
                    '#9C27B0',
                    '#FF5722',
                    '#607D8B',
                    '#E91E63',
                    '#00BCD4'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                },
                title: {
                    display: true,
                    text: title,
                    padding: 20
                }
            }
        }
    });
}

// Helper function to create line chart
function createLineChart(canvasId, data, title) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(item => item.year),
            datasets: [{
                label: 'Employees',
                data: data.map(item => item.count),
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: title,
                    padding: 20
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
        const res = await fetch('/api/dashboard/recent-activities');
        const data = await res.json();
        
        const container = document.getElementById('activitiesList');
        if (!container) return;

        renderActivities(container, data.recent.slice(0, 10));
    } catch (err) {
        console.error('Failed to load recent activities:', err);
    }
}

// Load all activities for modal
async function loadAllActivities() {
    try {
        const res = await fetch('/api/dashboard/recent-activities');
        const data = await res.json();
        
        const container = document.getElementById('allActivitiesList');
        if (!container) return;

        renderActivities(container, data.recent);
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
