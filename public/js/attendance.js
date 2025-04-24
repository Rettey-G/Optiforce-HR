// attendance.js: Logic for Attendance Management Page
import { loadRecentActivitiesOnEmployeesPage } from './employees.js';

document.addEventListener('DOMContentLoaded', async () => {
    setupSelectors();
    setupTimesheetControls();
    await loadTimesheet();
    await loadAttendanceSummary();
    await loadRecentActivitiesOnEmployeesPage();
});

async function setupSelectors() {
    // Populate employee dropdown with real data
    const select = document.getElementById('employee-select');
    try {
        const fetchFunction = typeof fetchApi !== 'undefined' ? fetchApi : fetch;
        const response = await fetchFunction('/api/employees/names');
        if (response.ok) {
            const employees = await response.json();
            select.innerHTML = employees.map(emp => `<option value="${emp.id}">${emp.name}</option>`).join('');
        } else {
            select.innerHTML = '<option value="">No employees found</option>';
        }
    } catch (err) {
        select.innerHTML = '<option value="">Error loading employees</option>';
    }
    // Week selector defaults to this week
    document.getElementById('week-selector').value = getCurrentWeek();
    document.getElementById('load-week-btn').onclick = loadTimesheet;
}

function getCurrentWeek() {
    const now = new Date();
    const year = now.getFullYear();
    const week = (Math.ceil((((now - new Date(year,0,1)) / 86400000) + new Date(year,0,1).getDay()+1)/7));
    return `${year}-W${week.toString().padStart(2,'0')}`;
}

async function loadTimesheet() {
    const wrapper = document.getElementById('timesheet-wrapper');
    const employeeId = document.getElementById('employee-select').value;
    const week = document.getElementById('week-selector').value;
    try {
        const fetchFunction = typeof fetchApi !== 'undefined' ? fetchApi : fetch;
        const response = await fetchFunction(`/api/attendance?employeeId=${employeeId}&week=${week}`);
        if (response.ok) {
            const timesheet = await response.json();
            if (Array.isArray(timesheet) && timesheet.length > 0) {
                wrapper.innerHTML = `<table class="timesheet-table"><thead><tr><th>Date</th><th>Clock In</th><th>Clock Out</th><th>Status</th></tr></thead><tbody>` +
                    timesheet.map(row => `<tr><td>${row.date}</td><td>${row.clockIn}</td><td>${row.clockOut}</td><td>${row.status}</td></tr>`).join('') +
                    `</tbody></table>`;
            } else {
                wrapper.innerHTML = '<div>No attendance records found for this week.</div>';
            }
        } else {
            wrapper.innerHTML = '<div>Error loading timesheet.</div>';
        }
    } catch (err) {
        wrapper.innerHTML = '<div>Error loading timesheet.</div>';
    }
}

async function loadAttendanceSummary() {
    // Fetch attendance summary from API
    try {
        const fetchFunction = typeof fetchApi !== 'undefined' ? fetchApi : fetch;
        const response = await fetchFunction('/api/attendance/summary');
        if (response.ok) {
            const summary = await response.json();
            document.getElementById('present-count').textContent = summary.present || 0;
            document.getElementById('absent-count').textContent = summary.absent || 0;
            document.getElementById('overtime-hours').textContent = summary.overtime || '0 hrs';
            document.getElementById('sick-count').textContent = summary.sick || 0;
        } else {
            document.getElementById('present-count').textContent = 0;
            document.getElementById('absent-count').textContent = 0;
            document.getElementById('overtime-hours').textContent = '0 hrs';
            document.getElementById('sick-count').textContent = 0;
        }
    } catch (err) {
        document.getElementById('present-count').textContent = 0;
        document.getElementById('absent-count').textContent = 0;
        document.getElementById('overtime-hours').textContent = '0 hrs';
        document.getElementById('sick-count').textContent = 0;
    }
}

function setupTimesheetControls() {
    document.getElementById('save-timesheet-btn').onclick = () => {
        alert('Timesheet saved! (Demo only)');
    };
    document.getElementById('print-timesheet-btn').onclick = () => {
        window.print();
    };
}
