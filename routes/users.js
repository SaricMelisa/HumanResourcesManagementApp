const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

router.post('/signup', async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).send('All fields are required.');
    }

    try {
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).send('Email already registered.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const query = `
            INSERT INTO users (name, email, password, role)
            VALUES ($1, $2, $3, $4)
        `;
        await pool.query(query, [name, email, hashedPassword, role]);

        res.redirect('/'); 
    } catch (error) {
        console.error('Database error:', error.message);
        res.status(500).send('Server error');
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const userQuery = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userQuery.rows[0];

        if (!user) {
            return res.status(401).send('Invalid email or password');
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).send('Invalid email or password');
        }

        
        const token = jwt.sign(
            { id: user.id, name: user.name, role: user.role },
            'secretkey',
            { expiresIn: '1h' }
        );

        res.cookie('auth_token', token, { httpOnly: true });
        if (user.role === 'admin') {
            return res.redirect('/admin');
        } else {
            return res.redirect('/candidate');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});
router.get('/signup', (req, res) => {
    res.render('signup', { title: 'Sign Up' });
});

module.exports = router;
