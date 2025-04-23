// State management
let trainers = [];
let trainings = [];
let employees = [];
let worksites = [];
let departments = [];
let trainingParticipants = [];
let currentCalendarView = 'month';
let currentDate = new Date();

// Mock data for trainers
const mockTrainers = [
    {
        id: 1,
        name: "John Smith",
        specialty: "Leadership Development",
        certification: "Certified Leadership Coach",
        experience: "10 years",
        email: "john.smith@optiforce.com",
        phone: "555-123-4567",
        availability: "Full-time",
        rating: 4.8
    },
    {
        id: 2,
        name: "Sarah Johnson",
        specialty: "Technical Skills",
        certification: "Microsoft Certified Trainer",
        experience: "8 years",
        email: "sarah.johnson@optiforce.com",
        phone: "555-234-5678",
        availability: "Part-time",
        rating: 4.6
    },
    {
        id: 3,
        name: "David Chen",
        specialty: "Soft Skills",
        certification: "Certified Professional Trainer",
        experience: "12 years",
        email: "david.chen@optiforce.com",
        phone: "555-345-6789",
        availability: "Full-time",
        rating: 4.9
    }
];

// Mock data for trainings
const mockTrainings = [
    {
        id: 1,
        title: "Leadership Essentials",
        description: "Core leadership skills for new managers",
        trainer_id: 1,
        category: "Leadership",
        duration: "16 hours",
        format: "In-person",
        start_date: "2025-05-10",
        end_date: "2025-05-11",
        max_participants: 20,
        current_participants: 15,
        status: "Upcoming",
        location: "Main Office Training Room"
    },
    {
        id: 2,
        title: "Microsoft Excel Advanced",
        description: "Advanced Excel techniques for data analysis",
        trainer_id: 2,
        category: "Technical",
        duration: "8 hours",
        format: "Virtual",
        start_date: "2025-05-15",
        end_date: "2025-05-15",
        max_participants: 30,
        current_participants: 22,
        status: "Upcoming",
        location: "Virtual Meeting Room"
    },
    {
        id: 3,
        title: "Effective Communication",
        description: "Improve workplace communication skills",
        trainer_id: 3,
        category: "Soft Skills",
        duration: "12 hours",
        format: "Hybrid",
        start_date: "2025-05-20",
        end_date: "2025-05-21",
        max_participants: 25,
        current_participants: 18,
        status: "Upcoming",
        location: "Conference Room B & Virtual"
    }
];

// Fetch data functions
async function fetchTrainers() {
    try {
        // Try to fetch from API first
        const response = await fetch('/api/trainers');
        if (response.ok) {
            trainers = await response.json();
        } else {
            // If API fails, use mock data
            console.log('Using mock trainer data');
            trainers = mockTrainers;
        }
        renderTrainers();
        updateTrainerSelect();
    } catch (err) {
        console.error('Error fetching trainers:', err);
        // Use mock data on error
        console.log('Using mock trainer data after error');
        trainers = mockTrainers;
        renderTrainers();
        updateTrainerSelect();
    }
}

async function fetchTrainings() {
    try {
        // Try to fetch from API first
        const response = await fetch('/api/trainings');
        if (response.ok) {
            trainings = await response.json();
        } else {
            // If API fails, use mock data
            console.log('Using mock training data');
            trainings = mockTrainings;
        }
        renderTrainings();
        updateTrainingCalendar();
        updateTrainingSelect();
        updateReportData();
    } catch (err) {
        console.error('Error fetching trainings:', err);
        // Use mock data on error
        console.log('Using mock training data after error');
        trainings = mockTrainings;
        renderTrainings();
        updateTrainingCalendar();
        updateTrainingSelect();
        updateReportData();
    }
}

// Mock data for employees
const mockEmployees = [
    {
        "EMP NO": "EMP001",
        "Employee Name": "James Wilson",
        "Designation": "HR Manager",
        "Department": "HR",
        "Work Site": "Office",
        "Joined Date": "2020-03-15"
    },
    {
        "EMP NO": "EMP002",
        "Employee Name": "Emily Davis",
        "Designation": "Training Coordinator",
        "Department": "HR",
        "Work Site": "Office",
        "Joined Date": "2021-05-10"
    },
    {
        "EMP NO": "EMP003",
        "Employee Name": "Michael Brown",
        "Designation": "IT Specialist",
        "Department": "IT",
        "Work Site": "Office",
        "Joined Date": "2019-11-22"
    },
    {
        "EMP NO": "EMP004",
        "Employee Name": "Jessica Lee",
        "Designation": "Marketing Coordinator",
        "Department": "Marketing",
        "Work Site": "Site A",
        "Joined Date": "2022-01-05"
    },
    {
        "EMP NO": "EMP005",
        "Employee Name": "Robert Taylor",
        "Designation": "Sales Representative",
        "Department": "Sales",
        "Work Site": "Site B",
        "Joined Date": "2021-08-17"
    }
];

// Mock data for worksites
const mockWorksites = [
    { id: 1, name: "Office", location: "Headquarters" },
    { id: 2, name: "Site A", location: "North Region" },
    { id: 3, name: "Site B", location: "South Region" },
    { id: 4, name: "Remote", location: "Various Locations" }
];

// Mock data for departments
const mockDepartments = [
    { id: 1, name: "HR", description: "Human Resources department" },
    { id: 2, name: "IT", description: "Information Technology department" },
    { id: 3, name: "Marketing", description: "Marketing department" },
    { id: 4, name: "Sales", description: "Sales department" },
    { id: 5, name: "Finance", description: "Finance department" }
];

