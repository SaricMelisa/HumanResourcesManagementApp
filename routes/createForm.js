const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeAdmin } = require('../middlewares/auth');
const pool = require('../config/db');

router.get('/', authenticateToken, authorizeAdmin, (req, res) => {
    res.render('createForm', {
        title: 'Create Form',
        name: req.user.name
    });
});

router.post('/save', authenticateToken, authorizeAdmin, async (req, res) => {
    const { fields, formName } = req.body;

    if (!fields || fields.length === 0 || !formName || formName.trim() === '') {
        return res.status(400).send('All fields are required.');
    }

    try {
        const query = 'INSERT INTO forms (name, fields) VALUES ($1, $2)';
        await pool.query(query, [formName, fields]);
        res.redirect('/admin');
    } catch (err) {
        console.error('Database Error:', err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
