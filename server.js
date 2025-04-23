const express = require('express');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { exec } = require('child_process');
const multer = require('multer');

// Configure multer for handling file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'public/uploads';
        // Create uploads directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Accept images only
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

const app = express();

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(bodyParser.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Redirect root to login page
app.get('/', (req, res) => {
    res.redirect('/login.html');
});

// Add specific routes for HTML pages
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/employees', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'employees.html'));
});

app.get('/admin-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html'));
});

// Helper functions for JSON file operations
const readJsonFile = (filename) => {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'data', filename), 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading file:', filename, err);
        return [];
    }
};

const writeJsonFile = (filename, data) => {
    try {
        fs.writeFileSync(path.join(__dirname, 'data', filename), JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Error writing file:', filename, err);
        throw err;
    }
};

// Authentication middleware
const authenticateUser = (req, res, next) => {
    const users = readJsonFile('users.json');
    const user = users.find(u => u.username === req.body.username);
    
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValidPassword = bcrypt.compareSync(req.body.password, user.password);
    if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    req.user = user;
    next();
};

// Login endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const users = readJsonFile('users.json');
        const user = users.find(u => u.username === username);
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        res.json({ 
            message: 'Login successful',
            role: user.role,
            username: user.username,
            id: user.id
        });
    } catch (err) {
        res.status(500).json({ message: 'Error during login' });
    }
});

// Get all users (for admin dashboard)
app.get('/api/users', (req, res) => {
    try {
        const users = readJsonFile('users.json');
        // Don't send password hashes to the client
        const safeUsers = users.map(({ id, username, role }) => ({ id, username, role }));
        res.json(safeUsers);
    } catch (err) {
        console.error('Error reading users:', err);
        res.status(500).json({ error: 'Failed to load users' });
    }
});

