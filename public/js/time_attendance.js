// time_attendance.js: Handles logic for the Time & Attendance page
// import { loadRecentActivitiesOnEmployeesPage } from './employees.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log('[DEBUG] DOMContentLoaded fired');
    await populateEmployeeDropdown();
    setupAttendanceButtons();
    setupTimesheetTriggers();
    setupLeaveBalancesButton();
    generateTimesheetTable();
    // Dynamically import and call loadRecentActivitiesOnEmployeesPage if available
    try {
        const employeesModule = await import('./employees.js');
        if (typeof employeesModule.loadRecentActivitiesOnEmployeesPage === 'function') {
            await employeesModule.loadRecentActivitiesOnEmployeesPage();
        } else if (typeof window.loadRecentActivitiesOnEmployeesPage === 'function') {
            await window.loadRecentActivitiesOnEmployeesPage();
        } else {
            console.warn('[DEBUG] loadRecentActivitiesOnEmployeesPage not found as export or on window');
        }
    } catch (err) {
        console.warn('[DEBUG] Dynamic import of employees.js failed:', err);
    }
});

async function populateEmployeeDropdown() {
    console.log('[DEBUG] populateEmployeeDropdown called');
    console.log('[DEBUG] populateEmployeeDropdown called');
    const select = document.getElementById('employee-select');
    select.innerHTML = '<option value="">All Employees</option>';
    try {
        // Use fetchApi from api-mock.js if available
        const fetchFunction = typeof fetchApi !== 'undefined' ? fetchApi : fetch;
        const res = await fetchFunction('/api/employees/names');
        const employees = await res.json();
        console.log('[DEBUG] Employees fetched:', employees);
        if (employees.length === 0) {
            select.innerHTML += '<option disabled>No employees found</option>';
            document.getElementById('timesheet-wrapper').innerHTML = '<div style="color:#c00;padding:24px;">No employees found. Please add employees first.</div>';
            return;
        }
        employees.forEach(emp => {
            select.innerHTML += `<option value="${emp._id}">${emp.name}</option>`;
        });
    } catch (err) {
        select.innerHTML += '<option disabled>Error loading employees</option>';
        document.getElementById('timesheet-wrapper').innerHTML = '<div style="color:#c00;padding:24px;">Error loading employees. Please try again.</div>';
        return;
    }
    document.getElementById('week-selector').value = getCurrentWeek();
    generateTimesheetTable(); // Always show table after loading employees
}

function setupTimesheetTriggers() {
    console.log('[DEBUG] setupTimesheetTriggers called');
    document.getElementById('week-selector').addEventListener('change', generateTimesheetTable);
    document.getElementById('employee-select').addEventListener('change', generateTimesheetTable);
}

