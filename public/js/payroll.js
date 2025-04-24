document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initializePayrollPage();
        setupEventListeners();
        await refreshPayrollData();
    } catch (err) {
        console.error('Error initializing payroll page:', err);
        showError('Failed to initialize payroll page');
    }
});

async function initializePayrollPage() {
    await loadEmployees();
    setCurrentMonth();
    await loadPayrollData();
}

function setCurrentMonth() {
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    document.getElementById('month-select').value = `${year}-${month.toString().padStart(2, '0')}`;
}

async function loadEmployees() {
    try {
        const fetchFunction = typeof fetchApi !== 'undefined' ? fetchApi : fetch;
        const res = await fetchFunction('/api/employees/names');
        const employees = await res.json();
        const select = document.getElementById('employee-select');
        select.innerHTML = '<option value="">All Employees</option>';
        employees.forEach(emp => {
            select.innerHTML += `<option value="${emp._id}">${emp.name}</option>`;
        });
    } catch (err) {
        showError('Failed to load employees');
    }
}

async function loadPayrollData() {
    const month = document.getElementById('month-select').value;
    const employeeId = document.getElementById('employee-select').value;
    
    try {
        const fetchFunction = typeof fetchApi !== 'undefined' ? fetchApi : fetch;
        const res = await fetchFunction(`/api/payroll?month=${month}${employeeId ? `&employeeId=${employeeId}` : ''}`);
        const data = await res.json();
        
        renderPayrollTable(data.payroll);
        updatePayrollSummary(data.summary);
        
    } catch (err) {
        showError('Failed to load payroll data');
    }
}