// Add new user (admin only)
app.post('/api/users', (req, res) => {
    try {
        const { username, password, role } = req.body;
        
        // Validate input
        if (!username || !password || !role) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const users = readJsonFile('users.json');
        
        // Check if username already exists
        if (users.find(u => u.username === username)) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        
        // Generate password hash
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);
        
        // Create new user
        const newUser = {
            id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
            username,
            password: hashedPassword,
            role
        };
        
        users.push(newUser);
        writeJsonFile('users.json', users);
        
        // Don't send password hash back to client
        const { password: _, ...safeUser } = newUser;
        res.status(201).json(safeUser);
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// Update user (admin only)
app.put('/api/users/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { username, password, role } = req.body;
        
        // Validate input
        if (!username || !role) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const users = readJsonFile('users.json');
        const userIndex = users.findIndex(u => u.id === parseInt(id));
        
        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Check if username already exists for other users
        if (users.some(u => u.username === username && u.id !== parseInt(id))) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        
        // Update user
        users[userIndex].username = username;
        users[userIndex].role = role;
        
        // Update password if provided
        if (password) {
            const salt = bcrypt.genSaltSync(10);
            users[userIndex].password = bcrypt.hashSync(password, salt);
        }
        
        writeJsonFile('users.json', users);
        
        // Don't send password hash back to client
        const { password: _, ...safeUser } = users[userIndex];
        res.json(safeUser);
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Delete user (admin only)
app.delete('/api/users/:id', (req, res) => {
    try {
        const { id } = req.params;
        
        // Prevent deleting the main admin account
        if (parseInt(id) === 1) {
            return res.status(403).json({ error: 'Cannot delete the main admin account' });
        }
        
        const users = readJsonFile('users.json');
        const filteredUsers = users.filter(u => u.id !== parseInt(id));
        
        if (filteredUsers.length === users.length) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        writeJsonFile('users.json', filteredUsers);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Get all employees
app.get('/api/employees', (req, res) => {
    try {
        const employees = readJsonFile('employees.json');
        res.json(employees.map(emp => ({
            _id: emp.employeeNumber,
            'Employee Name': emp.name,
            'EMP NO': emp.employeeNumber,
            'Joined Date': emp.joinedDate,
            'Work Site': emp.workSite || emp.worksite,
            'Gender': emp.gender,
            'Department': emp.department,
            'Designation': emp.designation,
            'Nationality': emp.nationality,
            'city / island': emp.city,
            'Date of Birth': emp.dateOfBirth || emp.dob,
            'Mobile Number (Work no)': emp.mobile,
            'salary (USD)': emp.salaryUSD,
            'salary (MVR)': emp.salaryMVR,
            'image': emp.image
        })));
    } catch (err) {
        console.error('Error reading employees:', err);
        res.status(500).json({ error: 'Failed to load employees' });
    }
});

// Add a new employee with file upload
app.post('/api/employees', upload.single('image'), (req, res) => {
    try {
        const employees = readJsonFile('employees.json');
        const data = req.body;
        
        // Handle the uploaded file
        const imagePath = req.file ? `/uploads/${req.file.filename}` : '';
        
        const newEmployee = {
            employeeNumber: data['EMP NO'],
            name: data['Employee Name'],
            nationalId: '',
            gender: data['Gender'],
            nationality: data['Nationality'],
            city: data['city / island'],
            dateOfBirth: data['Date of Birth'],
            mobile: data['Mobile Number (Work no)'],
            designation: data['Designation'],
            department: data['Department'],
            workSite: data['Work Site'],
            joinedDate: data['Joined Date'],
            salaryUSD: data['salary (USD)'],
            salaryMVR: data['salary (MVR)'],
            image: imagePath
        };

        employees.push(newEmployee);
        writeJsonFile('employees.json', employees);
        
        // Add to recent activities
        const activities = readJsonFile('activities.json');
        activities.recent.unshift({
            action: 'added',
            'Employee Name': newEmployee.name,
            'Designation': newEmployee.designation,
            timestamp: new Date().toISOString(),
            by: 'Admin'
        });
        writeJsonFile('activities.json', activities);
        
        res.status(201).json({
            _id: newEmployee.employeeNumber,
            'Employee Name': newEmployee.name,
            'EMP NO': newEmployee.employeeNumber,
            'Joined Date': newEmployee.joinedDate,
            'Work Site': newEmployee.workSite,
            'Gender': newEmployee.gender,
            'Department': newEmployee.department,
            'Designation': newEmployee.designation,
            'Nationality': newEmployee.nationality,
            'city / island': newEmployee.city,
            'Date of Birth': newEmployee.dateOfBirth,
            'Mobile Number (Work no)': newEmployee.mobile,
            'salary (USD)': newEmployee.salaryUSD,
            'salary (MVR)': newEmployee.salaryMVR,
            'image': newEmployee.image
        });
    } catch (err) {
        console.error('Error adding employee:', err);
        res.status(500).json({ error: 'Failed to add employee' });
    }
});

// Update an employee with file upload
app.put('/api/employees/:id', upload.single('image'), (req, res) => {
    try {
        const employees = readJsonFile('employees.json');
        const id = req.params.id;
        const data = req.body;
        
        const index = employees.findIndex(emp => emp.employeeNumber === id);
        if (index === -1) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        // Handle the uploaded file
        const imagePath = req.file ? `/uploads/${req.file.filename}` : data['image'];
        
        // If there's a new image and an old image exists, delete the old one
        if (req.file && employees[index].image) {
            const oldImagePath = path.join(__dirname, 'public', employees[index].image);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        const updatedEmployee = {
            ...employees[index],
            name: data['Employee Name'],
            gender: data['Gender'],
            nationality: data['Nationality'],
            city: data['city / island'],
            dateOfBirth: data['Date of Birth'],
            mobile: data['Mobile Number (Work no)'],
            designation: data['Designation'],
            department: data['Department'],
            workSite: data['Work Site'],
            joinedDate: data['Joined Date'],
            salaryUSD: data['salary (USD)'],
            salaryMVR: data['salary (MVR)'],
            image: imagePath
        };

        employees[index] = updatedEmployee;
        writeJsonFile('employees.json', employees);
        
        // Add to recent activities
        const activities = readJsonFile('activities.json');
        activities.recent.unshift({
            action: 'updated',
            'Employee Name': updatedEmployee.name,
            'Designation': updatedEmployee.designation,
            timestamp: new Date().toISOString(),
            by: 'Admin'
        });
        writeJsonFile('activities.json', activities);
        
        res.json({
            _id: updatedEmployee.employeeNumber,
            'Employee Name': updatedEmployee.name,
            'EMP NO': updatedEmployee.employeeNumber,
            'Joined Date': updatedEmployee.joinedDate,
            'Work Site': updatedEmployee.workSite,
            'Gender': updatedEmployee.gender,
            'Department': updatedEmployee.department,
            'Designation': updatedEmployee.designation,
            'Nationality': updatedEmployee.nationality,
            'city / island': updatedEmployee.city,
            'Date of Birth': updatedEmployee.dateOfBirth,
            'Mobile Number (Work no)': updatedEmployee.mobile,
            'salary (USD)': updatedEmployee.salaryUSD,
            'salary (MVR)': updatedEmployee.salaryMVR,
            'image': updatedEmployee.image
        });
    } catch (err) {
        console.error('Error updating employee:', err);
        res.status(500).json({ error: 'Failed to update employee' });
    }
});

// Delete an employee
app.delete('/api/employees/:id', (req, res) => {
    try {
        const employees = readJsonFile('employees.json');
        const id = req.params.id;
        
        const deletedEmployee = employees.find(emp => emp.employeeNumber === id);
        if (!deletedEmployee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        // Delete employee image if it exists
        if (deletedEmployee.image && deletedEmployee.image.startsWith('/uploads/')) {
            const imagePath = path.join(__dirname, 'public', deletedEmployee.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        const filteredEmployees = employees.filter(emp => emp.employeeNumber !== id);
        writeJsonFile('employees.json', filteredEmployees);
        
        // Add to recent activities
        const activities = readJsonFile('activities.json');
        if (!activities.recent) {
            activities.recent = [];
        }
        activities.recent.unshift({
            action: 'deleted',
            'Employee Name': deletedEmployee.name,
            'Designation': deletedEmployee.designation,
            timestamp: new Date().toISOString(),
            by: 'Admin'
        });
        writeJsonFile('activities.json', activities);
        
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting employee:', err);
        res.status(500).json({ error: 'Failed to delete employee' });
    }
});

// Dashboard statistics endpoint
app.get('/api/dashboard/stats', (req, res) => {
    try {
        const employees = readJsonFile('employees.json');
        
        // Calculate total employees
        const totalEmployees = employees.length;
        
        // Calculate department distribution
        const byDepartment = calculateDistribution(employees, 'department');
        
        // Calculate nationality distribution
        const byNationality = calculateDistribution(employees, 'nationality');
        
        // Calculate worksite distribution
        const byWorksite = calculateDistribution(employees, 'workSite');
        
        // Calculate gender distribution
        const byGender = calculateDistribution(employees, 'gender');
        
        // Calculate employee growth by year
        const byYear = calculateGrowthByYear(employees);
        
        res.json({
            totalEmployees,
            byDepartment,
            byNationality,
            byWorksite,
            byGender,
            byYear
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Helper function to calculate distribution
function calculateDistribution(data, field) {
    const distribution = {};
    data.forEach(item => {
        const value = item[field] || 'Unknown';
        distribution[value] = (distribution[value] || 0) + 1;
    });
    
    return Object.entries(distribution).map(([name, count]) => ({
        name,
        count
    }));
}

// Helper function to calculate growth by year
function calculateGrowthByYear(data) {
    const growth = {};
    data.forEach(item => {
        const year = new Date(item.joinedDate).getFullYear();
        growth[year] = (growth[year] || 0) + 1;
    });
    
    return Object.entries(growth)
        .map(([year, count]) => ({
            year: parseInt(year),
            count
        }))
        .sort((a, b) => a.year - b.year);
}

// Recent activities endpoint
app.get('/api/dashboard/recent-activities', (req, res) => {
    try {
        const activities = readJsonFile('activities.json');
        res.json({ recent: activities });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get employee names for dropdown
app.get('/api/employees/names', (req, res) => {
    try {
        const employees = readJsonFile('employees.json');
        res.json(employees.map(emp => ({
            _id: emp.employeeNumber,
            name: emp.name,
            'EMP NO': emp.employeeNumber
        })));
    } catch (err) {
        console.error('Error getting employee names:', err);
        res.status(500).json({ error: 'Failed to load employee names' });
    }
});

// Get leave balances for an employee
app.get('/api/leave-balances/:employeeId', (req, res) => {
    try {
        const employees = readJsonFile('employees.json');
        const timesheets = readJsonFile('timesheets.json') || [];
        
        const employee = employees.find(emp => emp.employeeNumber === req.params.employeeId);
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        // Get all leave records from timesheets
        const leaveHistory = [];
        timesheets.forEach(ts => {
            if (ts.employeeId === req.params.employeeId) {
                ts.records.forEach(rec => {
                    if (rec.status && rec.status.toLowerCase().includes('leave')) {
                        leaveHistory.push({
                            date: rec.date,
                            type: rec.status,
                            dayOfWeek: rec.dayOfWeek
                        });
                    }
                });
            }
        });

        // Calculate balances based on employee join date
        const joinDate = new Date(employee.joinedDate);
        const today = new Date();
        const monthsEmployed = (today.getFullYear() - joinDate.getFullYear()) * 12 + today.getMonth() - joinDate.getMonth();
        
        // Define leave entitlements (customize as needed)
        const annualLeavePerYear = 30;
        const sickLeavePerYear = 15;
        const emergencyLeavePerYear = 7;
        
        // Calculate pro-rated entitlements
        const proRatedMultiplier = Math.min(monthsEmployed / 12, 1);
        
        // Group leave history by type
        const leaveUsedByType = leaveHistory.reduce((acc, leave) => {
            const type = leave.type;
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});

        const leaveBalances = [
            {
                leaveType: 'Annual Leave',
                entitlement: Math.floor(annualLeavePerYear * proRatedMultiplier),
                used: leaveUsedByType['Annual Leave'] || 0,
                history: leaveHistory.filter(l => l.type === 'Annual Leave')
            },
            {
                leaveType: 'Sick Leave',
                entitlement: Math.floor(sickLeavePerYear * proRatedMultiplier),
                used: leaveUsedByType['Sick Leave'] || 0,
                history: leaveHistory.filter(l => l.type === 'Sick Leave')
            },
            {
                leaveType: 'Emergency Leave',
                entitlement: Math.floor(emergencyLeavePerYear * proRatedMultiplier),
                used: leaveUsedByType['Emergency Leave'] || 0,
                history: leaveHistory.filter(l => l.type === 'Emergency Leave')
            }
        ];

        // Calculate remaining and forfeited for each type
        leaveBalances.forEach(leave => {
            leave.remaining = Math.max(0, leave.entitlement - leave.used);
            leave.forfeited = Math.max(0, leave.used - leave.entitlement);
        });

        // Add public holidays (customize as needed)
        const publicHolidays = [
            { date: '2025-01-01', name: 'New Year' },
            { date: '2025-05-01', name: 'Labor Day' },
            { date: '2025-07-26', name: 'Independence Day' },
            { date: '2025-11-03', name: 'Victory Day' },
            { date: '2025-12-25', name: 'Christmas' }
        ];

        res.json({
            employeeId: employee.employeeNumber,
            employeeName: employee.name,
            joinedDate: employee.joinedDate,
            leaveBalances,
            publicHolidays
        });

    } catch (err) {
        console.error('Error getting leave balances:', err);
        res.status(500).json({ error: 'Failed to load leave balances' });
    }
});

// Save timesheet
app.post('/api/timesheets', (req, res) => {
    try {
        const timesheets = readJsonFile('timesheets.json') || [];
        const { employeeId, week, records, summary, employeeName, timestamp } = req.body;
        
        // Update existing or add new timesheet
        const existingIndex = timesheets.findIndex(ts => 
            ts.employeeId === employeeId && ts.week === week
        );
        
        const timesheet = {
            employeeId,
            week,
            records,
            summary,
            employeeName,
            lastUpdated: timestamp || new Date().toISOString()
        };

        if (existingIndex >= 0) {
            timesheets[existingIndex] = timesheet;
        } else {
            timesheets.push(timesheet);
        }
        
        writeJsonFile('timesheets.json', timesheets);
        
        // Add to activities
        const activities = readJsonFile('activities.json');
        activities.recent.unshift({
            action: existingIndex >= 0 ? 'updated' : 'added',
            type: 'timesheet',
            employeeName,
            week,
            timestamp: new Date().toISOString(),
            by: 'Admin'
        });
        writeJsonFile('activities.json', activities);
        
        res.json({ 
            message: `Timesheet ${existingIndex >= 0 ? 'updated' : 'saved'} successfully`,
            timesheet 
        });
    } catch (err) {
        console.error('Error saving timesheet:', err);
        res.status(500).json({ error: 'Failed to save timesheet' });
    }
});

// Get timesheets
app.get('/api/timesheets', (req, res) => {
    try {
        const timesheets = readJsonFile('timesheets.json') || [];
        const { employeeId, week } = req.query;
        
        if (employeeId) {
            const filtered = timesheets.filter(ts => ts.employeeId === employeeId);
            if (week) {
                const timesheet = filtered.find(ts => ts.week === week) || { records: [], summary: null };
                res.json(timesheet);
            } else {
                res.json(filtered);
            }
        } else {
            res.json(timesheets);
        }
    } catch (err) {
        console.error('Error getting timesheets:', err);
        res.status(500).json({ error: 'Failed to load timesheets' });
    }
});

// Get payroll data
app.get('/api/payroll', (req, res) => {
    try {
        const { month, employeeId } = req.query;
        const salaries = readJsonFile('salaries.json');
        const employees = readJsonFile('employees.json');
        
        let payrollData = salaries;
        if (employeeId) {
            payrollData = salaries.filter(s => s.employeeId === employeeId);
        }
        
        // Enrich salary data with employee information
        const payroll = payrollData.map(salary => {
            const employee = employees.find(emp => emp.employeeNumber === salary.employeeNumber);
            if (!employee) return null;
            
            const totalAllowances = (salary.allowances || [])
                .reduce((sum, a) => sum + parseFloat(a.amount), 0);
            const totalDeductions = (salary.deductions || [])
                .reduce((sum, d) => sum + parseFloat(d.amount), 0);
            
            return {
                ...salary,
                employeeName: employee.name,
                department: employee.department,
                designation: employee.designation,
                totalAllowances,
                totalDeductions
            };
        }).filter(Boolean);
        
        // Calculate summary
        const summary = {
            totalEmployees: payroll.length,
            totalPayrollUSD: payroll.reduce((sum, p) => {
                const totalAllowances = (p.allowances || []).reduce((s, a) => s + parseFloat(a.amount), 0);
                const totalDeductions = (p.deductions || []).reduce((s, d) => s + parseFloat(d.amount), 0);
                return sum + (parseFloat(p.basicSalaryUSD) + totalAllowances - totalDeductions);
            }, 0),
            totalPayrollMVR: payroll.reduce((sum, p) => {
                const totalAllowances = (p.allowances || []).reduce((s, a) => s + parseFloat(a.amount), 0);
                const totalDeductions = (p.deductions || []).reduce((s, d) => s + parseFloat(d.amount), 0);
                const serviceCharge = p.serviceChargeUsed ? 0 : (p.serviceChargeMVR || 0);
                return sum + (parseFloat(p.basicSalaryMVR) + (totalAllowances - totalDeductions) * 15.42 + serviceCharge);
            }, 0)
        };
        
        res.json({ payroll, summary });
    } catch (err) {
        console.error('Error getting payroll data:', err);
        res.status(500).json({ error: 'Failed to load payroll data' });
    }
});

// Get payslip
app.get('/api/payroll/payslip/:employeeNumber', (req, res) => {
    try {
        const { employeeNumber } = req.params;
        const { month } = req.query;
        
        const salaries = readJsonFile('salaries.json');
        const employees = readJsonFile('employees.json');
        
        const salary = salaries.find(s => s.employeeNumber === employeeNumber);
        const employee = employees.find(emp => emp.employeeNumber === employeeNumber);
        
        if (!salary || !employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        
        // Calculate totals
        const totalAllowances = (salary.allowances || [])
            .reduce((sum, a) => sum + parseFloat(a.amount), 0);
        const totalDeductions = (salary.deductions || [])
            .reduce((sum, d) => sum + parseFloat(d.amount), 0);
        const serviceCharge = salary.serviceChargeUsed ? 0 : (salary.serviceChargeMVR || 0);
        
        const payslip = {
            ...salary,
            employeeName: employee.name,
            department: employee.department,
            designation: employee.designation,
            month,
            totalAllowances,
            totalDeductions,
            netSalaryUSD: salary.basicSalaryUSD + totalAllowances - totalDeductions,
            netSalaryMVR: salary.basicSalaryMVR + (totalAllowances - totalDeductions) * 15.42 + serviceCharge
        };
        
        res.json(payslip);
    } catch (err) {
        console.error('Error generating payslip:', err);
        res.status(500).json({ error: 'Failed to generate payslip' });
    }
});

// Add service charge
app.post('/api/payroll/service-charge', (req, res) => {
    try {
        const { amountMVR } = req.body;
        if (!amountMVR || isNaN(amountMVR)) {
            return res.status(400).json({ error: 'Invalid service charge amount' });
        }
        
        const salaries = readJsonFile('salaries.json');
        
        // Initialize or reset service charge fields if not present
        salaries.forEach(salary => {
            if (typeof salary.serviceChargeUsed === 'undefined') {
                salary.serviceChargeUsed = false;
            }
            if (typeof salary.serviceChargeMVR === 'undefined') {
                salary.serviceChargeMVR = 0;
            }
        });

        // Only get employees who haven't used their service charge
        const activeEmployees = salaries.filter(s => !s.serviceChargeUsed);
        
        if (activeEmployees.length === 0) {
            return res.status(400).json({ error: 'No eligible employees for service charge' });
        }

        const amountPerEmployee = amountMVR / activeEmployees.length;
        
        // Update service charge for eligible employees only
        salaries.forEach(salary => {
            if (!salary.serviceChargeUsed) {
                salary.serviceChargeMVR = amountPerEmployee;
                // Don't mark as used until payroll is processed
                salary.serviceChargeUsed = false;
            }
        });
        
        writeJsonFile('salaries.json', salaries);
        
        // Add to activities log
        const activities = readJsonFile('activities.json');
        activities.recent.unshift({
            action: 'added',
            type: 'service-charge',
            details: `Added service charge of MVR ${amountMVR} (USD ${(amountMVR/15.42).toFixed(2)})`,
            timestamp: new Date().toISOString(),
            by: 'Admin'
        });
        writeJsonFile('activities.json', activities);
        
        res.json({ message: 'Service charge distributed successfully' });
    } catch (err) {
        console.error('Error distributing service charge:', err);
        res.status(500).json({ error: 'Failed to distribute service charge' });
    }
});

// Process payroll
app.post('/api/payroll/process', (req, res) => {
    try {
        const { month } = req.body;
        if (!month) {
            return res.status(400).json({ error: 'Month is required' });
        }

        const salaries = readJsonFile('salaries.json');

        salaries.forEach(salary => {
            if (!salary.paymentHistory) {
                salary.paymentHistory = [];
            }

            // Initialize service charge fields if not present
            if (typeof salary.serviceChargeUsed === 'undefined') {
                salary.serviceChargeUsed = false;
            }
            if (typeof salary.serviceChargeMVR === 'undefined') {
                salary.serviceChargeMVR = 0;
            }

            // Calculate totals
            const totalAllowances = (salary.allowances || [])
                .reduce((sum, a) => sum + parseFloat(a.amount), 0);
            const totalDeductions = (salary.deductions || [])
                .reduce((sum, d) => sum + parseFloat(d.amount), 0);
            
            // Include service charge in payment processing
            const serviceChargeMVR = salary.serviceChargeUsed ? 0 : (salary.serviceChargeMVR || 0);
            const netSalaryUSD = parseFloat(salary.basicSalaryUSD) + totalAllowances - totalDeductions;
            const netSalaryMVR = parseFloat(salary.basicSalaryMVR) + (totalAllowances - totalDeductions) * 15.42 + serviceChargeMVR;

            // Record the payment
            const payment = {
                month,
                basicSalaryUSD: salary.basicSalaryUSD,
                basicSalaryMVR: salary.basicSalaryMVR,
                serviceChargeMVR,
                allowances: [...(salary.allowances || [])],
                deductions: [...(salary.deductions || [])],
                totalAllowances,
                totalDeductions,
                netSalaryUSD,
                netSalaryMVR,
                processedAt: new Date().toISOString()
            };

            salary.paymentHistory.push(payment);
            
            // Mark service charge as used and reset the amount
            if (serviceChargeMVR > 0) {
                salary.serviceChargeUsed = true;
                salary.serviceChargeMVR = 0;
            }

            // Clear non-recurring components
            if (salary.allowances) {
                salary.allowances = salary.allowances.filter(a => a.recurring);
            }
            if (salary.deductions) {
                salary.deductions = salary.deductions.filter(d => d.recurring);
            }
        });

        writeJsonFile('salaries.json', salaries);

        // Add to activities
        const activities = readJsonFile('activities.json');
        activities.recent.unshift({
            action: 'processed',
            type: 'payroll',
            details: `Processed payroll for ${month}`,
            timestamp: new Date().toISOString(),
            by: 'Admin'
        });
        writeJsonFile('activities.json', activities);
        
        res.json({ message: 'Payroll processed successfully' });
    } catch (err) {
        console.error('Error processing payroll:', err);
        res.status(500).json({ error: 'Failed to process payroll' });
    }
});

// Get payroll data
app.get('/api/payroll', (req, res) => {
    try {
        const { month, employeeId } = req.query;
        const salaries = readJsonFile('salaries.json');
        const employees = readJsonFile('employees.json');
        
        let payrollData = salaries;
        if (employeeId) {
            payrollData = salaries.filter(s => s.employeeId === employeeId);
        }
        
        // Enrich salary data with employee information
        const payroll = payrollData.map(salary => {
            const employee = employees.find(emp => emp.employeeNumber === salary.employeeNumber);
            return {
                ...salary,
                employeeName: employee?.name || 'Unknown',
                department: employee?.department || '',
                designation: employee?.designation || ''
            };
        });
        
        // Calculate summary
        const summary = {
            totalEmployees: payroll.length,
            totalPayrollUSD: payroll.reduce((sum, p) => sum + parseFloat(p.basicSalaryUSD || 0), 0),
            totalPayrollMVR: payroll.reduce((sum, p) => sum + parseFloat(p.basicSalaryMVR || 0), 0)
        };
        
        res.json({ payroll, summary });
    } catch (err) {
        console.error('Error getting payroll data:', err);
        res.status(500).json({ error: 'Failed to load payroll data' });
    }
});

// Get payslip
app.get('/api/payroll/payslip/:employeeNumber', (req, res) => {
    try {
        const { employeeNumber } = req.params;
        const { month } = req.query;
        
        const salaries = readJsonFile('salaries.json');
        const employees = readJsonFile('employees.json');
        
        const salary = salaries.find(s => s.employeeNumber === employeeNumber);
        const employee = employees.find(emp => emp.employeeNumber === employeeNumber);
        
        if (!salary || !employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        
        const totalAllowances = (salary.allowances || [])
            .reduce((sum, a) => sum + parseFloat(a.amount), 0);
        const totalDeductions = (salary.deductions || [])
            .reduce((sum, d) => sum + parseFloat(d.amount), 0);

        // Include service charge in calculations
        const serviceChargeMVR = salary.serviceChargeUsed ? 0 : (salary.serviceChargeMVR || 0);
        const netSalaryUSD = parseFloat(salary.basicSalaryUSD) + totalAllowances - totalDeductions;
        const netSalaryMVR = parseFloat(salary.basicSalaryMVR) + (totalAllowances - totalDeductions) * 15.42 + serviceChargeMVR;
        
        const payslip = {
            employeeNumber,
            employeeName: employee.name,
            department: employee.department,
            designation: employee.designation,
            month,
            basicSalaryUSD: parseFloat(salary.basicSalaryUSD),
            basicSalaryMVR: parseFloat(salary.basicSalaryMVR),
            serviceChargeMVR,
            allowances: salary.allowances || [],
            deductions: salary.deductions || [],
            bankName: employee.bankName || '',
            accountNumber: employee.accountNumber || '',
            totalAllowances,
            totalDeductions,
            netSalaryUSD,
            netSalaryMVR,
            paymentDate: new Date().toISOString()
        };
        
        res.json(payslip);
    } catch (err) {
        console.error('Error generating payslip:', err);
        res.status(500).json({ error: 'Failed to generate payslip' });
    }
});

// Add salary component (allowance/deduction)
app.post('/api/payroll/components', (req, res) => {
    try {
        const { employeeNumber, type, name, amount, recurring } = req.body;
        if (!employeeNumber || !type || !name || !amount) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const salaries = readJsonFile('salaries.json');
        const employeeIndex = salaries.findIndex(s => s.employeeNumber === employeeNumber);
        
        if (employeeIndex === -1) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        
        const component = {
            name,
            amount: parseFloat(amount),
            recurring: Boolean(recurring),
            addedDate: new Date().toISOString()
        };
        
        // Add component to appropriate array
        if (type === 'allowance') {
            salaries[employeeIndex].allowances = salaries[employeeIndex].allowances || [];
            salaries[employeeIndex].allowances.push(component);
        } else if (type === 'deduction') {
            salaries[employeeIndex].deductions = salaries[employeeIndex].deductions || [];
            salaries[employeeIndex].deductions.push(component);
        } else {
            return res.status(400).json({ error: 'Invalid component type' });
        }
        
        writeJsonFile('salaries.json', salaries);
        
        // Add to activities log
        const activities = readJsonFile('activities.json');
        activities.recent.unshift({
            action: 'added',
            type: type,
            details: `Added ${type} '${name}' of $${amount} for employee ${employeeNumber}`,
            timestamp: new Date().toISOString(),
            by: 'Admin'
        });
        writeJsonFile('activities.json', activities);
        
        res.json({ message: `${type} added successfully` });
    } catch (err) {
        console.error('Error adding salary component:', err);
        res.status(500).json({ error: 'Failed to add salary component' });
    }
});

// Process payroll for a month
app.post('/api/payroll/process', (req, res) => {
    try {
        const { month } = req.body;
        const salaries = readJsonFile('salaries.json');
        
        salaries.forEach(salary => {
            if (!salary.paymentHistory) salary.paymentHistory = [];
            
            const totalAllowances = (salary.allowances || [])
                .reduce((sum, a) => sum + parseFloat(a.amount), 0);
            const totalDeductions = (salary.deductions || [])
                .reduce((sum, d) => sum + parseFloat(d.amount), 0);
            
            // Include service charge in payment processing
            const serviceChargeMVR = salary.serviceChargeUsed ? 0 : (salary.serviceChargeMVR || 0);
            const netSalaryUSD = parseFloat(salary.basicSalaryUSD) + totalAllowances - totalDeductions;
            const netSalaryMVR = parseFloat(salary.basicSalaryMVR) + (totalAllowances - totalDeductions) * 15.42 + serviceChargeMVR;
            
            const payment = {
                month,
                basicSalaryUSD: salary.basicSalaryUSD,
                basicSalaryMVR: salary.basicSalaryMVR,
                serviceChargeMVR,
                totalAllowances,
                totalDeductions,
                netSalaryUSD,
                netSalaryMVR,
                processedAt: new Date().toISOString()
            };
            
            salary.paymentHistory.push(payment);
            salary.serviceChargeUsed = true; // Mark service charge as used after processing
            
            // Clear non-recurring components
            if (salary.allowances) {
                salary.allowances = salary.allowances.filter(a => a.recurring);
            }
            if (salary.deductions) {
                salary.deductions = salary.deductions.filter(d => d.recurring);
            }
        });
        
        writeJsonFile('salaries.json', salaries);
        
        // Add to activities
        const activities = readJsonFile('activities.json');
        activities.recent.unshift({
            action: 'processed',
            type: 'payroll',
            details: `Processed payroll for ${month}`,
            timestamp: new Date().toISOString(),
            by: 'Admin'
        });
        writeJsonFile('activities.json', activities);
        
        res.json({ message: 'Payroll processed successfully' });
    } catch (err) {
        console.error('Error processing payroll:', err);
        res.status(500).json({ error: 'Failed to process payroll' });
    }
});

// Export payroll data
app.get('/api/payroll/export', (req, res) => {
    try {
        const { month, employeeId } = req.query;
        const salaries = readJsonFile('salaries.json');
        const employees = readJsonFile('employees.json');
        
        let payrollData = salaries;
        if (employeeId) {
            payrollData = salaries.filter(s => s.employeeId === employeeId);
        }
        
        // Create CSV content
        let csv = 'Employee No,Name,Department,Designation,Basic Salary (USD),Basic Salary (MVR),Allowances,Deductions,Net Salary (USD),Net Salary (MVR)\n';
        
        payrollData.forEach(salary => {
            const employee = employees.find(emp => emp.employeeNumber === salary.employeeNumber);
            if (!employee) return;
            
            const totalAllowances = (salary.allowances || [])
                .reduce((sum, a) => sum + parseFloat(a.amount), 0);
            const totalDeductions = (salary.deductions || [])
                .reduce((sum, d) => sum + parseFloat(d.amount), 0);
            const netSalaryUSD = parseFloat(salary.basicSalaryUSD) + totalAllowances - totalDeductions;
            const netSalaryMVR = parseFloat(salary.basicSalaryMVR) + (totalAllowances - totalDeductions) * 15.42;
            
            csv += `${salary.employeeNumber},${employee.name},${employee.department},${employee.designation},`;
            csv += `${salary.basicSalaryUSD},${salary.basicSalaryMVR},${totalAllowances},${totalDeductions},`;
            csv += `${netSalaryUSD.toFixed(2)},${netSalaryMVR.toFixed(2)}\n`;
        });
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=payroll_${month}.csv`);
        res.send(csv);
    } catch (err) {
        console.error('Error exporting payroll:', err);
        res.status(500).json({ error: 'Failed to export payroll data' });
    }
});

// Download payslip as PDF
app.get('/api/payroll/payslip/:employeeNumber/download', (req, res) => {
    // Note: This is a placeholder that returns a CSV instead of PDF
    // In production, you would use a library like PDFKit to generate proper PDF files
    try {
        const { employeeNumber } = req.params;
        const { month } = req.query;
        
        const salaries = readJsonFile('salaries.json');
        const employees = readJsonFile('employees.json');
        
        const salary = salaries.find(s => s.employeeNumber === employeeNumber);
        const employee = employees.find(emp => emp.employeeNumber === employeeNumber);
        
        if (!salary || !employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        
        const totalAllowances = (salary.allowances || [])
            .reduce((sum, a) => sum + parseFloat(a.amount), 0);
        const totalDeductions = (salary.deductions || [])
            .reduce((sum, d) => sum + parseFloat(d.amount), 0);
        const netSalaryUSD = parseFloat(salary.basicSalaryUSD) + totalAllowances - totalDeductions;
        const netSalaryMVR = parseFloat(salary.basicSalaryMVR) + (totalAllowances - totalDeductions) * 15.42;
        
        let csv = 'PAYSLIP\n\n';
        csv += `Employee: ${employee.name}\n`;
        csv += `Employee No: ${employeeNumber}\n`;
        csv += `Department: ${employee.department}\n`;
        csv += `Designation: ${employee.designation}\n\n`;
        csv += `Basic Salary (USD): ${salary.basicSalaryUSD}\n`;
        csv += `Basic Salary (MVR): ${salary.basicSalaryMVR}\n`;
        csv += `Total Allowances: ${totalAllowances}\n`;
        csv += `Total Deductions: ${totalDeductions}\n`;
        csv += `Net Salary (USD): ${netSalaryUSD.toFixed(2)}\n`;
        csv += `Net Salary (MVR): ${netSalaryMVR.toFixed(2)}\n`;
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=payslip_${employeeNumber}_${month}.csv`);
        res.send(csv);
    } catch (err) {
        console.error('Error downloading payslip:', err);
        res.status(500).json({ error: 'Failed to download payslip' });
    }
});

// Add service charge endpoint
app.post('/api/payroll/service-charge', (req, res) => {
    try {
        const { month, amountMVR } = req.body;
        const salaries = readJsonFile('salaries.json');
        const employees = readJsonFile('employees.json');
        
        // Calculate per-employee share
        const activeEmployees = employees.length;
        const sharePerEmployee = parseFloat(amountMVR) / activeEmployees;
        
        // Add service charge to each employee
        salaries.forEach(salary => {
            salary.serviceChargeMVR = sharePerEmployee;
            salary.serviceChargeUsed = false;
        });
        
        writeJsonFile('salaries.json', salaries);
        
        res.json({ message: 'Service charge distributed successfully' });
    } catch (err) {
        console.error('Error distributing service charge:', err);
        res.status(500).json({ error: 'Failed to distribute service charge' });
    }
});

// Get salary distribution statistics
app.get('/api/payroll/distribution', (req, res) => {
    try {
        const salaries = readJsonFile('salaries.json');
        const employees = readJsonFile('employees.json');

        // Combine salary data with employee details
        const enrichedData = salaries.map(salary => {
            const employee = employees.find(emp => emp.employeeNumber === salary.employeeNumber);
            return {
                ...salary,
                department: employee?.department || 'Unknown',
                workSite: employee?.workSite || 'Unknown',
                nationality: employee?.nationality || 'Unknown'
            };
        });

        // Department-wise distribution
        const departmentStats = {};
        enrichedData.forEach(emp => {
            if (!departmentStats[emp.department]) {
                departmentStats[emp.department] = {
                    totalUSD: 0,
                    totalMVR: 0,
                    count: 0,
                    serviceChargeUSD: 0,
                    serviceChargeMVR: 0
                };
            }
            const totalAllowances = (emp.allowances || []).reduce((sum, a) => sum + parseFloat(a.amount), 0);
            const totalDeductions = (emp.deductions || []).reduce((sum, d) => sum + parseFloat(d.amount), 0);
            const netSalaryUSD = parseFloat(emp.basicSalaryUSD) + totalAllowances - totalDeductions;
            const netSalaryMVR = parseFloat(emp.basicSalaryMVR) + (totalAllowances - totalDeductions) * 15.42;

            departmentStats[emp.department].totalUSD += netSalaryUSD;
            departmentStats[emp.department].totalMVR += netSalaryMVR;
            departmentStats[emp.department].serviceChargeUSD += (emp.serviceChargeUsed ? 0 : (emp.serviceChargeMVR || 0)) / 15.42;
            departmentStats[emp.department].serviceChargeMVR += (emp.serviceChargeUsed ? 0 : (emp.serviceChargeMVR || 0));
            departmentStats[emp.department].count++;
        });

        // Worksite-wise distribution
        const worksiteStats = {};
        enrichedData.forEach(emp => {
            if (!worksiteStats[emp.workSite]) {
                worksiteStats[emp.workSite] = {
                    totalUSD: 0,
                    totalMVR: 0,
                    count: 0,
                    serviceChargeUSD: 0,
                    serviceChargeMVR: 0
                };
            }
            const totalAllowances = (emp.allowances || []).reduce((sum, a) => sum + parseFloat(a.amount), 0);
            const totalDeductions = (emp.deductions || []).reduce((sum, d) => sum + parseFloat(d.amount), 0);
            const netSalaryUSD = parseFloat(emp.basicSalaryUSD) + totalAllowances - totalDeductions;
            const netSalaryMVR = parseFloat(emp.basicSalaryMVR) + (totalAllowances - totalDeductions) * 15.42;

            worksiteStats[emp.workSite].totalUSD += netSalaryUSD;
            worksiteStats[emp.workSite].totalMVR += netSalaryMVR;
            worksiteStats[emp.workSite].serviceChargeUSD += (emp.serviceChargeUsed ? 0 : (emp.serviceChargeMVR || 0)) / 15.42;
            worksiteStats[emp.workSite].serviceChargeMVR += (emp.serviceChargeUsed ? 0 : (emp.serviceChargeMVR || 0));
            worksiteStats[emp.workSite].count++;
        });

        // Nationality-wise distribution
        const nationalityStats = {};
        enrichedData.forEach(emp => {
            if (!nationalityStats[emp.nationality]) {
                nationalityStats[emp.nationality] = {
                    totalUSD: 0,
                    totalMVR: 0,
                    count: 0,
                    serviceChargeUSD: 0,
                    serviceChargeMVR: 0
                };
            }
            const totalAllowances = (emp.allowances || []).reduce((sum, a) => sum + parseFloat(a.amount), 0);
            const totalDeductions = (emp.deductions || []).reduce((sum, d) => sum + parseFloat(d.amount), 0);
            const netSalaryUSD = parseFloat(emp.basicSalaryUSD) + totalAllowances - totalDeductions;
            const netSalaryMVR = parseFloat(emp.basicSalaryMVR) + (totalAllowances - totalDeductions) * 15.42;

            nationalityStats[emp.nationality].totalUSD += netSalaryUSD;
            nationalityStats[emp.nationality].totalMVR += netSalaryMVR;
            nationalityStats[emp.nationality].serviceChargeUSD += (emp.serviceChargeUsed ? 0 : (emp.serviceChargeMVR || 0)) / 15.42;
            nationalityStats[emp.nationality].serviceChargeMVR += (emp.serviceChargeUsed ? 0 : (emp.serviceChargeMVR || 0));
            nationalityStats[emp.nationality].count++;
        });

        // Salary range distribution
        const salaryRanges = {
            'Under $500': { count: 0, totalUSD: 0, totalMVR: 0 },
            '$500-$1000': { count: 0, totalUSD: 0, totalMVR: 0 },
            '$1000-$2000': { count: 0, totalUSD: 0, totalMVR: 0 },
            '$2000-$3000': { count: 0, totalUSD: 0, totalMVR: 0 },
            'Over $3000': { count: 0, totalUSD: 0, totalMVR: 0 }
        };

        enrichedData.forEach(emp => {
            const totalAllowances = (emp.allowances || []).reduce((sum, a) => sum + parseFloat(a.amount), 0);
            const totalDeductions = (emp.deductions || []).reduce((sum, d) => sum + parseFloat(d.amount), 0);
            const netSalaryUSD = parseFloat(emp.basicSalaryUSD) + totalAllowances - totalDeductions;
            const netSalaryMVR = parseFloat(emp.basicSalaryMVR) + (totalAllowances - totalDeductions) * 15.42;
            
            let range = 'Under $500';
            if (netSalaryUSD >= 3000) range = 'Over $3000';
            else if (netSalaryUSD >= 2000) range = '$2000-$3000';
            else if (netSalaryUSD >= 1000) range = '$1000-$2000';
            else if (netSalaryUSD >= 500) range = '$500-$1000';

            salaryRanges[range].count++;
            salaryRanges[range].totalUSD += netSalaryUSD;
            salaryRanges[range].totalMVR += netSalaryMVR;
        });

        res.json({
            departmentDistribution: departmentStats,
            worksiteDistribution: worksiteStats,
            nationalityDistribution: nationalityStats,
            salaryRangeDistribution: salaryRanges,
            totalEmployees: enrichedData.length
        });
    } catch (err) {
        console.error('Error getting salary distribution:', err);
        res.status(500).json({ error: 'Failed to get salary distribution data' });
    }
});

// Initialize data files if they don't exist
const initDataFiles = () => {
    const dataPath = path.join(__dirname, 'data');
    
    // Ensure data directory exists
    if (!fs.existsSync(dataPath)) {
        fs.mkdirSync(dataPath);
    }

    // Initialize activities.json if it doesn't exist
    const activitiesPath = path.join(dataPath, 'activities.json');
    if (!fs.existsSync(activitiesPath)) {
        fs.writeFileSync(activitiesPath, JSON.stringify({ recent: [] }));
    }

    // Initialize salaries.json if it doesn't exist
    const salariesPath = path.join(dataPath, 'salaries.json');
    if (!fs.existsSync(salariesPath)) {
        // Create empty salaries array
        fs.writeFileSync(salariesPath, JSON.stringify([]));
        
        // If employees.json exists, create initial salary records
        const employeesPath = path.join(dataPath, 'employees.json');
        if (fs.existsSync(employeesPath)) {
            try {
                const employees = JSON.parse(fs.readFileSync(employeesPath, 'utf8'));
                const salaries = employees.map(emp => ({
                    employeeId: emp._id || '',
                    employeeNumber: emp.employeeNumber,
                    basicSalaryUSD: emp.salaryUSD || 0,
                    basicSalaryMVR: emp.salaryMVR || 0,
                    accountNumber: '',
                    allowances: [],
                    deductions: [],
                    paymentHistory: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }));
                fs.writeFileSync(salariesPath, JSON.stringify(salaries, null, 2));
            } catch (err) {
                console.error('Error initializing salaries.json:', err);
            }
        }
    }

    // Initialize timesheets.json if it doesn't exist
    const timesheetsPath = path.join(dataPath, 'timesheets.json');
    if (!fs.existsSync(timesheetsPath)) {
        fs.writeFileSync(timesheetsPath, JSON.stringify([]));
    }
};

// Get all departments
app.get('/api/departments', (req, res) => {
    try {
        const departments = readJsonFile('departments.json');
        res.json(departments);
    } catch (err) {
        console.error('Error reading departments:', err);
        res.status(500).json({ error: 'Failed to load departments' });
    }
});

// Add new department
app.post('/api/departments', (req, res) => {
    try {
        const { name, description } = req.body;
        
        // Validate input
        if (!name) {
            return res.status(400).json({ error: 'Department name is required' });
        }
        
        const departments = readJsonFile('departments.json');
        
        // Check if department already exists
        if (departments.find(d => d.name.toLowerCase() === name.toLowerCase())) {
            return res.status(400).json({ error: 'Department already exists' });
        }
        
        // Create new department
        const newDepartment = {
            id: departments.length > 0 ? Math.max(...departments.map(d => d.id)) + 1 : 1,
            name,
            description: description || ''
        };
        
        departments.push(newDepartment);
        writeJsonFile('departments.json', departments);
        
        res.status(201).json(newDepartment);
    } catch (err) {
        console.error('Error creating department:', err);
        res.status(500).json({ error: 'Failed to create department' });
    }
});

// Update department
app.put('/api/departments/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        
        // Validate input
        if (!name) {
            return res.status(400).json({ error: 'Department name is required' });
        }
        
        const departments = readJsonFile('departments.json');
        const departmentIndex = departments.findIndex(d => d.id === parseInt(id));
        
        if (departmentIndex === -1) {
            return res.status(404).json({ error: 'Department not found' });
        }
        
        // Check if department name already exists for other departments
        if (departments.some(d => d.name.toLowerCase() === name.toLowerCase() && d.id !== parseInt(id))) {
            return res.status(400).json({ error: 'Department name already exists' });
        }
        
        // Update department
        departments[departmentIndex].name = name;
        departments[departmentIndex].description = description || '';
        
        writeJsonFile('departments.json', departments);
        
        res.json(departments[departmentIndex]);
    } catch (err) {
        console.error('Error updating department:', err);
        res.status(500).json({ error: 'Failed to update department' });
    }
});

// Delete department
app.delete('/api/departments/:id', (req, res) => {
    try {
        const { id } = req.params;
        
        const departments = readJsonFile('departments.json');
        const filteredDepartments = departments.filter(d => d.id !== parseInt(id));
        
        if (filteredDepartments.length === departments.length) {
            return res.status(404).json({ error: 'Department not found' });
        }
        
        // Check if department is in use by any employee
        const employees = readJsonFile('employees.json');
        const department = departments.find(d => d.id === parseInt(id));
        
        if (employees.some(e => e.department === department.name)) {
            return res.status(400).json({ error: 'Department is in use by employees and cannot be deleted' });
        }
        
        writeJsonFile('departments.json', filteredDepartments);
        res.json({ message: 'Department deleted successfully' });
    } catch (err) {
        console.error('Error deleting department:', err);
        res.status(500).json({ error: 'Failed to delete department' });
    }
});

// Get all worksites
app.get('/api/worksites', (req, res) => {
    try {
        const worksites = readJsonFile('worksites.json');
        res.json(worksites);
    } catch (err) {
        console.error('Error reading worksites:', err);
        res.status(500).json({ error: 'Failed to load worksites' });
    }
});

// Add new worksite
app.post('/api/worksites', (req, res) => {
    try {
        const { name, location } = req.body;
        
        // Validate input
        if (!name || !location) {
            return res.status(400).json({ error: 'Worksite name and location are required' });
        }
        
        const worksites = readJsonFile('worksites.json');
        
        // Check if worksite already exists
        if (worksites.find(w => w.name.toLowerCase() === name.toLowerCase())) {
            return res.status(400).json({ error: 'Worksite already exists' });
        }
        
        // Create new worksite
        const newWorksite = {
            id: worksites.length > 0 ? Math.max(...worksites.map(w => w.id)) + 1 : 1,
            name,
            location
        };
        
        worksites.push(newWorksite);
        writeJsonFile('worksites.json', worksites);
        
        res.status(201).json(newWorksite);
    } catch (err) {
        console.error('Error creating worksite:', err);
        res.status(500).json({ error: 'Failed to create worksite' });
    }
});

// Update worksite
app.put('/api/worksites/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { name, location } = req.body;
        
        // Validate input
        if (!name || !location) {
            return res.status(400).json({ error: 'Worksite name and location are required' });
        }
        
        const worksites = readJsonFile('worksites.json');
        const worksiteIndex = worksites.findIndex(w => w.id === parseInt(id));
        
        if (worksiteIndex === -1) {
            return res.status(404).json({ error: 'Worksite not found' });
        }
        
        // Check if worksite name already exists for other worksites
        if (worksites.some(w => w.name.toLowerCase() === name.toLowerCase() && w.id !== parseInt(id))) {
            return res.status(400).json({ error: 'Worksite name already exists' });
        }
        
        // Update worksite
        worksites[worksiteIndex].name = name;
        worksites[worksiteIndex].location = location;
        
        writeJsonFile('worksites.json', worksites);
        
        res.json(worksites[worksiteIndex]);
    } catch (err) {
        console.error('Error updating worksite:', err);
        res.status(500).json({ error: 'Failed to update worksite' });
    }
});

// Delete worksite
app.delete('/api/worksites/:id', (req, res) => {
    try {
        const { id } = req.params;
        
        const worksites = readJsonFile('worksites.json');
        const filteredWorksites = worksites.filter(w => w.id !== parseInt(id));
        
        if (filteredWorksites.length === worksites.length) {
            return res.status(404).json({ error: 'Worksite not found' });
        }
        
        // Check if worksite is in use by any employee
        const employees = readJsonFile('employees.json');
        const worksite = worksites.find(w => w.id === parseInt(id));
        
        if (employees.some(e => e.workSite === worksite.name || e.worksite === worksite.name)) {
            return res.status(400).json({ error: 'Worksite is in use by employees and cannot be deleted' });
        }
        
        writeJsonFile('worksites.json', filteredWorksites);
        res.json({ message: 'Worksite deleted successfully' });
    } catch (err) {
        console.error('Error deleting worksite:', err);
        res.status(500).json({ error: 'Failed to delete worksite' });
    }
});

// Dashboard statistics endpoint
app.get('/api/dashboard/stats', (req, res) => {
    try {
        const employees = readJsonFile('employees.json');
        const departments = readJsonFile('departments.json');
        const worksites = readJsonFile('worksites.json');
        const users = readJsonFile('users.json');
        
        // Calculate department distribution
        const departmentCounts = {};
        employees.forEach(employee => {
            const dept = employee.department || 'Unassigned';
            departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
        });
        
        const departmentDistribution = Object.keys(departmentCounts).map(name => ({
            name,
            count: departmentCounts[name]
        }));
        
        // Calculate worksite distribution
        const worksiteCounts = {};
        employees.forEach(employee => {
            const site = employee.workSite || employee.worksite || 'Unassigned';
            worksiteCounts[site] = (worksiteCounts[site] || 0) + 1;
        });
        
        const worksiteDistribution = Object.keys(worksiteCounts).map(name => ({
            name,
            count: worksiteCounts[name]
        }));
        
        // Don't send password hashes to the client
        const safeUsers = users.map(({ id, username, role }) => ({ id, username, role }));
        
        res.json({
            totalEmployees: employees.length,
            departments,
            worksites,
            users: safeUsers,
            departmentDistribution,
            worksiteDistribution
        });
    } catch (err) {
        console.error('Error getting dashboard stats:', err);
        res.status(500).json({ error: 'Failed to get dashboard statistics' });
    }
});

// Recent activities endpoint
app.get('/api/dashboard/recent-activities', (req, res) => {
    try {
        const activities = readJsonFile('activities.json');
        res.json(activities);
    } catch (err) {
        console.error('Error getting recent activities:', err);
        res.status(500).json({ error: 'Failed to get recent activities' });
    }
});

// Call initialization before starting server
initDataFiles();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    // Only open browser on first start
    if (!process.env.BROWSER_OPENED) {
        process.env.BROWSER_OPENED = 'true';
        const url = `http://localhost:${PORT}/login`;
        const start = process.platform === 'win32' ? 'start' : 'open';
        exec(`${start} ${url}`);
    }
});