async function generateTimesheetTable() {
    console.log('[DEBUG] generateTimesheetTable called');
    const wrapper = document.getElementById('timesheet-wrapper');
    const weekStr = document.getElementById('week-selector').value;
    const weekDates = getWeekDates(weekStr);
    const select = document.getElementById('employee-select');
    if (!select.options.length || select.options.length === 1) {
        wrapper.innerHTML = '<div style="color:#c00;padding:24px;">No employees found. Please add employees to use the timesheet.</div>';
        renderSummaryBox();
        return;
    }
    const employeeId = select.value;
    let existingRecords = [];
    let existingSummary = null;
    if (employeeId) {
        try {
            const res = await fetch(`/api/timesheets?employeeId=${employeeId}&week=${weekStr}`);
            if (res.ok) {
                const timesheet = await res.json();
                if (timesheet && timesheet.records) {
                    existingRecords = timesheet.records;
                }
                if (timesheet && timesheet.summary) {
                    existingSummary = timesheet.summary;
                }
            }
        } catch (err) {
            console.warn('[DEBUG] Could not fetch timesheet for prefill', err);
        }
    }
    const statusOptions = ['Working Day','Off Day','Annual Leave','Maternity Leave','Paternity Leave','Emergency Leave','Family Care','Public Holiday','Absent'];
    // Build table header with Day of Week
    let table = `<table class="timesheet-table"><thead><tr><th>Date</th><th>Day</th><th>Clock In</th><th>Clock Out</th><th>Working Hours</th><th>Status</th></tr></thead><tbody>`;
    weekDates.forEach(date => {
        // Try to find existing record for this date
        const rec = existingRecords.find(r => r.date === date) || {};
        const dayOfWeek = new Date(date).toLocaleString('en-US', { weekday: 'long' });
        // Always show saved values for clockIn, clockOut, and status
        const savedStatus = rec.status || '';
        const savedClockIn = rec.clockIn || '';
        const savedClockOut = rec.clockOut || '';
        const isWorkingDay = savedStatus === 'Working Day';
        table += `<tr><td>${date}</td><td>${dayOfWeek}</td><td><input type="time" class="clock-in" value="${savedClockIn}"${isWorkingDay ? '' : ' disabled'}></td><td><input type="time" class="clock-out" value="${savedClockOut}"${isWorkingDay ? '' : ' disabled'}></td><td class="working-hours">${rec.workingHours || ''}</td><td><select>${statusOptions.map(opt => `<option value="${opt}"${savedStatus===opt?' selected':''}>${opt}</option>`).join('')}</select></td></tr>`;
    });
    table += '</tbody></table>';
    wrapper.innerHTML = table;
    // Show leave history below table
    showLeaveHistory(employeeId);
    // Show all timesheet summaries for this employee
    showAllTimesheetSummaries(employeeId);
    // Add live calculation for working hours
    const rows = wrapper.querySelectorAll('tbody tr');

    // Add logic to enable/disable clock-in/out based on status
    rows.forEach(row => {
        const statusSel = row.querySelector('select');
        const clockIn = row.querySelector('.clock-in');
        const clockOut = row.querySelector('.clock-out');
        function updateClockInputs() {
            // Always allow editing clock-in/out, but gray them out for non-working days
            if (statusSel.value !== 'Working Day') {
                clockIn.style.background = '#f5f5f5';
                clockOut.style.background = '#f5f5f5';
            } else {
                clockIn.style.background = '';
                clockOut.style.background = '';
            }
            clockIn.disabled = false;
            clockOut.disabled = false;
        }
        statusSel.addEventListener('change', updateClockInputs);
        updateClockInputs(); // Initial set
    });
    // Show summary for this employee/week if exists
    if (existingSummary) {
        renderSummaryBox(existingSummary);
    } else {
        renderSummaryBox();
    }
    function computeLiveSummary() {
        let summary = {
            workingDays: 0, offDays: 0, annualLeave: 0, maternityLeave: 0, paternityLeave: 0, emergencyLeave: 0, familyCare: 0, publicHoliday: 0, absent: 0, totalOvertime: 0, totalWorkingHours: 0, sickLeave: 0
        };
        rows.forEach(row => {
            const cells = row.children;
            const clockIn = cells[1].querySelector('input') ? cells[1].querySelector('input').value : '';
            const clockOut = cells[2].querySelector('input') ? cells[2].querySelector('input').value : '';
            let status = '';
const statusSel = cells[4].querySelector('select');
if (statusSel) {
    status = statusSel.value || statusSel.options[statusSel.selectedIndex]?.value || '';
}
            let overtime = 0;
            if (clockIn && clockOut && status === 'Working Day') {
                const [inH, inM] = clockIn.split(':').map(Number);
                const [outH, outM] = clockOut.split(':').map(Number);
                let hours = (outH + outM/60) - (inH + inM/60);
                if (hours < 0) hours += 24;
                hours = Math.round(hours * 100) / 100;
                summary.totalWorkingHours += hours;
                if (hours > 8) overtime = +(hours - 8).toFixed(2);
                else overtime = 0;
                summary.totalOvertime += overtime;
                summary.workingDays++;
            } else {
                // Count leave types, etc.
                if (status === 'Off Day') summary.offDays++;
                else if (status === 'Annual Leave') summary.annualLeave++;
                else if (status === 'Maternity Leave') summary.maternityLeave++;
                else if (status === 'Paternity Leave') summary.paternityLeave++;
                else if (status === 'Emergency Leave') summary.emergencyLeave++;
                else if (status === 'Family Care') summary.familyCare++;
                else if (status === 'Public Holiday') summary.publicHoliday++;
                else if (status === 'Absent') summary.absent++;
                else if (status === 'Sick Leave') summary.sickLeave++;
            }
        });
        renderSummaryBox(summary);
    }
    rows.forEach(row => {
        const clockIn = row.querySelector('.clock-in');
        const clockOut = row.querySelector('.clock-out');
        const statusSel = row.querySelector('select');
        const hoursCell = row.querySelector('.working-hours');
        function updateHoursAndSummary() {
            const inVal = clockIn.value;
            const outVal = clockOut.value;
            if (inVal && outVal) {
                const [inH, inM] = inVal.split(':').map(Number);
                const [outH, outM] = outVal.split(':').map(Number);
                let hours = (outH + outM/60) - (inH + inM/60);
                if (hours < 0) hours += 24;
                hours = Math.round(hours * 100) / 100;
                if (hours > 8) {
                    const overtime = Math.round((hours - 8) * 100) / 100;
                    hoursCell.innerHTML = `${hours} <span style='font-weight:bold;color:#c62828;'>(+${overtime} OT)</span>`;
                } else {
                    hoursCell.textContent = hours;
                }
            } else {
                hoursCell.textContent = '';
            }
            computeLiveSummary();
        }
        clockIn.addEventListener('input', updateHoursAndSummary);
        clockOut.addEventListener('input', updateHoursAndSummary);
        statusSel.addEventListener('change', updateHoursAndSummary);
    });
    computeLiveSummary();
}

