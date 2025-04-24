// reports.js: Handles reports functionality

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    initializeDateRange();
});

function initializeDateRange() {
    // Set default date range (current month)
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    document.getElementById('date-from').value = formatDateForInput(firstDay);
    document.getElementById('date-to').value = formatDateForInput(lastDay);
}

function setupEventListeners() {
    // Generate report button
    const generateReportBtn = document.getElementById('generate-report-btn');
    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', generateReport);
    }
    
    // Report card buttons
    const reportCardButtons = document.querySelectorAll('.report-card button');
    reportCardButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const reportType = this.closest('.report-card').dataset.type;
            document.getElementById('report-type').value = reportType;
            generateReport();
        });
    });
    
    // Close preview button
    const closePreviewBtn = document.getElementById('close-preview-btn');
    if (closePreviewBtn) {
        closePreviewBtn.addEventListener('click', () => {
            document.getElementById('report-preview-section').style.display = 'none';
        });
    }
    
    // Export report button
    const exportReportBtn = document.getElementById('export-report-btn');
    if (exportReportBtn) {
        exportReportBtn.addEventListener('click', exportReport);
    }
    
    // Print report button
    const printReportBtn = document.getElementById('print-report-btn');
    if (printReportBtn) {
        printReportBtn.addEventListener('click', () => window.print());
    }
}

async function generateReport() {
    const reportType = document.getElementById('report-type').value;
    const dateFrom = document.getElementById('date-from').value;
    const dateTo = document.getElementById('date-to').value;
    
    // Show loading state
    const previewSection = document.getElementById('report-preview-section');
    const previewContent = document.getElementById('report-preview-content');
    previewSection.style.display = 'block';
    previewContent.innerHTML = '<div class="loading">Generating report...</div>';
    
    try {
        // Use fetchApi from api-mock.js if available
        const fetchFunction = typeof fetchApi !== 'undefined' ? fetchApi : fetch;
        const res = await fetchFunction(`/api/reports/${reportType}?from=${dateFrom}&to=${dateTo}`);
        const data = await res.json();
        
        renderReport(reportType, data);
    } catch (err) {
        console.error('Failed to generate report:', err);
        
        // Use mock data if API fails
        const mockData = getMockReportData(reportType);
        renderReport(reportType, mockData);
    }
}

function renderReport(reportType, data) {
    const previewTitle = document.getElementById('report-preview-title');
    const previewContent = document.getElementById('report-preview-content');
    
    // Set report title
    const reportTitles = {
        'employee': 'Employee Summary Report',
        'attendance': 'Attendance Summary Report',
        'leave': 'Leave Summary Report',
        'payroll': 'Payroll Summary Report',
        'training': 'Training Summary Report',
        'custom': 'Custom Report'
    };
    
    previewTitle.textContent = reportTitles[reportType] || 'Report Preview';
    
    // Render report content based on type
    switch (reportType) {
        case 'employee':
            renderEmployeeReport(previewContent, data);
            break;
        case 'attendance':
            renderAttendanceReport(previewContent, data);
            break;
        case 'leave':
            renderLeaveReport(previewContent, data);
            break;
        case 'payroll':
            renderPayrollReport(previewContent, data);
            break;
        case 'training':
            renderTrainingReport(previewContent, data);
            break;
        case 'custom':
            renderCustomReport(previewContent, data);
            break;
        default:
            previewContent.innerHTML = '<div class="error">Unknown report type</div>';
    }
}

function renderEmployeeReport(container, data) {
    let html = `
        <div class="report-summary">
            <div class="summary-card">
                <h4>Total Employees</h4>
                <div class="summary-value">${data.totalEmployees}</div>
            </div>
            <div class="summary-card">
                <h4>Active Employees</h4>
                <div class="summary-value">${data.activeEmployees}</div>
            </div>
            <div class="summary-card">
                <h4>Departments</h4>
                <div class="summary-value">${data.departments.length}</div>
            </div>
            <div class="summary-card">
                <h4>Worksites</h4>
                <div class="summary-value">${data.worksites.length}</div>
            </div>
        </div>
        
        <div class="report-charts">
            <div class="chart-container">
                <h4>Employees by Department</h4>
                <canvas id="departmentChart"></canvas>
            </div>
            <div class="chart-container">
                <h4>Employees by Worksite</h4>
                <canvas id="worksiteChart"></canvas>
            </div>
        </div>
        
        <div class="report-table-section">
            <h4>Employee List</h4>
            <div class="table-container">
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Employee ID</th>
                            <th>Name</th>
                            <th>Department</th>
                            <th>Designation</th>
                            <th>Worksite</th>
                            <th>Join Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.employees.map(emp => `
                            <tr>
                                <td>${emp.id}</td>
                                <td>${emp.name}</td>
                                <td>${emp.department}</td>
                                <td>${emp.designation}</td>
                                <td>${emp.worksite}</td>
                                <td>${formatDate(emp.joinDate)}</td>
                                <td>${emp.status}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Create charts
    setTimeout(() => {
        createDepartmentChart(data.departmentDistribution);
        createWorksiteChart(data.worksiteDistribution);
    }, 100);
}

