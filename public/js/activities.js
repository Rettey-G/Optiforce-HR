// activities.js: Real-time recent activities

document.addEventListener('DOMContentLoaded', () => {
    loadRecentActivities();
    setInterval(loadRecentActivities, 10000);
});

async function loadRecentActivities() {
    try {
        // Use fetchApi from api-mock.js if available
        const fetchFunction = typeof fetchApi !== 'undefined' ? fetchApi : fetch;
        const res = await fetchFunction('/api/dashboard/recent-activities');
        const data = await res.json();
        const container = document.getElementById('activities-list');
        container.innerHTML = '';
        // Show reload time for user feedback
        const reloadTime = document.createElement('div');
        reloadTime.className = 'last-updated';
        reloadTime.textContent = 'Last updated: ' + new Date().toLocaleTimeString();
        container.appendChild(reloadTime);
        data.recent.forEach(activity => {
            const div = document.createElement('div');
            div.className = 'activity-item';
            div.innerHTML = `<b>${activity['Employee Name']}</b> joined as <i>${activity.Designation}</i> on <span>${activity['Joined Date']}</span>`;
            container.appendChild(div);
        });
    } catch (err) {
        console.error('Failed to load recent activities', err);
    }
}