function renderSummaryBox(summary = null) {
    console.log('[DEBUG] renderSummaryBox called', summary);
    // Always update summary cards
    document.getElementById('present-count').textContent = summary && summary.workingDays ? summary.workingDays : 0;
    document.getElementById('absent-count').textContent = summary && summary.absent ? summary.absent : 0;
    document.getElementById('overtime-hours').textContent = (summary && summary.totalOvertime ? summary.totalOvertime : 0) + ' hrs';
    document.getElementById('sick-count').textContent = summary && summary.sickLeave ? summary.sickLeave : 0;
    // Update total working hours card if exists
    var workingHoursCard = document.getElementById('working-hours-count');
    if (workingHoursCard) {
        workingHoursCard.textContent = (summary && summary.totalWorkingHours ? summary.totalWorkingHours : 0) + ' hrs';
    }
    // Update summary box visually
    let box = document.getElementById('timesheet-summary-box');
    if (!box) {
        box = document.createElement('div');
        box.id = 'timesheet-summary-box';
        box.style.marginBottom = '18px';
        box.style.background = '#f8f9fa';
        box.style.borderRadius = '8px';
        box.style.padding = '14px 18px';
        box.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
        box.style.maxWidth = '340px';
        box.style.fontSize = '15px';
        box.style.color = '#1976d2';
        document.querySelector('.timesheet-container').insertBefore(box, document.getElementById('timesheet-wrapper'));
    }
    if (summary) {
        box.innerHTML = `<b>Summary</b><br>
        Working Days: ${summary.workingDays}<br>
        Off Days: ${summary.offDays}<br>
        Annual Leave: ${summary.annualLeave}<br>
        Maternity Leave: ${summary.maternityLeave}<br>
        Paternity Leave: ${summary.paternityLeave}<br>
        Emergency Leave: ${summary.emergencyLeave}<br>
        Family Care: ${summary.familyCare}<br>
        Public Holiday: ${summary.publicHoliday}<br>
        Absent: ${summary.absent}<br>
        <b>Total Working Hours: ${summary.totalWorkingHours} hrs</b><br>
        <b style='color:#c00;'>Total Overtime: ${summary.totalOvertime} hrs</b>`;
    } else {
        box.innerHTML = `<b>Summary</b><br>Fill and Save timesheet to see summary.`;
    }
}

function getWeekDates(weekStr) {
    const [year, week] = weekStr.split('-W');
    const d = new Date(year, 0, 1 + (week - 1) * 7);
    d.setDate(d.getDate() - d.getDay() + 1);
    return Array.from({length: 7}, (_, i) => {
        const date = new Date(d);
        date.setDate(d.getDate() + i);
        return date.toISOString().slice(0,10);
    });
}

