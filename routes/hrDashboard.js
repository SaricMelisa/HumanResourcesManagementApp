const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeAdmin } = require('../middlewares/auth');
const pool = require('../config/db');

router.get('/', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const stats = {
            jobPostsCount: await pool.query('SELECT COUNT(*) FROM job_posts;'),
            applicationsCount: await pool.query('SELECT COUNT(*) FROM applications;'),
            avgScore: await pool.query('SELECT AVG(average_score) AS avg_score FROM candidates;'),
        };

        res.render('hrDashboard', {
            title: 'HR Dashboard',
            name: req.user.name,
            stats: {
                jobPostsCount: stats.jobPostsCount.rows[0].count,
                applicationsCount: stats.applicationsCount.rows[0].count,
                avgScore: stats.avgScore.rows[0].avg_score || 0,
            },
        });
    } catch (err) {
        console.error('Database Error:', err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