async function fetchEmployees() {
    try {
        // Try to fetch from API first
        const response = await fetch('/api/employees');
        if (response.ok) {
            employees = await response.json();
        } else {
            // If API fails, use mock data
            console.log('Using mock employee data');
            employees = mockEmployees;
        }
        updateEmployeeSelection();
        renderParticipants();
    } catch (err) {
        console.error('Error fetching employees:', err);
        // Use mock data on error
        console.log('Using mock employee data after error');
        employees = mockEmployees;
        updateEmployeeSelection();
        renderParticipants();
    }
}

async function fetchWorksites() {
    try {
        // Try to fetch from API first
        const response = await fetch('/api/worksites');
        if (response.ok) {
            worksites = await response.json();
        } else {
            // If API fails, use mock data
            console.log('Using mock worksite data');
            worksites = mockWorksites;
        }
        updateWorksiteFilter();
        updateWorksiteSelect();
    } catch (err) {
        console.error('Error loading worksites:', err);
        // Use mock data on error
        console.log('Using mock worksite data after error');
        worksites = mockWorksites;
        updateWorksiteFilter();
        updateWorksiteSelect();
    }
}

async function fetchDepartments() {
    try {
        const response = await fetch('/api/departments');
        departments = await response.json();
        updateDepartmentFilter();
    } catch (err) {
        console.error('Error fetching departments:', err);
    }
}

async function fetchTrainingParticipants() {
    try {
        // In a real app, this would be a separate API endpoint
        // For now, we'll extract participants from trainings
        trainingParticipants = [];
        trainings.forEach(training => {
            if (training.participants && training.participants.length) {
                training.participants.forEach(participant => {
                    trainingParticipants.push({
                        employeeId: participant,
                        trainingId: training._id || training.id,
                        trainingName: training.name || training.title,
                        startDate: training.startDate,
                        status: 'enrolled',
                        completion: 0
                    });
                });
            }
        });
        renderParticipants();
    } catch (err) {
        console.error('Error processing training participants:', err);
    }
}

// Render functions
function renderTrainers() {
    const container = document.getElementById('trainersContainer');
    container.innerHTML = trainers.map(trainer => `
        <div class="trainer-card">
            <h3>${trainer.name}</h3>
            <div class="trainer-info">
                <p><strong>Specialization:</strong> ${trainer.specialization}</p>
                <p><strong>Qualifications:</strong> ${trainer.qualifications}</p>
            </div>
            <div class="trainer-actions">
                <button class="edit-btn" onclick="editTrainer('${trainer.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="delete-btn" onclick="deleteTrainer('${trainer.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

function renderTrainings() {
    const container = document.getElementById('trainingProgramsContainer');
    const worksiteFilter = document.getElementById('worksiteFilter').value;
    const searchQuery = document.getElementById('searchTraining').value.toLowerCase();

    const filteredTrainings = trainings.filter(training => {
        const matchesWorksite = !worksiteFilter || training.worksiteId === worksiteFilter;
        const matchesSearch = training.title.toLowerCase().includes(searchQuery) ||
                            training.description.toLowerCase().includes(searchQuery);
        return matchesWorksite && matchesSearch;
    });

    container.innerHTML = filteredTrainings.map(training => `
        <div class="training-card">
            <h3>${training.title}</h3>
            <div class="training-meta">
                <span><i class="fas fa-map-marker-alt"></i> ${getWorksiteName(training.worksiteId)}</span>
                <span><i class="fas fa-calendar"></i> ${formatDate(training.startDate)}</span>
            </div>
            <p class="training-description">${training.description}</p>
            <div class="training-actions">
                <button class="view-btn" onclick="viewTrainingDetails('${training.id}')">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="edit-btn" onclick="editTraining('${training.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="delete-btn" onclick="deleteTraining('${training.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Modal management
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function hideModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    fetchTrainers();
    fetchTrainings();
    fetchEmployees();
    fetchWorksites();
    fetchDepartments();
    
    // Initialize the calendar
    initializeCalendar();
    
    // Initialize charts for dashboard
    initializeDashboardCharts();
    
    // Add event listeners for close buttons
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            hideModal(modal.id);
        });
    });

    // Add event listeners for modal forms
    document.getElementById('trainerForm').addEventListener('submit', handleTrainerSubmit);
    document.getElementById('trainingForm').addEventListener('submit', handleTrainingSubmit);

    // Add event listeners for add buttons
    document.getElementById('addTrainerBtn').addEventListener('click', () => {
        document.getElementById('trainerForm').reset();
        document.getElementById('trainerForm').removeAttribute('data-id');
        document.getElementById('trainerModalTitle').textContent = 'Add Trainer';
        showModal('trainerModal');
    });

    document.getElementById('addTrainingBtn').addEventListener('click', () => {
        document.getElementById('trainingForm').reset();
        document.getElementById('trainingForm').removeAttribute('data-id');
        document.getElementById('trainingModalTitle').textContent = 'Add Training Program';
        showModal('trainingModal');
    });

    // Add event listeners for filters
    document.getElementById('worksiteFilter').addEventListener('change', renderTrainings);
    document.getElementById('searchTraining').addEventListener('input', renderTrainings);
    
    // Calendar navigation
    document.getElementById('prevBtn').addEventListener('click', () => navigateCalendar('prev'));
    document.getElementById('nextBtn').addEventListener('click', () => navigateCalendar('next'));
    document.getElementById('todayBtn').addEventListener('click', () => navigateCalendar('today'));
    
    // Calendar view buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCalendarView = btn.dataset.view;
            updateTrainingCalendar();
        });
    });
    
    // Participant filters
    document.getElementById('searchParticipant').addEventListener('input', renderParticipants);
    document.getElementById('trainingFilterForParticipants').addEventListener('change', renderParticipants);
    document.getElementById('departmentFilterForParticipants').addEventListener('change', renderParticipants);
    document.getElementById('worksiteFilterForParticipants').addEventListener('change', renderParticipants);
    
    // Report filters
    document.getElementById('reportType').addEventListener('change', updateReportView);
    document.getElementById('reportPeriod').addEventListener('change', handleReportPeriodChange);
    document.getElementById('applyReportFilters').addEventListener('click', updateReportData);
    
    // Assign participants button
    document.getElementById('assignParticipantsBtn').addEventListener('click', () => {
        showModal('assignParticipantsModal');
    });
    
    // Generate report button
    document.getElementById('generateReportBtn').addEventListener('click', generateReport);
    
    // Print calendar button
    document.getElementById('printCalendarBtn').addEventListener('click', printCalendar);
    
    // Settings save button
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
    
    // Add category button
    document.getElementById('addCategoryBtn').addEventListener('click', addTrainingCategory);
    
    // Delete category buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const categoryItem = this.closest('.category-item');
            if (categoryItem) {
                categoryItem.remove();
            }
        });
    });
});

