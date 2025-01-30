const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeAdmin } = require('../middlewares/auth');
const pool = require('../config/db');

router.get('/', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const query = 'SELECT id, title, description, application_deadline FROM job_posts WHERE status = $1 ORDER BY application_deadline ASC';
        const result = await pool.query(query, ['active']);
        const jobPosts = result.rows;

        res.render('evaluateCandidates', {
            title: 'Evaluate Candidates',
            name: req.user.name,
            jobPosts,
        });
    } catch (err) {
        console.error('Database Error:', err.message);
        res.status(500).send('Server error');
    }
});

router.get('/:jobId', authenticateToken, authorizeAdmin, async (req, res) => {
    const { jobId } = req.params;

    try {
        const query = `
            SELECT a.id AS application_id, u.name AS candidate_name, a.cover_letter, a.submitted_at, a.status
            FROM applications a
            JOIN users u ON a.user_id = u.id
            WHERE a.job_posting_id = $1
            ORDER BY a.submitted_at ASC
        `;
        const result = await pool.query(query, [jobId]);
        const applications = result.rows;

        res.render('jobApplications', {
            title: `Candidates for Job Post ${jobId}`,
            name: req.user.name,
            applications,
        });
    } catch (err) {
        console.error('Database Error:', err.message);
        res.status(500).send('Server error');
    }
});

router.post('/:applicationId/status', authenticateToken, authorizeAdmin, async (req, res) => {
    const { applicationId } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).send('Status is required.');
    }

    try {
        const query = 'UPDATE applications SET status = $1 WHERE id = $2';
        await pool.query(query, [status, applicationId]);

        res.redirect('back');
    } catch (err) {
        console.error('Database Error:', err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
