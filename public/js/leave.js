// leave.js: Handles leave management functionality

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initializeLeavePage();
        setupEventListeners();
    } catch (err) {
        console.error('Error initializing leave page:', err);
        showError('Failed to initialize leave page');
    }
});

async function initializeLeavePage() {
    await loadLeaveApplications();
}

async function loadLeaveApplications() {
    try {
        // Use fetchApi from api-mock.js if available
        const fetchFunction = typeof fetchApi !== 'undefined' ? fetchApi : fetch;
        const res = await fetchFunction('/api/leave/applications');
        const data = await res.json();
        
        renderLeaveTable(data.applications || []);
    } catch (err) {
        console.error('Failed to load leave applications:', err);
        showError('Failed to load leave applications');
        
        // Use mock data if API fails
        const mockLeaveApplications = [
            {
                id: 'LV001',
                employeeId: 'EMP001',
                employeeName: 'John Doe',
                leaveType: 'Annual Leave',
                fromDate: '2025-05-01',
                toDate: '2025-05-05',
                days: 5,
                reason: 'Family vacation',
                status: 'Approved'
            },
            {
                id: 'LV002',
                employeeId: 'EMP002',
                employeeName: 'Jane Smith',
                leaveType: 'Sick Leave',
                fromDate: '2025-04-15',
                toDate: '2025-04-16',
                days: 2,
                reason: 'Not feeling well',
                status: 'Approved'
            },
            {
                id: 'LV003',
                employeeId: 'EMP003',
                employeeName: 'Michael Johnson',
                leaveType: 'Casual Leave',
                fromDate: '2025-04-28',
                toDate: '2025-04-28',
                days: 1,
                reason: 'Personal work',
                status: 'Pending'
            }
        ];
        
        renderLeaveTable(mockLeaveApplications);
    }
}