// Form handlers
async function handleTrainerSubmit(e) {
    e.preventDefault();
    const formData = {
        name: document.getElementById('trainerName').value,
        specialization: document.getElementById('trainerSpecialization').value,
        qualifications: document.getElementById('trainerQualifications').value,
        contact: document.getElementById('trainerContact').value
    };

    const id = e.target.dataset.id;
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/trainers/${id}` : '/api/trainers';

    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            hideModal('trainerModal');
            fetchTrainers();
        }
    } catch (err) {
        console.error('Error saving trainer:', err);
    }
}

async function handleTrainingSubmit(e) {
    e.preventDefault();
    const selectedEmployees = Array.from(document.querySelectorAll('#employeeSelection input:checked'))
        .map(input => input.value);

    const formData = {
        title: document.getElementById('trainingTitle').value,
        description: document.getElementById('trainingDescription').value,
        type: document.getElementById('trainingType').value,
        worksiteId: document.getElementById('trainingWorksite').value,
        trainerId: document.getElementById('trainingTrainer').value,
        startDate: document.getElementById('trainingStartDate').value,
        endDate: document.getElementById('trainingEndDate').value,
        capacity: document.getElementById('trainingCapacity').value,
        participants: selectedEmployees
    };

    const id = e.target.dataset.id;
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/trainings/${id}` : '/api/trainings';

    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            hideModal('trainingModal');
            fetchTrainings();
        }
    } catch (err) {
        console.error('Error saving training:', err);
    }
}

// Helper functions
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}

function getWorksiteName(id) {
    const worksite = worksites.find(w => w.id === id);
    return worksite ? worksite.name : 'Unknown';
}

// Update select options
function updateTrainerSelect() {
    const select = document.getElementById('trainingTrainer');
    select.innerHTML = '<option value="">Select Trainer</option>' +
        trainers.map(trainer => `
            <option value="${trainer.id}">${trainer.name} (${trainer.specialization})</option>
        `).join('');
}

function updateWorksiteSelect() {
    const select = document.getElementById('trainingWorksite');
    select.innerHTML = '<option value="">Select Worksite</option>' +
        worksites.map(site => `
            <option value="${site.id}">${site.name}</option>
        `).join('');
}

function updateWorksiteFilter() {
    const select = document.getElementById('worksiteFilter');
    select.innerHTML = '<option value="">All Worksites</option>' +
        worksites.map(site => `
            <option value="${site.id}">${site.name}</option>
        `).join('');
}

function updateEmployeeSelection() {
    const container = document.getElementById('employeeSelection');
    container.innerHTML = employees.map(emp => `
        <label>
            <input type="checkbox" value="${emp.id}">
            ${emp.name}
        </label>
    `).join('');
}

// CRUD operations
async function editTrainer(id) {
    try {
        const response = await fetch(`/api/trainers/${id}`);
        const trainer = await response.json();
        
        document.getElementById('trainerName').value = trainer.name;
        document.getElementById('trainerSpecialization').value = trainer.specialization;
        document.getElementById('trainerQualifications').value = trainer.qualifications;
        document.getElementById('trainerContact').value = trainer.contact;
        
        document.getElementById('trainerForm').dataset.id = id;
        document.getElementById('trainerModalTitle').textContent = 'Edit Trainer';
        showModal('trainerModal');
    } catch (err) {
        console.error('Error loading trainer:', err);
    }
}

async function editTraining(id) {
    try {
        const response = await fetch(`/api/trainings/${id}`);
        const training = await response.json();
        
        document.getElementById('trainingTitle').value = training.title;
        document.getElementById('trainingDescription').value = training.description;
        document.getElementById('trainingType').value = training.type;
        document.getElementById('trainingWorksite').value = training.worksiteId;
        document.getElementById('trainingTrainer').value = training.trainerId;
        document.getElementById('trainingStartDate').value = training.startDate.split('T')[0];
        document.getElementById('trainingEndDate').value = training.endDate.split('T')[0];
        document.getElementById('trainingCapacity').value = training.capacity;
        
        // Update employee selection
        const checkboxes = document.querySelectorAll('#employeeSelection input');
        checkboxes.forEach(cb => {
            cb.checked = training.participants.includes(cb.value);
        });
        
        document.getElementById('trainingForm').dataset.id = id;
        document.getElementById('trainingModalTitle').textContent = 'Edit Training Program';
        showModal('trainingModal');
    } catch (err) {
        console.error('Error loading training:', err);
    }
}

