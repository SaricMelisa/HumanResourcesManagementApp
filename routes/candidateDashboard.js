const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken } = require('../middlewares/auth');

router.get('/', authenticateToken, async (req, res) => {
    try {
        const jobPostsResult = await pool.query('SELECT * FROM job_posts WHERE status = $1', ['active']);
        res.render('candidateDashboard', {
            title: 'Candidate Dashboard',
            name: req.user.name,
            jobPosts: jobPostsResult.rows, 
        });
    } catch (err) {
        console.error('Database Error:', err.message);
        res.status(500).send('Server error');
    }
});

router.get('/job-posts', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM job_posts WHERE status = $1', ['active']);
        res.render('jobPosts', {
            title: 'Active Job Posts',
            name: req.user.name,
            jobPosts: result.rows,
        });
    } catch (err) {
        console.error('Database Error:', err.message);
        res.status(500).send('Server error');
    }
});

router.get('/applications', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT jp.title AS job_title, a.cover_letter, a.submitted_at 
            FROM applications a
            JOIN job_posts jp ON a.job_posting_id = jp.id
            WHERE a.user_id = $1
            ORDER BY a.submitted_at DESC
        `, [req.user.id]);

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

router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);

        res.render('editProfile', {
            title: 'Edit Profile',
            name: req.user.name,
            user: result.rows[0],
        });
    } catch (err) {
        console.error('Database Error:', err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
