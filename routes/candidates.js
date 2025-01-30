const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken, authorizeAdmin, authorizeCandidate } = require('../middlewares/auth');

router.post('/:id/update-score', authenticateToken, authorizeAdmin, async (req, res) => {
    const { id } = req.params;
    const { score, comments } = req.body;

    if (!score || !comments) {
        return res.status(400).send('Score and comments are required.');
    }

    try {
        const query = `
            UPDATE candidates
            SET average_score = $1, comments = $2
            WHERE id = $3
        `;
        await pool.query(query, [score, comments, id]);
        res.redirect('/admin/candidates/ranked');
    } catch (err) {
        console.error('Database Error:', err.message);
        res.status(500).send('Server error');
    }
});

router.get('/ranked', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const query = `
            SELECT c.id, u.name AS candidate_name, jp.title AS job_title, 
                   c.average_score, c.comments
            FROM candidates c
            JOIN users u ON c.user_id = u.id
            JOIN job_posts jp ON c.job_post_id = jp.id
            WHERE c.average_score IS NOT NULL
            ORDER BY c.average_score DESC
        `;
        const result = await pool.query(query);
        const rankedCandidates = result.rows;

        res.render('rankedCandidates', {
            title: 'Ranked Candidates',
            name: req.user.name,
            rankedCandidates,
        });
    } catch (err) {
        console.error('Database Error:', err.message);
        res.status(500).send('Server error');
    }
});

router.get('/applications', authenticateToken, authorizeCandidate, async (req, res) => {
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

router.get('/ranked-jobs', authenticateToken, authorizeCandidate, async (req, res) => {
    try {
        const query = `
            SELECT jp.id, jp.title, AVG(c.average_score) AS average_score,
                   RANK() OVER (ORDER BY AVG(c.average_score) DESC) AS rank
            FROM job_posts jp
            LEFT JOIN candidates c ON jp.id = c.job_post_id
            GROUP BY jp.id, jp.title
            ORDER BY rank ASC
        `;
        const result = await pool.query(query);

        res.render('rankedJobs', {
            title: 'Ranked Jobs',
            name: req.user.name,
            rankedJobs: result.rows,
        });
    } catch (err) {
        console.error('Database Error:', err.message);
        res.status(500).send('Server error');
    }
});

router.get('/profile', authenticateToken, authorizeCandidate, async (req, res) => {
    try {
        const query = 'SELECT * FROM users WHERE id = $1';
        const result = await pool.query(query, [req.user.id]);

        res.render('editProfile', {
            title: 'Edit Profile',
            user: result.rows[0],
            name: req.user.name,
        });
    } catch (err) {
        console.error('Database Error:', err.message);
        res.status(500).send('Server error');
    }
});

router.post('/profile', authenticateToken, authorizeCandidate, async (req, res) => {
    const { name, email, experience, skills } = req.body;
    const cv = req.file ? req.file.filename : null;

    try {
        const query = `
            UPDATE users 
            SET name = $1, email = $2, experience = $3, skills = $4, cv = $5
            WHERE id = $6
        `;
        await pool.query(query, [name, email, experience, skills, cv, req.user.id]);

        res.redirect('/candidate/profile');
    } catch (err) {
        console.error('Database Error:', err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