async function deleteTrainer(id) {
    if (confirm('Are you sure you want to delete this trainer?')) {
        try {
            const response = await fetch(`/api/trainers/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                fetchTrainers();
            }
        } catch (err) {
            console.error('Error deleting trainer:', err);
        }
    }
}

async function deleteTraining(id) {
    if (confirm('Are you sure you want to delete this training program?')) {
        try {
            const response = await fetch(`/api/trainings/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                fetchTrainings();
            }
        } catch (err) {
            console.error('Error deleting training:', err);
        }
    }
}

async function viewTrainingDetails(id) {
    const training = trainings.find(t => t.id === id || t._id === id);
    if (!training) return;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'trainingDetailsModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${training.title || training.name}</h2>
                <span class="close-btn">&times;</span>
            </div>
            <div class="modal-body">
                <div class="training-details">
                    <div class="detail-group">
                        <h3>Training Information</h3>
                        <p><strong>Type:</strong> ${training.type}</p>
                        <p><strong>Description:</strong> ${training.description}</p>
                        <p><strong>Location:</strong> ${getWorksiteName(training.worksiteId)}</p>
                        <p><strong>Dates:</strong> ${formatDate(training.startDate)} to ${formatDate(training.endDate)}</p>
                        <p><strong>Capacity:</strong> ${training.capacity || training.maxParticipants} participants</p>
                        <p><strong>Status:</strong> <span class="status-badge ${training.status}">${training.status}</span></p>
                    </div>
                    
                    <div class="detail-group">
                        <h3>Trainer</h3>
                        <p>${getTrainerName(training.trainerId || training.trainer)}</p>
                    </div>
                    
                    <div class="detail-group">
                        <h3>Participants</h3>
                        <div class="participants-list">
                            ${renderParticipantsList(training.participants)}
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="secondary-btn" onclick="hideModal('trainingDetailsModal')">Close</button>
                <button class="primary-btn" onclick="editTraining('${training.id || training._id}')">Edit Training</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'block';

    // Add event listener for close button
    modal.querySelector('.close-btn').addEventListener('click', () => {
        hideModal('trainingDetailsModal');
        setTimeout(() => modal.remove(), 300);
    });
}

// Calendar functions
function initializeCalendar() {
    updateCalendarHeader();
    updateTrainingCalendar();
}

