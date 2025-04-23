// attendance.js: Logic for Attendance Management Page
import { loadRecentActivitiesOnEmployeesPage } from './employees.js';

document.addEventListener('DOMContentLoaded', async () => {
    setupSelectors();
    setupTimesheetControls();
    await loadTimesheet();
    await loadAttendanceSummary();
    await loadRecentActivitiesOnEmployeesPage();
});

function setupSelectors() {
    // Populate employee dropdown (dummy data for demo)
    const select = document.getElementById('employee-select');
    select.innerHTML += '<option value="emp1">John Doe</option><option value="emp2">Jane Smith</option>';
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
    // Dummy table for demo
    wrapper.innerHTML = `<table class="timesheet-table"><thead><tr><th>Date</th><th>Clock In</th><th>Clock Out</th><th>Status</th></tr></thead><tbody>
        <tr><td>2025-04-14</td><td>08:55</td><td>17:03</td><td>Present</td></tr>
        <tr><td>2025-04-15</td><td>09:10</td><td>17:00</td><td>Late</td></tr>
        <tr><td>2025-04-16</td><td>08:57</td><td>16:55</td><td>Present</td></tr>
        <tr><td>2025-04-17</td><td>08:50</td><td>17:05</td><td>Present</td></tr>
        <tr><td>2025-04-18</td><td>09:05</td><td>16:50</td><td>Absent</td></tr>
        <tr><td>2025-04-19</td><td>08:59</td><td>17:02</td><td>Present</td></tr>
        <tr><td>2025-04-20</td><td>08:56</td><td>17:01</td><td>Present</td></tr>
    </tbody></table>`;
}

async function loadAttendanceSummary() {
    document.getElementById('present-count').textContent = 5;
    document.getElementById('absent-count').textContent = 1;
    document.getElementById('overtime-hours').textContent = '2 hrs';
    document.getElementById('sick-count').textContent = 0;
}

function setupTimesheetControls() {
    document.getElementById('save-timesheet-btn').onclick = () => {
        alert('Timesheet saved! (Demo only)');
    };
    document.getElementById('print-timesheet-btn').onclick = () => {
        window.print();
    };
}