function setupAttendanceButtons() {
    console.log('[DEBUG] setupAttendanceButtons called');
    document.getElementById('clockInBtn').onclick = () => {
        alert('Clock In recorded! (Demo only)');
    };
    document.getElementById('clockOutBtn').onclick = () => {
        alert('Clock Out recorded! (Demo only)');
    };
    const saveBtn = document.getElementById('save-timesheet-btn');
    saveBtn.onclick = saveTimesheet;
    // Disable save if 'All Employees' is selected
    document.getElementById('employee-select').addEventListener('change', function() {
        if (this.value === '') {
            saveBtn.disabled = true;
            saveBtn.style.opacity = 0.6;
            saveBtn.title = 'Select an individual employee to save timesheet.';
        } else {
            saveBtn.disabled = false;
            saveBtn.style.opacity = 1;
            saveBtn.title = '';
        }
    });
    // Set initial state
    if (document.getElementById('employee-select').value === '') {
        saveBtn.disabled = true;
        saveBtn.style.opacity = 0.6;
        saveBtn.title = 'Select an individual employee to save timesheet.';
    } else {
        saveBtn.disabled = false;
        saveBtn.style.opacity = 1;
        saveBtn.title = '';
    }
}

async function saveTimesheet() {
    console.log('[DEBUG] saveTimesheet called');
    const wrapper = document.getElementById('timesheet-wrapper');
    const weekStr = document.getElementById('week-selector').value;
    const employeeId = document.getElementById('employee-select').value;
    
    if (!employeeId) {
        alert('Please select an employee to save the timesheet.');
        return;
    }
    
    const rows = wrapper.querySelectorAll('tbody tr');
    let records = [];
    let summary = {
        workingDays: 0, offDays: 0, annualLeave: 0, maternityLeave: 0, 
        paternityLeave: 0, emergencyLeave: 0, familyCare: 0, 
        publicHoliday: 0, absent: 0, totalOvertime: 0, 
        totalWorkingHours: 0, sickLeave: 0
    };
    
    // Get employee name for summary and records
    let employeeName = '';
    const select = document.getElementById('employee-select');
    if (select && select.selectedIndex > 0) {
        employeeName = select.options[select.selectedIndex].text;
    }
    
    rows.forEach(row => {
        const cells = row.children;
        const date = cells[0].textContent;
        const dayOfWeek = new Date(date).toLocaleString('en-US', { weekday: 'long' });
        
        // Always get the latest values from the DOM for each row
        const clockInInput = cells[2].querySelector('input');
        const clockOutInput = cells[3].querySelector('input');
        const clockIn = clockInInput ? clockInInput.value : '';
        const clockOut = clockOutInput ? clockOutInput.value : '';
        
        let status = '';
        const statusSel = cells[5].querySelector('select');
        if (statusSel) {
            status = statusSel.value || statusSel.options[statusSel.selectedIndex]?.value || '';
        }
        
        let overtime = 0;
        let hours = 0;
        
        // Only calculate working hours if both times are filled and status is Working Day
        if (clockIn && clockOut && status === 'Working Day') {
            const [inH, inM] = clockIn.split(':').map(Number);
            const [outH, outM] = clockOut.split(':').map(Number);
            hours = (outH + outM/60) - (inH + inM/60);
            if (hours < 0) hours += 24;
            hours = Math.round(hours * 100) / 100;
            summary.totalWorkingHours += hours;
            if (hours > 8) overtime = +(hours - 8).toFixed(2);
            else overtime = 0;
            summary.totalOvertime += overtime;
            summary.workingDays++;
        }
        
        // Increment summary for all leave types and statuses
        if (status === 'Off Day') summary.offDays++;
        else if (status === 'Annual Leave') summary.annualLeave++;
        else if (status === 'Maternity Leave') summary.maternityLeave++;
        else if (status === 'Paternity Leave') summary.paternityLeave++;
        else if (status === 'Emergency Leave') summary.emergencyLeave++;
        else if (status === 'Family Care') summary.familyCare++;
        else if (status === 'Public Holiday') summary.publicHoliday++;
        else if (status === 'Absent') summary.absent++;
        else if (status === 'Sick Leave') summary.sickLeave++;
        
        records.push({ 
            date, 
            dayOfWeek,
            clockIn, 
            clockOut, 
            status, 
            workingHours: hours, 
            overtime, 
            employeeName 
        });
    });
    
    // Add timestamp to the data
    const timestamp = new Date().toISOString();
    
    // Save to backend
    const data = { 
        employeeId, 
        week: weekStr, 
        records, 
        summary,
        employeeName,
        timestamp
    };
    
    try {
        const saveBtn = document.getElementById('save-timesheet-btn');
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        
        const res = await fetch('/api/timesheets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Timesheet';
        
        if (res.ok) {
            const result = await res.json();
            renderSummaryBox(summary);
            
            // Show success message
            const message = result.message || 'Timesheet saved!';
            const alertBox = document.createElement('div');
            alertBox.className = 'alert-success';
            alertBox.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
            alertBox.style.position = 'fixed';
            alertBox.style.top = '20px';
            alertBox.style.right = '20px';
            alertBox.style.padding = '10px 20px';
            alertBox.style.background = '#4CAF50';
            alertBox.style.color = 'white';
            alertBox.style.borderRadius = '4px';
            alertBox.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
            alertBox.style.zIndex = '1000';
            document.body.appendChild(alertBox);
            
            // Remove after 3 seconds
            setTimeout(() => {
                alertBox.style.opacity = '0';
                alertBox.style.transition = 'opacity 0.5s';
                setTimeout(() => alertBox.remove(), 500);
            }, 3000);
            
            // Refresh the data display
            showAllTimesheetSummaries(employeeId);
            showLeaveHistory(employeeId);
        } else {
            alert('Failed to save timesheet');
        }
    } catch (err) {
        console.error('Error saving timesheet:', err);
        alert('Error saving timesheet');
        
        const saveBtn = document.getElementById('save-timesheet-btn');
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Timesheet';
    }
}

function getCurrentWeek() {
    const date = new Date();
    const year = date.getFullYear();
    const week = getWeekNumber(date);
    return `${year}-W${week}`;
}

function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

// Show all timesheet summaries for employee
async function showAllTimesheetSummaries(employeeId) {
    // Fetch employee list for ID-to-name mapping
    let empMap = {};
    try {
        const res = await fetch('/api/employees/names');
        const employees = await res.json();
        employees.forEach(emp => { empMap[emp._id] = { name: emp.name, empNo: emp.empNo || emp['EMP NO'] || '' }; });
    } catch (err) {
        console.error('Error fetching employee names:', err);
    }

    const containerId = 'all-timesheet-summaries-container';
    let container = document.getElementById(containerId);
    if (!container) {
        container = document.createElement('div');
        container.id = containerId;
        container.style.marginTop = '24px';
        document.querySelector('.timesheet-container').appendChild(container);
    }
    if (!employeeId) {
        container.innerHTML = '';
        return;
    }
    container.innerHTML = '<div style="color:#888;font-size:14px;">Loading all timesheet summaries...</div>';
    try {
        const res = await fetch(`/api/timesheets?employeeId=${employeeId}`);
        if (!res.ok) throw new Error('Failed to fetch timesheets');
        const timesheets = await res.json();
        const all = Array.isArray(timesheets) ? timesheets : [timesheets];
        if (!all.length || !all[0]._id) {
            container.innerHTML = '<div style="color:#888;font-size:14px;">No timesheet records found.</div>';
            return;
        }
        // Sort by week descending
        all.sort((a, b) => (b.week || '').localeCompare(a.week || ''));
        
        // Create a more detailed and styled summary view
        let html = `
        <div class="timesheet-history-header">
            <h3><i class="fas fa-history"></i> Timesheet History</h3>
            <div class="timesheet-controls">
                <button id="export-timesheets-btn" class="btn secondary-btn">
                    <i class="fas fa-file-export"></i> Export
                </button>
            </div>
        </div>`;
        
        html += `<div class="timesheet-history-container">
            <table class="timesheet-history-table">
                <thead>
                    <tr>
                        <th>Employee</th>
                        <th>Emp No</th>
                        <th>Date</th>
                        <th>Day</th>
                        <th>Status</th>
                        <th>Clock In</th>
                        <th>Clock Out</th>
                        <th>Working Hours</th>
                        <th>Overtime</th>
                    </tr>
                </thead>
                <tbody>`;
                
        all.forEach(ts => {
            const emp = empMap[ts.employeeId] || {};
            const empName = emp.name || ts.employeeName || 'Unknown';
            const empNo = emp.empNo || '';
            
            // Add a header row for each week
            html += `<tr class="week-header">
                <td colspan="9">Week: ${ts.week || 'Unknown'} - Last Updated: ${new Date(ts.lastUpdated || ts.createdAt || Date.now()).toLocaleString()}</td>
            </tr>`;
            
            // Add rows for each day's record
            (ts.records || []).forEach(rec => {
                const dayName = rec.dayOfWeek || new Date(rec.date).toLocaleDateString('en-US', { weekday: 'long' });
                const isLeave = rec.status && rec.status !== 'Working Day';
                const statusClass = isLeave ? 'leave-status' : (rec.status === 'Working Day' ? 'working-status' : 'other-status');
                
                html += `<tr>
                    <td>${empName}</td>
                    <td>${empNo}</td>
                    <td>${rec.date || ''}</td>
                    <td>${dayName}</td>
                    <td class="${statusClass}">${rec.status || ''}</td>
                    <td>${rec.clockIn || '-'}</td>
                    <td>${rec.clockOut || '-'}</td>
                    <td>${rec.workingHours ? rec.workingHours + ' hrs' : '-'}</td>
                    <td>${rec.overtime ? rec.overtime + ' hrs' : '-'}</td>
                </tr>`;
            });
            
            // Add a summary row for the week
            if (ts.summary) {
                html += `<tr class="summary-row">
                    <td colspan="7" align="right"><strong>Weekly Summary:</strong></td>
                    <td><strong>${ts.summary.totalWorkingHours ? ts.summary.totalWorkingHours + ' hrs' : '-'}</strong></td>
                    <td><strong>${ts.summary.totalOvertime ? ts.summary.totalOvertime + ' hrs' : '-'}</strong></td>
                </tr>`;
            }
            
            // Add a spacer row
            html += `<tr class="spacer-row"><td colspan="9"></td></tr>`;
        });
        
        html += '</tbody></table></div>';
        
        // Add CSS for the new table
        const style = document.createElement('style');
        style.textContent = `
            .timesheet-history-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
            }
            .timesheet-history-container {
                overflow-x: auto;
                margin-bottom: 20px;
            }
            .timesheet-history-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 14px;
            }
            .timesheet-history-table th {
                background-color: #f5f5f5;
                padding: 10px;
                text-align: left;
                border-bottom: 2px solid #ddd;
            }
            .timesheet-history-table td {
                padding: 8px 10px;
                border-bottom: 1px solid #eee;
            }
            .week-header {
                background-color: #e3f2fd;
                font-weight: bold;
            }
            .week-header td {
                padding: 10px;
            }
            .summary-row {
                background-color: #f9f9f9;
            }
            .spacer-row {
                height: 20px;
            }
            .leave-status {
                color: #d32f2f;
                font-weight: bold;
            }
            .working-status {
                color: #388e3c;
                font-weight: bold;
            }
            .other-status {
                color: #0288d1;
                font-weight: bold;
            }
        `;
        document.head.appendChild(style);
        
        container.innerHTML = html;
        
        // Add export functionality
        document.getElementById('export-timesheets-btn').addEventListener('click', () => {
            exportTimesheets(all, empMap[employeeId]?.name || 'employee');
        });
        
    } catch (err) {
        console.error('Error loading timesheet summaries:', err);
        container.innerHTML = '<div style="color:#c00;font-size:14px;">Failed to load timesheet summaries.</div>';
    }
}

// Function to export timesheets to CSV
function exportTimesheets(timesheets, employeeName) {
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add headers
    csvContent += "Employee,Employee No,Week,Date,Day,Status,Clock In,Clock Out,Working Hours,Overtime\n";
    
    // Add data rows
    timesheets.forEach(ts => {
        const week = ts.week || '';
        
        (ts.records || []).forEach(rec => {
            const empName = rec.employeeName || employeeName || '';
            const empNo = '';  // Could be added if available
            const date = rec.date || '';
            const day = rec.dayOfWeek || new Date(rec.date).toLocaleDateString('en-US', { weekday: 'long' });
            const status = rec.status || '';
            const clockIn = rec.clockIn || '';
            const clockOut = rec.clockOut || '';
            const workingHours = rec.workingHours || '';
            const overtime = rec.overtime || '';
            
            // Escape fields that might contain commas
            const escapeCsv = (field) => {
                if (field.includes(',') || field.includes('"') || field.includes('\n')) {
                    return `"${field.replace(/"/g, '""')}"`;
                }
                return field;
            };
            
            csvContent += `${escapeCsv(empName)},${empNo},${week},${date},${day},${status},${clockIn},${clockOut},${workingHours},${overtime}\n`;
        });
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `timesheet_${employeeName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    
    // Trigger download and remove link
    link.click();
    document.body.removeChild(link);
}

// Show leave history for employee
async function showLeaveHistory(employeeId) {
    const containerId = 'leave-history-container';
    let container = document.getElementById(containerId);
    if (!container) {
        container = document.createElement('div');
        container.id = containerId;
        container.style.marginTop = '32px';
        document.querySelector('.timesheet-container').appendChild(container);
    }
    if (!employeeId) {
        container.innerHTML = '';
        return;
    }
    container.innerHTML = '<div style="color:#888;font-size:14px;">Loading leave history...</div>';
    try {
        const res = await fetch(`/api/timesheets?employeeId=${employeeId}`);
        if (!res.ok) throw new Error('Failed to fetch leave history');
        const timesheets = await res.json();
        // Flatten all records
        let leaves = [];
        (Array.isArray(timesheets) ? timesheets : [timesheets]).forEach(ts => {
            (ts.records||[]).forEach(rec => {
                if (rec.status && rec.status.toLowerCase().includes('leave')) {
                    leaves.push({date: rec.date, type: rec.status, week: ts.week});
                }
            });
        });
        if (!leaves.length) {
            container.innerHTML = '<div style="color:#888;font-size:14px;">No leave records found.</div>';
            return;
        }
        // Group by leave type
        const leaveColors = {
            'Annual Leave': '#1976d2',
            'Sick Leave': '#43a047',
            'Emergency Leave': '#e53935',
            'Maternity Leave': '#8e24aa',
            'Paternity Leave': '#fbc02d',
            'Family Care': '#00838f',
        };
        let html = `<table style="margin-top:12px;width:100%;border-collapse:collapse;font-size:14px;">
            <thead><tr><th>Date</th><th>Type</th><th>Week</th></tr></thead><tbody>`;
        leaves.forEach(lv => {
            const color = leaveColors[lv.type] || '#616161';
            html += `<tr><td>${lv.date}</td><td style="color:${color};font-weight:bold;">${lv.type}</td><td>${lv.week||''}</td></tr>`;
        });
        html += '</tbody></table>';
        container.innerHTML = `<div style="font-weight:bold;margin-bottom:4px;">Leave History</div>` + html;
    } catch (err) {
        container.innerHTML = '<div style="color:#c00;font-size:14px;">Failed to load leave history.</div>';
    }
}

// Setup leave balances button
function setupLeaveBalancesButton() {
    const viewLeaveBalancesBtn = document.getElementById('viewLeaveBalancesBtn');
    if (!viewLeaveBalancesBtn) return;
    
    viewLeaveBalancesBtn.addEventListener('click', async () => {
        const employeeId = document.getElementById('employee-select').value;
        if (!employeeId) {
            alert('Please select an employee to view leave balances.');
            return;
        }
        
        await fetchAndDisplayLeaveBalances(employeeId);
    });
    
    // Also update leave balances when employee selection changes
    document.getElementById('employee-select').addEventListener('change', function() {
        const employeeId = this.value;
        if (employeeId && document.getElementById('leaveBalancesSection').style.display !== 'none') {
            fetchAndDisplayLeaveBalances(employeeId);
        }
    });
}

// Fetch and display leave balances for an employee
async function fetchAndDisplayLeaveBalances(employeeId) {
    const leaveBalancesSection = document.getElementById('leaveBalancesSection');
    const publicHolidaysSection = document.getElementById('publicHolidaysSection');
    const leaveBalancesTableBody = document.getElementById('leaveBalancesTableBody');
    const publicHolidaysTableBody = document.getElementById('publicHolidaysTableBody');
    const employeeInfoDiv = document.getElementById('leaveBalancesEmployeeInfo');
    
    if (!leaveBalancesSection || !leaveBalancesTableBody) return;
    
    // Show loading state
    leaveBalancesSection.style.display = 'block';
    leaveBalancesTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;">Loading leave balances...</td></tr>';
    
    try {
        const response = await fetch(`/api/leave-balances/${employeeId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch leave balances: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Display employee info
        const joinDate = new Date(data.joinedDate).toLocaleDateString();
        employeeInfoDiv.innerHTML = `
            <div class="employee-info-card">
                <div class="employee-name">${data.employeeName}</div>
                <div class="employee-joined">Joined: ${joinDate}</div>
            </div>
        `;
        
        // Clear previous data
        leaveBalancesTableBody.innerHTML = '';
        
        // Add CSS for leave balances
        if (!document.getElementById('leaveBalancesStyles')) {
            const style = document.createElement('style');
            style.id = 'leaveBalancesStyles';
            style.textContent = `
                .leave-balances-container, .public-holidays-container {
                    margin-top: 30px;
                    background: #fff;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                    padding: 20px;
                }
                
                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                
                .section-header h3 {
                    margin: 0;
                    color: #333;
                    font-size: 18px;
                }
                
                .employee-info-card {
                    background: #f5f5f5;
                    padding: 10px 15px;
                    border-radius: 6px;
                    font-size: 14px;
                }
                
                .employee-name {
                    font-weight: bold;
                    font-size: 16px;
                    margin-bottom: 5px;
                }
                
                .leave-balances-table, .public-holidays-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 14px;
                }
                
                .leave-balances-table th, .public-holidays-table th {
                    background: #f5f5f5;
                    padding: 12px 15px;
                    text-align: left;
                    border-bottom: 2px solid #ddd;
                }
                
                .leave-balances-table td, .public-holidays-table td {
                    padding: 10px 15px;
                    border-bottom: 1px solid #eee;
                }
                
                .leave-type {
                    font-weight: bold;
                }
                
                .leave-entitlement {
                    color: #1976d2;
                    font-weight: bold;
                }
                
                .leave-used {
                    color: #e53935;
                    font-weight: bold;
                }
                
                .leave-remaining {
                    color: #43a047;
                    font-weight: bold;
                }
                
                .leave-forfeited {
                    color: #ff9800;
                    font-weight: bold;
                }
                
                .dates-list {
                    max-height: 80px;
                    overflow-y: auto;
                    font-size: 12px;
                }
                
                .holiday-name {
                    color: #e53935;
                    font-weight: bold;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Populate leave balances table
        data.leaveBalances.forEach(leave => {
            const row = document.createElement('tr');
            
            // Format dates taken
            let datesList = '';
            if (leave.history && leave.history.length > 0) {
                datesList = '<div class="dates-list">';
                leave.history.forEach(h => {
                    datesList += `<div>${h.date} (${h.dayOfWeek})</div>`;
                });
                datesList += '</div>';
            } else {
                datesList = 'None';
            }
            
            row.innerHTML = `
                <td class="leave-type">${leave.leaveType}</td>
                <td class="leave-entitlement">${leave.entitlement} days</td>
                <td class="leave-used">${leave.used} days</td>
                <td class="leave-remaining">${leave.remaining} days</td>
                <td class="leave-forfeited">${leave.forfeited} days</td>
                <td>${datesList}</td>
            `;
            
            leaveBalancesTableBody.appendChild(row);
        });
        
        // Display public holidays section
        if (publicHolidaysSection && publicHolidaysTableBody && data.publicHolidays) {
            publicHolidaysSection.style.display = 'block';
            publicHolidaysTableBody.innerHTML = '';
            
            data.publicHolidays.forEach(holiday => {
                const date = new Date(holiday.date);
                const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
                const formattedDate = date.toLocaleDateString();
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${formattedDate}</td>
                    <td>${dayOfWeek}</td>
                    <td class="holiday-name">${holiday.name}</td>
                `;
                
                publicHolidaysTableBody.appendChild(row);
            });
        }
        
    } catch (error) {
        console.error('Error fetching leave balances:', error);
        leaveBalancesTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:20px;color:#c00;">Error loading leave balances: ${error.message}</td></tr>`;
    }
}