function updateCalendarHeader() {
    const header = document.getElementById('currentPeriod');
    if (!header) return;
    
    const options = { year: 'numeric', month: 'long' };
    if (currentCalendarView === 'day') {
        options.day = 'numeric';
    } else if (currentCalendarView === 'week') {
        // Show the week range
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        header.textContent = `${weekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
        return;
    }
    
    header.textContent = currentDate.toLocaleDateString(undefined, options);
}

function navigateCalendar(direction) {
    if (direction === 'prev') {
        if (currentCalendarView === 'month') {
            currentDate.setMonth(currentDate.getMonth() - 1);
        } else if (currentCalendarView === 'week') {
            currentDate.setDate(currentDate.getDate() - 7);
        } else {
            currentDate.setDate(currentDate.getDate() - 1);
        }
    } else if (direction === 'next') {
        if (currentCalendarView === 'month') {
            currentDate.setMonth(currentDate.getMonth() + 1);
        } else if (currentCalendarView === 'week') {
            currentDate.setDate(currentDate.getDate() + 7);
        } else {
            currentDate.setDate(currentDate.getDate() + 1);
        }
    } else if (direction === 'today') {
        currentDate = new Date();
    }
    
    updateCalendarHeader();
    updateTrainingCalendar();
}

function updateTrainingCalendar() {
    const calendarContainer = document.getElementById('trainingCalendar');
    if (!calendarContainer) return;
    
    if (currentCalendarView === 'month') {
        renderMonthView(calendarContainer);
    } else if (currentCalendarView === 'week') {
        renderWeekView(calendarContainer);
    } else {
        renderDayView(calendarContainer);
    }
}

function renderMonthView(container) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get first day of month and last day
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the day of week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDay.getDay();
    
    // Create calendar grid
    let calendarHTML = `
        <div class="calendar-month">
            <div class="calendar-header">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
            </div>
            <div class="calendar-body">
    `;
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
        calendarHTML += `<div class="calendar-day empty"></div>`;
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month, day);
        const isToday = date.toDateString() === new Date().toDateString();
        
        // Get trainings for this day
        const dayTrainings = trainings.filter(training => {
            const startDate = new Date(training.startDate);
            const endDate = new Date(training.endDate);
            return date >= startDate && date <= endDate;
        });
        
        calendarHTML += `
            <div class="calendar-day ${isToday ? 'today' : ''}">
                <div class="day-number">${day}</div>
                <div class="day-events">
                    ${dayTrainings.map(training => `
                        <div class="calendar-event" onclick="viewTrainingDetails('${training.id || training._id}')">
                            ${training.title || training.name}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // Add empty cells for days after the last day of the month if needed
    const totalCells = firstDayOfWeek + lastDay.getDate();
    const remainingCells = 7 - (totalCells % 7);
    if (remainingCells < 7) {
        for (let i = 0; i < remainingCells; i++) {
            calendarHTML += `<div class="calendar-day empty"></div>`;
        }
    }
    
    calendarHTML += `
            </div>
        </div>
    `;
    
    container.innerHTML = calendarHTML;
}

function renderWeekView(container) {
    // Get the start of the week (Sunday)
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay());
    
    let calendarHTML = `
        <div class="calendar-week">
            <div class="time-column">
                <div class="time-header"></div>
                ${Array.from({ length: 24 }, (_, i) => `
                    <div class="time-slot">${i}:00</div>
                `).join('')}
            </div>
    `;
    
    // Create columns for each day of the week
    for (let i = 0; i < 7; i++) {
        const day = new Date(weekStart);
        day.setDate(weekStart.getDate() + i);
        const isToday = day.toDateString() === new Date().toDateString();
        
        // Get trainings for this day
        const dayTrainings = trainings.filter(training => {
            const startDate = new Date(training.startDate);
            const endDate = new Date(training.endDate);
            return day >= startDate && day <= endDate;
        });
        
        calendarHTML += `
            <div class="day-column ${isToday ? 'today' : ''}">
                <div class="day-header">${day.toLocaleDateString(undefined, { weekday: 'short', month: 'numeric', day: 'numeric' })}</div>
                <div class="day-events">
                    ${dayTrainings.map(training => {
                        const startTime = new Date(training.startDate).getHours();
                        const endTime = new Date(training.endDate).getHours() + 1;
                        const duration = endTime - startTime;
                        return `
                            <div class="week-event" 
                                style="top: ${startTime * 60}px; height: ${duration * 60}px;"
                                onclick="viewTrainingDetails('${training.id || training._id}')">
                                ${training.title || training.name}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    calendarHTML += `</div>`;
    container.innerHTML = calendarHTML;
}

function renderDayView(container) {
    const day = new Date(currentDate);
    const isToday = day.toDateString() === new Date().toDateString();
    
    // Get trainings for this day
    const dayTrainings = trainings.filter(training => {
        const startDate = new Date(training.startDate);
        const endDate = new Date(training.endDate);
        return day >= startDate && day <= endDate;
    });
    
    let calendarHTML = `
        <div class="calendar-day-view ${isToday ? 'today' : ''}">
            <div class="time-column">
                ${Array.from({ length: 24 }, (_, i) => `
                    <div class="time-slot">${i}:00</div>
                `).join('')}
            </div>
            <div class="events-column">
                ${dayTrainings.map(training => {
                    const startTime = new Date(training.startDate).getHours();
                    const endTime = new Date(training.endDate).getHours() + 1;
                    const duration = endTime - startTime;
                    return `
                        <div class="day-event" 
                            style="top: ${startTime * 60}px; height: ${duration * 60}px;"
                            onclick="viewTrainingDetails('${training.id || training._id}')">
                            <div class="event-time">${startTime}:00 - ${endTime}:00</div>
                            <div class="event-title">${training.title || training.name}</div>
                            <div class="event-trainer">${getTrainerName(training.trainerId || training.trainer)}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
    
    container.innerHTML = calendarHTML;
}

function printCalendar() {
    const printWindow = window.open('', '_blank');
    const calendarContainer = document.getElementById('trainingCalendar');
    
    printWindow.document.write(`
        <html>
            <head>
                <title>Training Calendar - ${document.getElementById('currentPeriod').textContent}</title>
                <style>
                    body { font-family: Arial, sans-serif; }
                    .calendar-header { display: flex; justify-content: space-between; margin-bottom: 20px; }
                    .calendar-title { font-size: 24px; font-weight: bold; }
                    .calendar-month { width: 100%; border-collapse: collapse; }
                    .calendar-month th { padding: 10px; background-color: #f5f5f5; }
                    .calendar-month td { border: 1px solid #ddd; height: 100px; vertical-align: top; padding: 5px; }
                    .day-number { font-weight: bold; margin-bottom: 5px; }
                    .calendar-event { background-color: #e9f5ff; border-left: 3px solid #0077cc; padding: 5px; margin-bottom: 3px; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="calendar-header">
                    <div class="calendar-title">Training Calendar - ${document.getElementById('currentPeriod').textContent}</div>
                    <div>Printed on ${new Date().toLocaleDateString()}</div>
                </div>
                ${calendarContainer.outerHTML}
                <script>window.onload = function() { window.print(); }</script>
            </body>
        </html>
    `);
    
    printWindow.document.close();
}

// Participants functions
function renderParticipants() {
    const tableBody = document.getElementById('participantsTable');
    if (!tableBody) return;
    
    // Get filter values
    const searchQuery = document.getElementById('searchParticipant').value.toLowerCase();
    const trainingFilter = document.getElementById('trainingFilterForParticipants').value;
    const departmentFilter = document.getElementById('departmentFilterForParticipants').value;
    const worksiteFilter = document.getElementById('worksiteFilterForParticipants').value;
    
    // Prepare data by combining training participants with employee details
    const participantsData = [];
    
    trainingParticipants.forEach(participant => {
        const employee = employees.find(emp => emp.id === participant.employeeId || emp._id === participant.employeeId);
        if (employee) {
            const training = trainings.find(t => t.id === participant.trainingId || t._id === participant.trainingId);
            participantsData.push({
                ...participant,
                employeeName: employee.name,
                department: employee.department,
                worksite: employee.worksite,
                trainingName: training ? (training.title || training.name) : 'Unknown Training'
            });
        }
    });
    
    // Apply filters
    const filteredData = participantsData.filter(participant => {
        const matchesSearch = participant.employeeName.toLowerCase().includes(searchQuery) || 
                             participant.trainingName.toLowerCase().includes(searchQuery);
        const matchesTraining = !trainingFilter || participant.trainingId === trainingFilter;
        const matchesDepartment = !departmentFilter || participant.department === departmentFilter;
        const matchesWorksite = !worksiteFilter || participant.worksite === worksiteFilter;
        
        return matchesSearch && matchesTraining && matchesDepartment && matchesWorksite;
    });
    
    // Render table rows
    tableBody.innerHTML = filteredData.map(participant => `
        <tr>
            <td>${participant.employeeId}</td>
            <td>${participant.employeeName}</td>
            <td>${participant.department}</td>
            <td>${participant.worksite}</td>
            <td>${participant.trainingName}</td>
            <td>${formatDate(participant.startDate)}</td>
            <td><span class="status-badge ${participant.status}">${participant.status}</span></td>
            <td>
                <div class="progress-bar">
                    <div class="progress" style="width: ${participant.completion}%"></div>
                </div>
                <span>${participant.completion}%</span>
            </td>
            <td>
                <button class="action-btn" onclick="viewParticipantDetails('${participant.employeeId}', '${participant.trainingId}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn" onclick="updateParticipantStatus('${participant.employeeId}', '${participant.trainingId}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" onclick="removeParticipant('${participant.employeeId}', '${participant.trainingId}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function updateTrainingSelect() {
    const select = document.getElementById('trainingFilterForParticipants');
    if (!select) return;
    
    select.innerHTML = '<option value="">All Trainings</option>' +
        trainings.map(training => `
            <option value="${training.id || training._id}">${training.title || training.name}</option>
        `).join('');
}

function updateDepartmentFilter() {
    const select = document.getElementById('departmentFilterForParticipants');
    if (!select) return;
    
    select.innerHTML = '<option value="">All Departments</option>' +
        departments.map(dept => `
            <option value="${dept.id || dept._id}">${dept.name}</option>
        `).join('');
}

function getTrainerName(id) {
    const trainer = trainers.find(t => t.id === id || t._id === id);
    return trainer ? trainer.name : 'Unknown';
}

function renderParticipantsList(participants) {
    if (!participants || !participants.length) {
        return '<p>No participants assigned yet.</p>';
    }
    
    return `<ul>${participants.map(participantId => {
        const employee = employees.find(e => e.id === participantId || e._id === participantId);
        return `<li>${employee ? employee.name : `Unknown (${participantId})`}</li>`;
    }).join('')}</ul>`;
}

// Participant management functions
function viewParticipantDetails(employeeId, trainingId) {
    const employee = employees.find(e => e.id === employeeId || e._id === employeeId);
    const training = trainings.find(t => t.id === trainingId || t._id === trainingId);
    const participant = trainingParticipants.find(p => 
        (p.employeeId === employeeId || p.employeeId === employee._id) && 
        (p.trainingId === trainingId || p.trainingId === training._id)
    );
    
    if (!employee || !training || !participant) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'participantDetailsModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Participant Details</h2>
                <span class="close-btn">&times;</span>
            </div>
            <div class="modal-body">
                <div class="participant-details">
                    <div class="detail-group">
                        <h3>Employee Information</h3>
                        <p><strong>Name:</strong> ${employee.name}</p>
                        <p><strong>ID:</strong> ${employee.id || employee._id}</p>
                        <p><strong>Department:</strong> ${employee.department}</p>
                        <p><strong>Worksite:</strong> ${employee.worksite}</p>
                    </div>
                    
                    <div class="detail-group">
                        <h3>Training Information</h3>
                        <p><strong>Training:</strong> ${training.title || training.name}</p>
                        <p><strong>Dates:</strong> ${formatDate(training.startDate)} to ${formatDate(training.endDate)}</p>
                        <p><strong>Trainer:</strong> ${getTrainerName(training.trainerId || training.trainer)}</p>
                    </div>
                    
                    <div class="detail-group">
                        <h3>Participation Status</h3>
                        <p><strong>Status:</strong> <span class="status-badge ${participant.status}">${participant.status}</span></p>
                        <p><strong>Completion:</strong> ${participant.completion}%</p>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="secondary-btn" onclick="hideModal('participantDetailsModal')">Close</button>
                <button class="primary-btn" onclick="updateParticipantStatus('${employeeId}', '${trainingId}')">Update Status</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'block';

    // Add event listener for close button
    modal.querySelector('.close-btn').addEventListener('click', () => {
        hideModal('participantDetailsModal');
        setTimeout(() => modal.remove(), 300);
    });
}

function updateParticipantStatus(employeeId, trainingId) {
    const participant = trainingParticipants.find(p => p.employeeId === employeeId && p.trainingId === trainingId);
    if (!participant) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'updateStatusModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Update Participant Status</h2>
                <span class="close-btn">&times;</span>
            </div>
            <div class="modal-body">
                <form id="updateStatusForm">
                    <div class="form-group">
                        <label for="participantStatus">Status</label>
                        <select id="participantStatus">
                            <option value="enrolled" ${participant.status === 'enrolled' ? 'selected' : ''}>Enrolled</option>
                            <option value="in-progress" ${participant.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                            <option value="completed" ${participant.status === 'completed' ? 'selected' : ''}>Completed</option>
                            <option value="cancelled" ${participant.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="participantCompletion">Completion (%)</label>
                        <input type="number" id="participantCompletion" min="0" max="100" value="${participant.completion}">
                    </div>
                    <div class="form-group">
                        <label for="participantNotes">Notes</label>
                        <textarea id="participantNotes"></textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="secondary-btn" onclick="hideModal('updateStatusModal')">Cancel</button>
                <button class="primary-btn" onclick="saveParticipantStatus('${employeeId}', '${trainingId}')">Save Changes</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'block';

    // Add event listener for close button
    modal.querySelector('.close-btn').addEventListener('click', () => {
        hideModal('updateStatusModal');
        setTimeout(() => modal.remove(), 300);
    });
}

function saveParticipantStatus(employeeId, trainingId) {
    const status = document.getElementById('participantStatus').value;
    const completion = parseInt(document.getElementById('participantCompletion').value);
    
    // Find and update the participant in our local data
    const participant = trainingParticipants.find(p => p.employeeId === employeeId && p.trainingId === trainingId);
    if (participant) {
        participant.status = status;
        participant.completion = completion;
        
        // In a real app, we would send this to the server
        // For now, just update the UI
        renderParticipants();
        updateReportData();
        
        hideModal('updateStatusModal');
        setTimeout(() => document.getElementById('updateStatusModal').remove(), 300);
    }
}

function removeParticipant(employeeId, trainingId) {
    if (confirm('Are you sure you want to remove this participant from the training?')) {
        // In a real app, we would send this to the server
        // For now, just update our local data
        const index = trainingParticipants.findIndex(p => p.employeeId === employeeId && p.trainingId === trainingId);
        if (index !== -1) {
            trainingParticipants.splice(index, 1);
            renderParticipants();
            updateReportData();
        }
    }
}

// Reports functions
function initializeDashboardCharts() {
    // Initialize the charts for the dashboard
    // This would typically use Chart.js or similar library
    console.log('Initializing dashboard charts');
}

function updateReportView() {
    const reportType = document.getElementById('reportType').value;
    const reportChartTitle = document.getElementById('reportChartTitle');
    
    // Update the chart title based on report type
    switch (reportType) {
        case 'completion':
            reportChartTitle.textContent = 'Training Completion by Department';
            break;
        case 'participation':
            reportChartTitle.textContent = 'Participation by Department';
            break;
        case 'effectiveness':
            reportChartTitle.textContent = 'Training Effectiveness Ratings';
            break;
        case 'cost':
            reportChartTitle.textContent = 'Training Cost Analysis';
            break;
        case 'compliance':
            reportChartTitle.textContent = 'Compliance Status by Department';
            break;
    }
    
    updateReportData();
}

function handleReportPeriodChange() {
    const periodSelect = document.getElementById('reportPeriod');
    const dateRangeFields = document.querySelectorAll('.date-range');
    
    if (periodSelect.value === 'custom') {
        dateRangeFields.forEach(field => field.style.display = 'block');
    } else {
        dateRangeFields.forEach(field => field.style.display = 'none');
    }
}

function updateReportData() {
    const reportType = document.getElementById('reportType').value;
    const reportPeriod = document.getElementById('reportPeriod').value;
    
    // Get date range based on period
    let startDate, endDate;
    const today = new Date();
    
    switch (reportPeriod) {
        case 'current-month':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            break;
        case 'last-month':
            startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            endDate = new Date(today.getFullYear(), today.getMonth(), 0);
            break;
        case 'current-quarter':
            const quarter = Math.floor(today.getMonth() / 3);
            startDate = new Date(today.getFullYear(), quarter * 3, 1);
            endDate = new Date(today.getFullYear(), (quarter + 1) * 3, 0);
            break;
        case 'last-quarter':
            const lastQuarter = Math.floor(today.getMonth() / 3) - 1;
            const year = lastQuarter < 0 ? today.getFullYear() - 1 : today.getFullYear();
            const adjustedQuarter = lastQuarter < 0 ? 3 : lastQuarter;
            startDate = new Date(year, adjustedQuarter * 3, 1);
            endDate = new Date(year, (adjustedQuarter + 1) * 3, 0);
            break;
        case 'current-year':
            startDate = new Date(today.getFullYear(), 0, 1);
            endDate = new Date(today.getFullYear(), 11, 31);
            break;
        case 'custom':
            startDate = new Date(document.getElementById('startDate').value);
            endDate = new Date(document.getElementById('endDate').value);
            break;
    }
    
    // Filter trainings by date range
    const filteredTrainings = trainings.filter(training => {
        const trainingStart = new Date(training.startDate);
        return trainingStart >= startDate && trainingStart <= endDate;
    });
    
    // Calculate summary statistics
    const totalTrainings = filteredTrainings.length;
    document.getElementById('reportTotalTrainings').textContent = totalTrainings;
    
    // Count total participants
    let totalParticipants = 0;
    filteredTrainings.forEach(training => {
        if (training.participants) {
            totalParticipants += training.participants.length;
        }
    });
    document.getElementById('reportTotalParticipants').textContent = totalParticipants;
    
    // Calculate completion rate
    const completedParticipants = trainingParticipants.filter(p => 
        p.status === 'completed' && 
        filteredTrainings.some(t => t.id === p.trainingId || t._id === p.trainingId)
    ).length;
    
    const completionRate = totalParticipants > 0 ? 
        Math.round((completedParticipants / totalParticipants) * 100) : 0;
    document.getElementById('reportCompletionRate').textContent = `${completionRate}%`;
    
    // Set average satisfaction (mock data for now)
    document.getElementById('reportAvgSatisfaction').textContent = '4.2/5';
    
    // Generate chart data based on report type
    generateReportChart(reportType, filteredTrainings);
    
    // Generate detailed report table
    generateReportTable(reportType, filteredTrainings);
}

function generateReportChart(reportType, filteredTrainings) {
    // In a real app, this would use Chart.js to create the actual chart
    // For now, we'll just log what we would do
    console.log(`Generating ${reportType} chart with ${filteredTrainings.length} trainings`);
    
    // Mock chart data generation
    const chartCanvas = document.getElementById('reportChart');
    if (!chartCanvas) return;
    
    // Clear any existing chart
    const ctx = chartCanvas.getContext('2d');
    ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
    
    // Draw a placeholder chart
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, chartCanvas.width, chartCanvas.height);
    
    ctx.font = '14px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.fillText(`Chart for ${reportType} would be displayed here`, chartCanvas.width / 2, chartCanvas.height / 2);
}

function generateReportTable(reportType, filteredTrainings) {
    const reportTable = document.getElementById('reportTable');
    if (!reportTable) return;
    
    let tableHTML = '';
    
    switch (reportType) {
        case 'completion':
            tableHTML = `
                <thead>
                    <tr>
                        <th>Training</th>
                        <th>Start Date</th>
                        <th>Department</th>
                        <th>Participants</th>
                        <th>Completed</th>
                        <th>Completion Rate</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredTrainings.map(training => {
                        const participants = training.participants ? training.participants.length : 0;
                        const completed = trainingParticipants.filter(p => 
                            (p.trainingId === training.id || p.trainingId === training._id) && 
                            p.status === 'completed'
                        ).length;
                        const rate = participants > 0 ? Math.round((completed / participants) * 100) : 0;
                        
                        return `
                            <tr>
                                <td>${training.title || training.name}</td>
                                <td>${formatDate(training.startDate)}</td>
                                <td>All Departments</td>
                                <td>${participants}</td>
                                <td>${completed}</td>
                                <td>${rate}%</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            `;
            break;
            
        case 'participation':
            // Group participants by department
            const departmentParticipation = {};
            
            trainingParticipants.forEach(participant => {
                const employee = employees.find(e => e.id === participant.employeeId || e._id === participant.employeeId);
                if (employee && employee.department) {
                    if (!departmentParticipation[employee.department]) {
                        departmentParticipation[employee.department] = 0;
                    }
                    departmentParticipation[employee.department]++;
                }
            });
            
            tableHTML = `
                <thead>
                    <tr>
                        <th>Department</th>
                        <th>Participants</th>
                        <th>Percentage</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(departmentParticipation).map(([dept, count]) => {
                        const percentage = Math.round((count / trainingParticipants.length) * 100);
                        return `
                            <tr>
                                <td>${dept}</td>
                                <td>${count}</td>
                                <td>${percentage}%</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            `;
            break;
            
        default:
            tableHTML = `
                <thead>
                    <tr>
                        <th>Training</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Participants</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredTrainings.map(training => `
                        <tr>
                            <td>${training.title || training.name}</td>
                            <td>${formatDate(training.startDate)}</td>
                            <td>${formatDate(training.endDate)}</td>
                            <td>${training.participants ? training.participants.length : 0}</td>
                            <td>${training.status}</td>
                        </tr>
                    `).join('')}
                </tbody>
            `;
    }
    
    reportTable.innerHTML = tableHTML;
}

function generateReport() {
    const reportType = document.getElementById('reportType').value;
    const reportPeriod = document.getElementById('reportPeriod').value;
    
    // In a real app, this would generate a PDF or Excel report
    // For now, we'll just open a new window with the report content
    const printWindow = window.open('', '_blank');
    const reportTable = document.getElementById('reportTable');
    
    printWindow.document.write(`
        <html>
            <head>
                <title>Training Report - ${reportType}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .report-header { display: flex; justify-content: space-between; margin-bottom: 20px; }
                    .report-title { font-size: 24px; font-weight: bold; }
                    .report-meta { margin-bottom: 20px; }
                    .report-meta p { margin: 5px 0; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f5f5f5; }
                    .summary-row { font-weight: bold; background-color: #f9f9f9; }
                </style>
            </head>
            <body>
                <div class="report-header">
                    <div class="report-title">Training Report - ${document.getElementById('reportChartTitle').textContent}</div>
                    <div>Generated on ${new Date().toLocaleDateString()}</div>
                </div>
                <div class="report-meta">
                    <p><strong>Period:</strong> ${reportPeriod}</p>
                    <p><strong>Total Trainings:</strong> ${document.getElementById('reportTotalTrainings').textContent}</p>
                    <p><strong>Total Participants:</strong> ${document.getElementById('reportTotalParticipants').textContent}</p>
                    <p><strong>Completion Rate:</strong> ${document.getElementById('reportCompletionRate').textContent}</p>
                </div>
                <table>
                    ${reportTable.innerHTML}
                </table>
                <script>window.onload = function() { window.print(); }</script>
            </body>
        </html>
    `);
    
    printWindow.document.close();
}

// Settings functions
function saveSettings() {
    // Collect settings values
    const settings = {
        defaultTrainingDuration: document.getElementById('defaultTrainingDuration').value,
        maxParticipantsDefault: document.getElementById('maxParticipantsDefault').value,
        reminderDays: document.getElementById('reminderDays').value,
        feedbackReminderDays: document.getElementById('feedbackReminderDays').value,
        categories: Array.from(document.querySelectorAll('#trainingCategories .category-item span')).map(span => span.textContent),
        notifications: {
            email: document.getElementById('emailNotifications').checked,
            sms: document.getElementById('smsNotifications').checked,
            reminders: document.getElementById('reminderNotifications').checked,
            completion: document.getElementById('completionNotifications').checked
        }
    };
    
    // In a real app, we would save this to the server
    // For now, just log it and show a success message
    console.log('Saving settings:', settings);
    
    // Show success message
    const toast = document.createElement('div');
    toast.className = 'toast success';
    toast.innerHTML = `<i class="fas fa-check-circle"></i> Settings saved successfully`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }, 100);
}

function addTrainingCategory() {
    const newCategoryInput = document.getElementById('newCategory');
    const categoryName = newCategoryInput.value.trim();
    
    if (!categoryName) return;
    
    const categoriesContainer = document.getElementById('trainingCategories');
    const categoryItem = document.createElement('div');
    categoryItem.className = 'category-item';
    categoryItem.innerHTML = `
        <span>${categoryName}</span>
        <button class="delete-btn"><i class="fas fa-times"></i></button>
    `;
    
    categoriesContainer.appendChild(categoryItem);
    
    // Add event listener for delete button
    categoryItem.querySelector('.delete-btn').addEventListener('click', function() {
        categoryItem.remove();
    });
    
    // Clear input
    newCategoryInput.value = '';
}