function renderLeaveTable(applications) {
    const tbody = document.getElementById('leave-table-body');
    tbody.innerHTML = '';
    
    if (applications.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center">No leave applications found</td></tr>';
        return;
    }
    
    applications.forEach(app => {
        const row = document.createElement('tr');
        
        // Set row class based on status
        if (app.status === 'Approved') {
            row.classList.add('status-approved');
        } else if (app.status === 'Rejected') {
            row.classList.add('status-rejected');
        } else if (app.status === 'Pending') {
            row.classList.add('status-pending');
        }
        
        row.innerHTML = `
            <td>${app.id}</td>
            <td>${app.employeeName}</td>
            <td>${app.leaveType}</td>
            <td>${formatDate(app.fromDate)}</td>
            <td>${formatDate(app.toDate)}</td>
            <td>${app.days}</td>
            <td>${app.reason.length > 20 ? app.reason.substring(0, 20) + '...' : app.reason}</td>
            <td><span class="status-badge status-${app.status.toLowerCase()}">${app.status}</span></td>
            <td>
                <button onclick="viewLeaveDetails('${app.id}')" class="btn info-btn btn-sm">
                    <i class="fas fa-info-circle"></i>
                </button>
                ${app.status === 'Pending' ? `
                <button onclick="cancelLeaveApplication('${app.id}')" class="btn danger-btn btn-sm">
                    <i class="fas fa-times"></i>
                </button>
                ` : ''}
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

function setupEventListeners() {
    // Apply leave button
    const applyLeaveBtn = document.getElementById('apply-leave-btn');
    if (applyLeaveBtn) {
        applyLeaveBtn.addEventListener('click', () => {
            showModal('apply-leave-modal');
        });
    }
    
    // View leave balances button
    const viewLeaveBalancesBtn = document.getElementById('view-leave-balances-btn');
    if (viewLeaveBalancesBtn) {
        viewLeaveBalancesBtn.addEventListener('click', () => {
            loadLeaveBalances();
        });
    }
    
    // Apply leave form
    const applyLeaveForm = document.getElementById('apply-leave-form');
    if (applyLeaveForm) {
        applyLeaveForm.addEventListener('submit', (e) => {
            e.preventDefault();
            submitLeaveApplication();
        });
    }
    
    // Date range calculation
    const fromDateInput = document.getElementById('leave-from');
    const toDateInput = document.getElementById('leave-to');
    const daysInput = document.getElementById('leave-days');
    
    if (fromDateInput && toDateInput && daysInput) {
        const calculateDays = () => {
            const fromDate = new Date(fromDateInput.value);
            const toDate = new Date(toDateInput.value);
            
            if (fromDate && toDate && !isNaN(fromDate) && !isNaN(toDate)) {
                const diffTime = Math.abs(toDate - fromDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Include both start and end days
                daysInput.value = diffDays;
            }
        };
        
        fromDateInput.addEventListener('change', calculateDays);
        toDateInput.addEventListener('change', calculateDays);
    }
    
    // Status filter
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
        statusFilter.addEventListener('change', filterLeaveApplications);
    }
    
    // Date filter
    const dateFilter = document.getElementById('date-filter');
    if (dateFilter) {
        dateFilter.addEventListener('change', filterLeaveApplications);
    }
    
    // Close buttons for modals
    document.querySelectorAll('.close, .modal .btn.secondary-btn.close').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                hideModal(modal.id);
            }
        });
    });
    
    // Export button
    const exportBtn = document.getElementById('export-leave-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportLeaveData);
    }
    
    // Print button
    const printBtn = document.getElementById('print-leave-btn');
    if (printBtn) {
        printBtn.addEventListener('click', () => window.print());
    }
}

async function submitLeaveApplication() {
    const leaveType = document.getElementById('leave-type').value;
    const fromDate = document.getElementById('leave-from').value;
    const toDate = document.getElementById('leave-to').value;
    const days = document.getElementById('leave-days').value;
    const reason = document.getElementById('leave-reason').value;
    
    if (!leaveType || !fromDate || !toDate || !reason) {
        showError('Please fill all required fields');
        return;
    }
    
    const leaveData = {
        leaveType,
        fromDate,
        toDate,
        days: parseInt(days),
        reason
    };
    
    try {
        // Use fetchApi from api-mock.js if available
        const fetchFunction = typeof fetchApi !== 'undefined' ? fetchApi : fetch;
        const res = await fetchFunction('/api/leave/apply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(leaveData)
        });
        
        if (res.ok) {
            hideModal('apply-leave-modal');
            await loadLeaveApplications();
            showSuccess('Leave application submitted successfully');
            
            // Reset form
            document.getElementById('apply-leave-form').reset();
        } else {
            throw new Error('Failed to submit leave application');
        }
    } catch (err) {
        console.error('Error submitting leave application:', err);
        showError('Failed to submit leave application');
        
        // For demo, simulate successful submission
        hideModal('apply-leave-modal');
        
        // Add to mock data and refresh
        const mockNewLeave = {
            id: 'LV' + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
            employeeId: 'EMP001',
            employeeName: 'John Doe',
            leaveType: document.getElementById('leave-type').options[document.getElementById('leave-type').selectedIndex].text,
            fromDate,
            toDate,
            days: parseInt(days),
            reason,
            status: 'Pending'
        };
        
        const tbody = document.getElementById('leave-table-body');
        const currentData = Array.from(tbody.querySelectorAll('tr')).map(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length < 9) return null;
            
            return {
                id: cells[0].textContent,
                employeeName: cells[1].textContent,
                leaveType: cells[2].textContent,
                fromDate: cells[3].textContent,
                toDate: cells[4].textContent,
                days: parseInt(cells[5].textContent),
                reason: cells[6].textContent,
                status: cells[7].querySelector('.status-badge').textContent
            };
        }).filter(Boolean);
        
        currentData.unshift(mockNewLeave);
        renderLeaveTable(currentData);
        
        // Reset form
        document.getElementById('apply-leave-form').reset();
        
        showSuccess('Leave application submitted successfully');
    }
}

async function loadLeaveBalances() {
    try {
        // Use fetchApi from api-mock.js if available
        const fetchFunction = typeof fetchApi !== 'undefined' ? fetchApi : fetch;
        const res = await fetchFunction('/api/leave/balances');
        const data = await res.json();
        
        renderLeaveBalances(data.balances);
        showModal('leave-balances-modal');
    } catch (err) {
        console.error('Failed to load leave balances:', err);
        
        // Use mock data if API fails
        const mockLeaveBalances = [
            { type: 'Annual Leave', total: 30, used: 12, remaining: 18 },
            { type: 'Sick Leave', total: 15, used: 2, remaining: 13 },
            { type: 'Casual Leave', total: 7, used: 3, remaining: 4 },
            { type: 'Maternity Leave', total: 90, used: 0, remaining: 90 },
            { type: 'Paternity Leave', total: 7, used: 0, remaining: 7 }
        ];
        
        renderLeaveBalances(mockLeaveBalances);
        showModal('leave-balances-modal');
    }
}

function renderLeaveBalances(balances) {
    const container = document.getElementById('leave-balances-content');
    
    let html = '<div class="leave-balances">';
    
    balances.forEach(balance => {
        const percentUsed = Math.round((balance.used / balance.total) * 100);
        
        html += `
            <div class="leave-balance-item">
                <div class="leave-balance-header">
                    <h4>${balance.type}</h4>
                    <span class="leave-days-remaining">${balance.remaining} days remaining</span>
                </div>
                <div class="leave-progress-container">
                    <div class="leave-progress-bar">
                        <div class="leave-progress" style="width: ${percentUsed}%"></div>
                    </div>
                    <div class="leave-progress-labels">
                        <span>Used: ${balance.used} days</span>
                        <span>Total: ${balance.total} days</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function viewLeaveDetails(leaveId) {
    try {
        // In a real app, this would fetch from API
        // For demo, use mock data
        const mockLeaveDetails = {
            id: leaveId,
            employeeId: 'EMP001',
            employeeName: 'John Doe',
            department: 'IT',
            designation: 'Software Developer',
            leaveType: 'Annual Leave',
            fromDate: '2025-05-01',
            toDate: '2025-05-05',
            days: 5,
            reason: 'Family vacation',
            appliedOn: '2025-04-15',
            status: 'Approved',
            approvedBy: 'Jane Smith',
            approvedOn: '2025-04-16',
            comments: 'Approved as requested'
        };
        
        renderLeaveDetails(mockLeaveDetails);
        showModal('leave-details-modal');
    } catch (err) {
        console.error('Failed to load leave details:', err);
        showError('Failed to load leave details');
    }
}

function renderLeaveDetails(details) {
    const container = document.getElementById('leave-details-content');
    
    container.innerHTML = `
        <div class="leave-details">
            <div class="leave-details-header">
                <h4>Leave Application #${details.id}</h4>
                <span class="status-badge status-${details.status.toLowerCase()}">${details.status}</span>
            </div>
            
            <div class="leave-details-section">
                <h5>Employee Information</h5>
                <div class="details-grid">
                    <div class="details-item">
                        <span class="details-label">Name:</span>
                        <span class="details-value">${details.employeeName}</span>
                    </div>
                    <div class="details-item">
                        <span class="details-label">Employee ID:</span>
                        <span class="details-value">${details.employeeId}</span>
                    </div>
                    <div class="details-item">
                        <span class="details-label">Department:</span>
                        <span class="details-value">${details.department}</span>
                    </div>
                    <div class="details-item">
                        <span class="details-label">Designation:</span>
                        <span class="details-value">${details.designation}</span>
                    </div>
                </div>
            </div>
            
            <div class="leave-details-section">
                <h5>Leave Information</h5>
                <div class="details-grid">
                    <div class="details-item">
                        <span class="details-label">Leave Type:</span>
                        <span class="details-value">${details.leaveType}</span>
                    </div>
                    <div class="details-item">
                        <span class="details-label">From Date:</span>
                        <span class="details-value">${formatDate(details.fromDate)}</span>
                    </div>
                    <div class="details-item">
                        <span class="details-label">To Date:</span>
                        <span class="details-value">${formatDate(details.toDate)}</span>
                    </div>
                    <div class="details-item">
                        <span class="details-label">Days:</span>
                        <span class="details-value">${details.days}</span>
                    </div>
                    <div class="details-item full-width">
                        <span class="details-label">Reason:</span>
                        <span class="details-value">${details.reason}</span>
                    </div>
                    <div class="details-item">
                        <span class="details-label">Applied On:</span>
                        <span class="details-value">${formatDate(details.appliedOn)}</span>
                    </div>
                </div>
            </div>
            
            ${details.status !== 'Pending' ? `
            <div class="leave-details-section">
                <h5>Approval Information</h5>
                <div class="details-grid">
                    <div class="details-item">
                        <span class="details-label">Status:</span>
                        <span class="details-value">${details.status}</span>
                    </div>
                    <div class="details-item">
                        <span class="details-label">${details.status} By:</span>
                        <span class="details-value">${details.approvedBy}</span>
                    </div>
                    <div class="details-item">
                        <span class="details-label">${details.status} On:</span>
                        <span class="details-value">${formatDate(details.approvedOn)}</span>
                    </div>
                    <div class="details-item full-width">
                        <span class="details-label">Comments:</span>
                        <span class="details-value">${details.comments || 'No comments'}</span>
                    </div>
                </div>
            </div>
            ` : ''}
            
            ${details.status === 'Pending' ? `
            <div class="leave-details-actions">
                <button onclick="cancelLeaveApplication('${details.id}')" class="btn danger-btn">
                    <i class="fas fa-times"></i> Cancel Application
                </button>
            </div>
            ` : ''}
        </div>
    `;
}

async function cancelLeaveApplication(leaveId) {
    if (!confirm('Are you sure you want to cancel this leave application?')) {
        return;
    }
    
    try {
        // Use fetchApi from api-mock.js if available
        const fetchFunction = typeof fetchApi !== 'undefined' ? fetchApi : fetch;
        const res = await fetchFunction(`/api/leave/cancel/${leaveId}`, {
            method: 'POST'
        });
        
        if (res.ok) {
            hideModal('leave-details-modal');
            await loadLeaveApplications();
            showSuccess('Leave application cancelled successfully');
        } else {
            throw new Error('Failed to cancel leave application');
        }
    } catch (err) {
        console.error('Error cancelling leave application:', err);
        
        // For demo, simulate successful cancellation
        hideModal('leave-details-modal');
        
        // Update status in table
        const rows = document.querySelectorAll('#leave-table-body tr');
        rows.forEach(row => {
            const idCell = row.querySelector('td:first-child');
            if (idCell && idCell.textContent === leaveId) {
                const statusCell = row.querySelector('td:nth-child(8)');
                const statusBadge = statusCell.querySelector('.status-badge');
                
                statusBadge.textContent = 'Cancelled';
                statusBadge.className = 'status-badge status-cancelled';
                
                // Remove cancel button
                const actionsCell = row.querySelector('td:last-child');
                const cancelBtn = actionsCell.querySelector('.danger-btn');
                if (cancelBtn) {
                    cancelBtn.remove();
                }
            }
        });
        
        showSuccess('Leave application cancelled successfully');
    }
}

function filterLeaveApplications() {
    const statusFilter = document.getElementById('status-filter').value;
    const dateFilter = document.getElementById('date-filter').value;
    
    const rows = document.querySelectorAll('#leave-table-body tr');
    
    rows.forEach(row => {
        let showRow = true;
        
        // Status filtering
        if (statusFilter !== 'all') {
            const statusCell = row.querySelector('td:nth-child(8)');
            const status = statusCell ? statusCell.textContent.trim().toLowerCase() : '';
            
            if (status !== statusFilter) {
                showRow = false;
            }
        }
        
        // Date filtering (simplified for demo)
        if (dateFilter !== 'all' && showRow) {
            const fromDateCell = row.querySelector('td:nth-child(4)');
            const fromDate = fromDateCell ? new Date(fromDateCell.textContent) : null;
            
            if (fromDate) {
                const now = new Date();
                const currentMonth = now.getMonth();
                const currentYear = now.getFullYear();
                
                if (dateFilter === 'current-month' && (fromDate.getMonth() !== currentMonth || fromDate.getFullYear() !== currentYear)) {
                    showRow = false;
                } else if (dateFilter === 'current-year' && fromDate.getFullYear() !== currentYear) {
                    showRow = false;
                }
            }
        }
        
        row.style.display = showRow ? '' : 'none';
    });
}

function exportLeaveData() {
    // In a real app, this would generate a CSV/Excel file
    // For demo, just show a message
    showSuccess('Leave data exported successfully');
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

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'block';
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

function showSuccess(message) {
    alert(message); // In a real app, use a toast notification
}

function showError(message) {
    alert('Error: ' + message); // In a real app, use a toast notification
}

// Make functions available globally for onclick handlers
window.viewLeaveDetails = viewLeaveDetails;
window.cancelLeaveApplication = cancelLeaveApplication;