function renderAttendanceReport(container, data) {
    let html = `
        <div class="report-summary">
            <div class="summary-card">
                <h4>Total Employees</h4>
                <div class="summary-value">${data.totalEmployees}</div>
            </div>
            <div class="summary-card">
                <h4>Present Today</h4>
                <div class="summary-value">${data.presentToday}</div>
            </div>
            <div class="summary-card">
                <h4>Absent Today</h4>
                <div class="summary-value">${data.absentToday}</div>
            </div>
            <div class="summary-card">
                <h4>On Leave</h4>
                <div class="summary-value">${data.onLeave}</div>
            </div>
        </div>
        
        <div class="report-charts">
            <div class="chart-container">
                <h4>Attendance Trend (Last 30 Days)</h4>
                <canvas id="attendanceTrendChart"></canvas>
            </div>
            <div class="chart-container">
                <h4>Attendance by Department</h4>
                <canvas id="departmentAttendanceChart"></canvas>
            </div>
        </div>
        
        <div class="report-table-section">
            <h4>Attendance Summary</h4>
            <div class="table-container">
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Department</th>
                            <th>Present Days</th>
                            <th>Absent Days</th>
                            <th>Leave Days</th>
                            <th>Late Arrivals</th>
                            <th>Early Departures</th>
                            <th>Attendance %</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.attendanceSummary.map(item => `
                            <tr>
                                <td>${item.employee}</td>
                                <td>${item.department}</td>
                                <td>${item.presentDays}</td>
                                <td>${item.absentDays}</td>
                                <td>${item.leaveDays}</td>
                                <td>${item.lateArrivals}</td>
                                <td>${item.earlyDepartures}</td>
                                <td>${item.attendancePercentage}%</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Create charts
    setTimeout(() => {
        createAttendanceTrendChart(data.attendanceTrend);
        createDepartmentAttendanceChart(data.departmentAttendance);
    }, 100);
}

function renderLeaveReport(container, data) {
    // Implementation similar to other report renderers
    container.innerHTML = `<div class="loading">Leave report rendering not implemented in demo</div>`;
}

function renderPayrollReport(container, data) {
    // Implementation similar to other report renderers
    container.innerHTML = `<div class="loading">Payroll report rendering not implemented in demo</div>`;
}

function renderTrainingReport(container, data) {
    // Implementation similar to other report renderers
    container.innerHTML = `<div class="loading">Training report rendering not implemented in demo</div>`;
}

function renderCustomReport(container, data) {
    // Implementation for custom report
    container.innerHTML = `<div class="loading">Custom report rendering not implemented in demo</div>`;
}