function renderPayrollTable(payrollData) {
    const tbody = document.getElementById('payroll-table-body');
    tbody.innerHTML = '';
    
    payrollData.forEach(entry => {
        const totalAllowances = calculateTotal(entry.allowances);
        const totalDeductions = calculateTotal(entry.deductions);
        const serviceChargeMVR = entry.serviceChargeUsed ? 0 : (entry.serviceChargeMVR || 0);
        const netSalaryUSD = entry.basicSalaryUSD + totalAllowances - totalDeductions;
        const netSalaryMVR = entry.basicSalaryMVR + (totalAllowances - totalDeductions) * 15.42 + serviceChargeMVR;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${entry.employeeNumber}</td>
            <td>${entry.employeeName}</td>
            <td>$${entry.basicSalaryUSD.toFixed(2)}</td>
            <td>MVR ${entry.basicSalaryMVR.toFixed(2)}</td>
            <td>$${totalAllowances.toFixed(2)}</td>
            <td>$${totalDeductions.toFixed(2)}</td>
            <td>$${netSalaryUSD.toFixed(2)}</td>
            <td>MVR ${netSalaryMVR.toFixed(2)}</td>
            <td>
                <button onclick="showEmployeeSalaryDetails('${entry.employeeNumber}')" class="btn info-btn btn-sm">
                    <i class="fas fa-info-circle"></i>
                </button>
                <button onclick="showPayslip('${entry.employeeNumber}')" class="btn secondary-btn btn-sm">
                    <i class="fas fa-file-invoice"></i>
                </button>
                <button onclick="showSalaryComponentModal('${entry.employeeNumber}')" class="btn primary-btn btn-sm">
                    <i class="fas fa-plus"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updatePayrollSummary(summary) {
    document.getElementById('total-employees').textContent = summary.totalEmployees;
    document.getElementById('total-payroll-usd').textContent = `$${summary.totalPayrollUSD.toFixed(2)}`;
    document.getElementById('total-payroll-mvr').textContent = `MVR ${summary.totalPayrollMVR.toFixed(2)}`;
}

function calculateTotal(items = []) {
    return items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
}

async function showPayslip(employeeNumber) {
    try {
        const month = document.getElementById('month-select').value;
        const res = await fetch(`/api/payroll/payslip/${employeeNumber}?month=${month}`);
        const data = await res.json();
        
        renderPayslip(data);
        showModal('payslip-modal');
        
    } catch (err) {
        showError('Failed to generate payslip');
    }
}

function renderPayslip(data) {
    const content = document.getElementById('payslip-content');
    
    const totalAllowances = calculateTotal(data.allowances);
    const totalDeductions = calculateTotal(data.deductions);
    const netSalaryUSD = data.basicSalaryUSD + totalAllowances - totalDeductions;
    const netSalaryMVR = data.basicSalaryMVR + (totalAllowances - totalDeductions) * 15.42;
    
    content.innerHTML = `
        <div class="payslip-header">
            <div class="payslip-company">OptiForce HR</div>
            <div class="payslip-title">Payslip for ${formatMonth(data.month)}</div>
        </div>
        
        <div class="payslip-info">
            <div>
                <strong>Employee:</strong> ${data.employeeName}<br>
                <strong>Employee No:</strong> ${data.employeeNumber}<br>
                <strong>Department:</strong> ${data.department}<br>
                <strong>Designation:</strong> ${data.designation}
            </div>
            <div>
                <strong>Bank:</strong> ${data.bankName || 'N/A'}<br>
                <strong>Account:</strong> ${data.accountNumber || 'N/A'}<br>
                <strong>Payment Date:</strong> ${formatDate(data.paymentDate)}
            </div>
        </div>
        
        <div class="payslip-details">
            <div>
                <h4>Earnings</h4>
                <div>Basic Salary (USD): $${data.basicSalaryUSD.toFixed(2)}</div>
                <div>Basic Salary (MVR): MVR ${data.basicSalaryMVR.toFixed(2)}</div>
                ${data.allowances.map(a => `
                    <div>${a.name}: $${a.amount.toFixed(2)}</div>
                `).join('')}
                <div><strong>Total Allowances: $${totalAllowances.toFixed(2)}</strong></div>
            </div>
            
            <div>
                <h4>Deductions</h4>
                ${data.deductions.map(d => `
                    <div>${d.name}: $${d.amount.toFixed(2)}</div>
                `).join('')}
                <div><strong>Total Deductions: $${totalDeductions.toFixed(2)}</strong></div>
            </div>
        </div>
        
        <div class="payslip-total">
            <div>Net Salary (USD): $${netSalaryUSD.toFixed(2)}</div>
            <div>Net Salary (MVR): MVR ${netSalaryMVR.toFixed(2)}</div>
        </div>
    `;
}

function showSalaryComponentModal(employeeNumber) {
    const modal = document.getElementById('salary-component-modal');
    const form = document.getElementById('salary-component-form');
    
    // Store employee number for form submission
    form.dataset.employeeNumber = employeeNumber;
    
    form.onsubmit = async (e) => {
        e.preventDefault();
        
        const data = {
            employeeNumber: form.dataset.employeeNumber,
            type: document.getElementById('component-type').value,
            name: document.getElementById('component-name').value,
            amount: parseFloat(document.getElementById('component-amount').value),
            recurring: document.getElementById('component-recurring').checked
        };
        
        try {
            const res = await fetch('/api/payroll/components', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (res.ok) {
                hideModal('salary-component-modal');
                await loadPayrollData();
                showSuccess('Salary component added successfully');
            } else {
                throw new Error('Failed to add salary component');
            }
        } catch (err) {
            showError('Failed to add salary component');
            console.error(err);
        }
    };
    
    showModal('salary-component-modal');
}

function setupEventListeners() {
    // Month selection
    const loadMonthBtn = document.getElementById('load-month-btn');
    if (loadMonthBtn) loadMonthBtn.onclick = loadPayrollData;
    
    const monthSelect = document.getElementById('month-select');
    if (monthSelect) monthSelect.onchange = loadPayrollData;
    
    // Employee filter
    const employeeSelect = document.getElementById('employee-select');
    if (employeeSelect) employeeSelect.onchange = loadPayrollData;
    
    // Process payroll button
    const processPayrollBtn = document.getElementById('process-payroll-btn');
    if (processPayrollBtn) processPayrollBtn.onclick = processPayroll;
    
    // Service charge button
    const serviceChargeBtn = document.getElementById('add-service-charge-btn');
    if (serviceChargeBtn) serviceChargeBtn.onclick = showServiceChargeModal;
    
    // Export button
    const exportBtn = document.getElementById('export-payroll-btn');
    if (exportBtn) exportBtn.onclick = exportPayroll;
    
    // Print buttons
    const printPayrollBtn = document.getElementById('print-payroll-btn');
    if (printPayrollBtn) printPayrollBtn.onclick = () => window.print();
    
    const printPayslipBtn = document.getElementById('print-payslip-btn');
    if (printPayslipBtn) printPayslipBtn.onclick = printPayslip;
    
    // Download payslip button
    const downloadPayslipBtn = document.getElementById('download-payslip-btn');
    if (downloadPayslipBtn) downloadPayslipBtn.onclick = downloadPayslip;
    
    // Modal close buttons
    document.querySelectorAll('.close').forEach(btn => {
        btn.onclick = () => hideModal(btn.closest('.modal').id);
    });
    
    const cancelComponentBtn = document.getElementById('cancel-component-btn');
    if (cancelComponentBtn) cancelComponentBtn.onclick = () => hideModal('salary-component-modal');
    
    const cancelServiceChargeBtn = document.getElementById('cancel-service-charge-btn');
    if (cancelServiceChargeBtn) cancelServiceChargeBtn.onclick = () => hideModal('service-charge-modal');
}

async function processPayroll() {
    const month = document.getElementById('month-select').value;
    
    try {
        const res = await fetch('/api/payroll/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ month })
        });
        
        if (res.ok) {
            await loadPayrollData();
            showSuccess('Payroll processed successfully');
            await refreshPayrollData();
        } else {
            throw new Error('Failed to process payroll');
        }
    } catch (err) {
        showError('Failed to process payroll');
    }
}

async function exportPayroll() {
    const month = document.getElementById('month-select').value;
    const employeeId = document.getElementById('employee-select').value;
    
    try {
        const res = await fetch(`/api/payroll/export?month=${month}${employeeId ? `&employeeId=${employeeId}` : ''}`);
        const blob = await res.blob();
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `payroll_${month}.xlsx`;
        
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        
    } catch (err) {
        showError('Failed to export payroll data');
    }
}

function printPayslip() {
    const content = document.getElementById('payslip-content');
    const printWindow = window.open('', '', 'height=600,width=800');
    
    printWindow.document.write(`
        <html>
            <head>
                <title>Payslip</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .payslip-header { text-align: center; margin-bottom: 20px; }
                    .payslip-company { font-size: 24px; font-weight: bold; color: #1976d2; }
                    .payslip-title { font-size: 18px; color: #666; }
                    .payslip-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
                    .payslip-details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                    .payslip-total { text-align: right; margin-top: 20px; padding-top: 20px; border-top: 2px solid #eee; }
                </style>
            </head>
            <body>
                ${content.innerHTML}
            </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
}

async function downloadPayslip() {
    const content = document.getElementById('payslip-content');
    const employeeNumber = content.querySelector('.payslip-info').textContent.match(/Employee No:\s*(\w+)/)[1];
    const month = document.getElementById('month-select').value;
    
    try {
        const res = await fetch(`/api/payroll/payslip/${employeeNumber}/download?month=${month}`);
        const blob = await res.blob();
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `payslip_${employeeNumber}_${month}.pdf`;
        
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        
    } catch (err) {
        showError('Failed to download payslip');
    }
}

function showServiceChargeModal() {
    const modal = document.getElementById('service-charge-modal');
    const form = document.getElementById('service-charge-form');
    
    form.onsubmit = async (e) => {
        e.preventDefault();
        
        const data = {
            month: document.getElementById('month-select').value,
            amountMVR: parseFloat(document.getElementById('service-charge-amount').value)
        };
        
        try {
            const res = await fetch('/api/payroll/service-charge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (res.ok) {
                hideModal('service-charge-modal');
                await loadPayrollData();
                showSuccess('Service charge distributed successfully');
                await refreshPayrollData();
            } else {
                const error = await res.json();
                throw new Error(error.error || 'Failed to distribute service charge');
            }
        } catch (err) {
            showError(err.message);
            console.error(err);
        }
    };
    
    showModal('service-charge-modal');
}

// Update the employee salary details view
async function showEmployeeSalaryDetails(employeeNumber) {
    try {
        const month = document.getElementById('month-select').value;
        const res = await fetch(`/api/payroll/payslip/${employeeNumber}?month=${month}`);
        const data = await res.json();
        
        const modal = document.getElementById('salary-details-modal');
        const content = document.getElementById('salary-details-content');
        
        content.innerHTML = `
            <div class="salary-details">
                <div class="employee-info">
                    <h3>${data.employeeName}</h3>
                    <p>Employee No: ${data.employeeNumber}</p>
                    <p>Department: ${data.department}</p>
                    <p>Designation: ${data.designation}</p>
                </div>
                
                <div class="salary-components">
                    <div class="basic-salary">
                        <h4>Basic Salary</h4>
                        <p>USD: $${data.basicSalaryUSD.toFixed(2)}</p>
                        <p>MVR: MVR ${data.basicSalaryMVR.toFixed(2)}</p>
                    </div>
                    
                    <div class="service-charge">
                        <h4>Service Charge</h4>
                        <p>MVR: MVR ${data.serviceChargeMVR.toFixed(2)}</p>
                    </div>
                    
                    <div class="allowances">
                        <h4>Allowances</h4>
                        ${data.allowances.map(a => `
                            <div class="component">
                                <span>${a.name}</span>
                                <span>$${a.amount.toFixed(2)}</span>
                                <span>${a.recurring ? '(Recurring)' : ''}</span>
                            </div>
                        `).join('') || '<p>No allowances</p>'}
                    </div>
                    
                    <div class="deductions">
                        <h4>Deductions</h4>
                        ${data.deductions.map(d => `
                            <div class="component">
                                <span>${d.name}</span>
                                <span>$${d.amount.toFixed(2)}</span>
                                <span>${d.recurring ? '(Recurring)' : ''}</span>
                            </div>
                        `).join('') || '<p>No deductions</p>'}
                    </div>
                </div>
                
                <div class="salary-summary">
                    <div class="total">
                        <h4>Total Allowances: $${data.totalAllowances.toFixed(2)}</h4>
                        <h4>Total Deductions: $${data.totalDeductions.toFixed(2)}</h4>
                    </div>
                    <div class="net-salary">
                        <h3>Net Salary (USD): $${data.netSalaryUSD.toFixed(2)}</h3>
                        <h3>Net Salary (MVR): MVR ${data.netSalaryMVR.toFixed(2)}</h3>
                    </div>
                </div>
            </div>
        `;
        
        showModal('salary-details-modal');
    } catch (err) {
        showError('Failed to load salary details');
    }
}

// Utility functions
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function hideModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function formatMonth(monthStr) {
    const [year, month] = monthStr.split('-');
    return new Date(year, month - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function showSuccess(message) {
    // Implement a success toast/notification
    alert(message);
}

function showError(message) {
    // Implement an error toast/notification
    alert(message);
}

// Initialize charts
let departmentChart, worksiteChart, nationalityChart, salaryRangeChart;

// Function to create and update charts
async function updateDistributionCharts() {
    try {
        const response = await fetch('/api/payroll/distribution');
        const data = await response.json();

        // Department Chart
        const deptData = Object.entries(data.departmentDistribution);
        if (!departmentChart) {
            const deptCtx = document.getElementById('departmentChart').getContext('2d');
            departmentChart = new Chart(deptCtx, {
                type: 'bar',
                data: {
                    labels: deptData.map(([dept]) => dept),
                    datasets: [
                        {
                            label: 'Salary (USD)',
                            data: deptData.map(([, stats]) => stats.totalUSD),
                            backgroundColor: 'rgba(54, 162, 235, 0.5)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1,
                            yAxisID: 'y'
                        },
                        {
                            label: 'Service Charge (USD)',
                            data: deptData.map(([, stats]) => stats.serviceChargeUSD),
                            backgroundColor: 'rgba(255, 99, 132, 0.5)',
                            borderColor: 'rgba(255, 99, 132, 1)',
                            borderWidth: 1,
                            yAxisID: 'y'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Amount (USD)'
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Department-wise Salary Distribution'
                        }
                    }
                }
            });
        } else {
            departmentChart.data.labels = deptData.map(([dept]) => dept);
            departmentChart.data.datasets[0].data = deptData.map(([, stats]) => stats.totalUSD);
            departmentChart.data.datasets[1].data = deptData.map(([, stats]) => stats.serviceChargeUSD);
            departmentChart.update();
        }

        // Worksite Chart
        const wsData = Object.entries(data.worksiteDistribution);
        if (!worksiteChart) {
            const wsCtx = document.getElementById('worksiteChart').getContext('2d');
            worksiteChart = new Chart(wsCtx, {
                type: 'pie',
                data: {
                    labels: wsData.map(([ws]) => ws),
                    datasets: [{
                        data: wsData.map(([, stats]) => stats.totalUSD),
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.5)',
                            'rgba(54, 162, 235, 0.5)',
                            'rgba(255, 206, 86, 0.5)',
                            'rgba(75, 192, 192, 0.5)',
                            'rgba(153, 102, 255, 0.5)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'right'
                        },
                        title: {
                            display: true,
                            text: 'Worksite-wise Salary Distribution (USD)'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `${context.label}: $${context.raw.toFixed(2)}`;
                                }
                            }
                        }
                    }
                }
            });
        } else {
            worksiteChart.data.labels = wsData.map(([ws]) => ws);
            worksiteChart.data.datasets[0].data = wsData.map(([, stats]) => stats.totalUSD);
            worksiteChart.update();
        }

        // Nationality Chart
        const natData = Object.entries(data.nationalityDistribution);
        if (!nationalityChart) {
            const natCtx = document.getElementById('nationalityChart').getContext('2d');
            nationalityChart = new Chart(natCtx, {
                type: 'pie',
                data: {
                    labels: natData.map(([nat]) => nat),
                    datasets: [{
                        data: natData.map(([, stats]) => stats.totalUSD),
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.5)',
                            'rgba(54, 162, 235, 0.5)',
                            'rgba(255, 206, 86, 0.5)',
                            'rgba(75, 192, 192, 0.5)',
                            'rgba(153, 102, 255, 0.5)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'right'
                        },
                        title: {
                            display: true,
                            text: 'Nationality-wise Salary Distribution (USD)'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `${context.label}: $${context.raw.toFixed(2)}`;
                                }
                            }
                        }
                    }
                }
            });
        } else {
            nationalityChart.data.labels = natData.map(([nat]) => nat);
            nationalityChart.data.datasets[0].data = natData.map(([, stats]) => stats.totalUSD);
            nationalityChart.update();
        }

        // Salary Range Chart
        const rangeData = Object.entries(data.salaryRangeDistribution);
        if (!salaryRangeChart) {
            const rangeCtx = document.getElementById('salaryRangeChart').getContext('2d');
            salaryRangeChart = new Chart(rangeCtx, {
                type: 'bar',
                data: {
                    labels: rangeData.map(([range]) => range),
                    datasets: [{
                        label: 'Total Salary',
                        data: rangeData.map(([, stats]) => stats.totalUSD),
                        backgroundColor: 'rgba(75, 192, 192, 0.5)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Total Salary (USD)'
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Salary Range Distribution'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const stats = rangeData[context.dataIndex][1];
                                    return [
                                        `Total Salary: $${stats.totalUSD.toFixed(2)}`,
                                        `Employee Count: ${stats.count}`
                                    ];
                                }
                            }
                        }
                    }
                }
            });
        } else {
            salaryRangeChart.data.labels = rangeData.map(([range]) => range);
            salaryRangeChart.data.datasets[0].data = rangeData.map(([, stats]) => stats.totalUSD);
            salaryRangeChart.update();
        }
    } catch (err) {
        console.error('Error updating distribution charts:', err);
    }
}

// Update charts when payroll data changes
async function refreshPayrollData() {
    await loadPayrollData();
    updateDistributionCharts();
}

// Add event listeners for data updates
document.getElementById('process-payroll-btn').addEventListener('click', async () => {
    await processPayroll();
    await refreshPayrollData();
});

document.getElementById('add-service-charge-btn').addEventListener('click', async () => {
    await showServiceChargeModal();
    await refreshPayrollData();
});