const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeAdmin } = require('../middlewares/auth');
const pool = require('../config/db');

router.get('/job-posts/:id/applications', authenticateToken, authorizeAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const query = `
            SELECT applications.id, users.name AS candidate_name, 
                   applications.cover_letter, applications.submitted_at
            FROM applications
            JOIN users ON applications.user_id = users.id
            WHERE applications.job_posting_id = $1
        `;
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.render('jobApplications', {
                title: 'Job Applications',
                name: req.user.name,
                applications: [],
                message: 'No applications found for this job post.'
            });
        }

        res.render('jobApplications', {
            title: 'Job Applications',
            name: req.user.name,
            applications: result.rows
        });
    } catch (err) {
        console.error('Database Error:', err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
