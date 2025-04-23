// dashboard_api.js
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Employee Schema (inline, since no models dir)
const employeeSchema = new mongoose.Schema({}, { strict: false, collection: 'employees' });
const Employee = mongoose.models.Employee || mongoose.model('Employee', employeeSchema, 'employees');

// Dashboard stats endpoint
router.get('/stats', async (req, res) => {
    try {
        const total = await Employee.countDocuments();
        const byDepartment = await Employee.aggregate([
            { $group: { _id: "$Deapartment", count: { $sum: 1 } } }
        ]);
        const byNationality = await Employee.aggregate([
            { $group: { _id: "$Nationality", count: { $sum: 1 } } }
        ]);
        const byWorksite = await Employee.aggregate([
            { $group: { _id: "$Work Site", count: { $sum: 1 } } }
        ]);
        const byGender = await Employee.aggregate([
            { $group: { _id: "$Gender", count: { $sum: 1 } } }
        ]);
        // Employee growth by year
        const byYear = await Employee.aggregate([
            { $addFields: {
                joinYear: {
                    $cond: [
                        { $isNumber: "$Joined Date" }, "$Joined Date",
                        { $year: { $dateFromString: { dateString: "$Joined Date", onError: null, onNull: null } } }
                    ]
                }
            }},
            { $group: { _id: "$joinYear", count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);
        res.json({ total, byDepartment, byNationality, byWorksite, byGender, byYear });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Recent activities endpoint (last 5 joined)
router.get('/recent-activities', async (req, res) => {
    try {
        const recent = await Employee.find({}, {
            'Employee Name': 1,
            Designation: 1,
            'Joined Date': 1,
            _id: 0
        }).sort({ 'Joined Date': -1 }).limit(5);
        res.json({ recent });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Debug endpoint to check if API can see employees
router.get('/debug-employees', async (req, res) => {
    try {
        const docs = await Employee.find({}).limit(5);
        res.json(docs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
