const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken, authorizeAdmin } = require('../middlewares/auth');

router.get('/', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const query = `
            SELECT 
                jp.title AS job_title,
                COUNT(a.id) AS total_applications,
                AVG(a.average_score) AS average_score,
                STRING_AGG(DISTINCT u.name, ', ') FILTER (WHERE a.average_score >= 8) AS top_candidates
            FROM job_posts jp
            LEFT JOIN applications a ON jp.id = a.job_posting_id
            LEFT JOIN users u ON a.user_id = u.id
            GROUP BY jp.title
            ORDER BY total_applications DESC;
        `;
        const result = await pool.query(query);

        res.render('reports', {
            title: 'HR Reports',
            reports: result.rows,
            name: req.user.name,
        });
    } catch (err) {
        console.error('Database Error:', err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
