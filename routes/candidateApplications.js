const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const pool = require('../config/db');

router.get('/applications', authenticateToken, async (req, res) => {
    try {
        const query = `
            SELECT jp.title AS job_title, a.cover_letter, a.submitted_at
            FROM applications a
            JOIN job_posts jp ON a.job_posting_id = jp.id
            WHERE a.user_id = $1
            ORDER BY a.submitted_at DESC
        `;
        const result = await pool.query(query, [req.user.id]);

        res.render('jobApplications', {
            title: 'My Applications',
            name: req.user.name,
            applications: result.rows,
        });
    } catch (err) {
        console.error('Database Error:', err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
