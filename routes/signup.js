const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../config/db');

router.get('/', (req, res) => {
    res.render('signup', { title: 'Sign Up' });
});

router.post('/', async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).send('All fields are required.');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = `
            INSERT INTO users (name, email, password, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id;
        `;

        const result = await pool.query(query, [name, email, hashedPassword, role]);

        if (result.rows.length > 0) {
            return res.redirect('/');
        } else {
            res.status(500).send('Failed to register user.');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

module.exports = router;