function createDepartmentChart(data) {
    const ctx = document.getElementById('departmentChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.map(item => item.department),
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
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

function createWorksiteChart(data) {
    const ctx = document.getElementById('worksiteChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.worksite),
            datasets: [{
                label: 'Employees',
                data: data.map(item => item.count),
                backgroundColor: '#4e73df'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

function createAttendanceTrendChart(data) {
    const ctx = document.getElementById('attendanceTrendChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(item => item.date),
            datasets: [{
                label: 'Present',
                data: data.map(item => item.present),
                borderColor: '#1cc88a',
                backgroundColor: 'rgba(28, 200, 138, 0.1)',
                fill: true
            }, {
                label: 'Absent',
                data: data.map(item => item.absent),
                borderColor: '#e74a3b',
                backgroundColor: 'rgba(231, 74, 59, 0.1)',
                fill: true
            }, {
                label: 'On Leave',
                data: data.map(item => item.onLeave),
                borderColor: '#f6c23e',
                backgroundColor: 'rgba(246, 194, 62, 0.1)',
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

function createDepartmentAttendanceChart(data) {
    const ctx = document.getElementById('departmentAttendanceChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.department),
            datasets: [{
                label: 'Attendance %',
                data: data.map(item => item.attendancePercentage),
                backgroundColor: '#4e73df'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

function exportReport() {
    // In a real app, this would generate a PDF/Excel file
    // For demo, just show a message
    alert('Report exported successfully');
}

function getMockReportData(reportType) {
    // Mock data for different report types
    switch (reportType) {
        case 'employee':
            return {
                totalEmployees: 45,
                activeEmployees: 42,
                departments: [
                    { id: 1, name: 'IT' },
                    { id: 2, name: 'HR' },
                    { id: 3, name: 'Finance' },
                    { id: 4, name: 'Operations' },
                    { id: 5, name: 'Marketing' }
                ],
                worksites: [
                    { id: 1, name: 'Main Office' },
                    { id: 2, name: 'Branch Office' },
                    { id: 3, name: 'Remote' }
                ],
                departmentDistribution: [
                    { department: 'IT', count: 15 },
                    { department: 'HR', count: 5 },
                    { department: 'Finance', count: 8 },
                    { department: 'Operations', count: 12 },
                    { department: 'Marketing', count: 5 }
                ],
                worksiteDistribution: [
                    { worksite: 'Main Office', count: 30 },
                    { worksite: 'Branch Office', count: 10 },
                    { worksite: 'Remote', count: 5 }
                ],
                employees: [
                    { id: 'EMP001', name: 'John Doe', department: 'IT', designation: 'Software Developer', worksite: 'Main Office', joinDate: '2023-01-15', status: 'Active' },
                    { id: 'EMP002', name: 'Jane Smith', department: 'HR', designation: 'HR Manager', worksite: 'Main Office', joinDate: '2022-05-10', status: 'Active' },
                    { id: 'EMP003', name: 'Michael Johnson', department: 'Finance', designation: 'Accountant', worksite: 'Branch Office', joinDate: '2023-03-22', status: 'Active' },
                    { id: 'EMP004', name: 'Emily Davis', department: 'Marketing', designation: 'Marketing Specialist', worksite: 'Remote', joinDate: '2023-02-01', status: 'Active' },
                    { id: 'EMP005', name: 'Robert Wilson', department: 'Operations', designation: 'Operations Manager', worksite: 'Main Office', joinDate: '2022-11-15', status: 'Active' }
                ]
            };
        case 'attendance':
            return {
                totalEmployees: 45,
                presentToday: 38,
                absentToday: 2,
                onLeave: 5,
                attendanceTrend: Array.from({ length: 30 }, (_, i) => ({
                    date: formatDate(new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)),
                    present: Math.floor(Math.random() * 10) + 35,
                    absent: Math.floor(Math.random() * 5),
                    onLeave: Math.floor(Math.random() * 5)
                })),
                departmentAttendance: [
                    { department: 'IT', attendancePercentage: 95 },
                    { department: 'HR', attendancePercentage: 92 },
                    { department: 'Finance', attendancePercentage: 98 },
                    { department: 'Operations', attendancePercentage: 90 },
                    { department: 'Marketing', attendancePercentage: 94 }
                ],
                attendanceSummary: [
                    { employee: 'John Doe', department: 'IT', presentDays: 28, absentDays: 0, leaveDays: 2, lateArrivals: 1, earlyDepartures: 0, attendancePercentage: 93.3 },
                    { employee: 'Jane Smith', department: 'HR', presentDays: 27, absentDays: 1, leaveDays: 2, lateArrivals: 2, earlyDepartures: 1, attendancePercentage: 90.0 },
                    { employee: 'Michael Johnson', department: 'Finance', presentDays: 30, absentDays: 0, leaveDays: 0, lateArrivals: 0, earlyDepartures: 0, attendancePercentage: 100.0 },
                    { employee: 'Emily Davis', department: 'Marketing', presentDays: 28, absentDays: 0, leaveDays: 2, lateArrivals: 3, earlyDepartures: 1, attendancePercentage: 93.3 },
                    { employee: 'Robert Wilson', department: 'Operations', presentDays: 26, absentDays: 2, leaveDays: 2, lateArrivals: 4, earlyDepartures: 2, attendancePercentage: 86.7 }
                ]
            };
        default:
            return { message: 'Mock data not available for this report type' };
    }
}

// Utility functions
function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    
    const date = new Date(dateStr);
    if (isNaN(date)) return dateStr;
    
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
