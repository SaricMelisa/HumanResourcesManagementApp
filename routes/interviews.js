const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken, authorizeAdmin } = require('../middlewares/auth');

router.get('/', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const query = `
            SELECT 
                i.id AS id,
                u.name AS candidate_name,
                jp.title AS job_title,
                i.interview_date,
                i.status
            FROM interviews i
            JOIN applications a ON i.application_id = a.id
            JOIN users u ON a.user_id = u.id
            JOIN job_posts jp ON a.job_posting_id = jp.id
            ORDER BY i.interview_date ASC;
        `;
        const result = await pool.query(query);

        res.render('interviews', {
            title: 'Scheduled Interviews',
            interviews: result.rows,
            name: req.user.name,
        });
    } catch (err) {
        console.error('Database Error:', err.message);
        res.status(500).send('Server error');
    }
});

router.post('/:id/evaluate', authenticateToken, authorizeAdmin, async (req, res) => {
    const { id } = req.params;
    const { score, comments } = req.body;

    if (!score) {
        return res.status(400).send('Score is required.');
    }

    try {
        const query = `
            UPDATE interviews
            SET score = $1, comments = $2, status = 'Evaluated'
            WHERE id = $3;
        `;
        await pool.query(query, [score, comments, id]);

        res.redirect('/admin/interviews');
    } catch (err) {
        console.error('Database Error:', err.message);
        res.status(500).send('Server error');
    }
});

router.get('/events', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const query = `
            SELECT i.id AS event_id, a.user_id AS candidate_id, i.interview_date, i.status
            FROM interviews i
            JOIN applications a ON i.application_id = a.id
        `;
        const result = await pool.query(query);

        const events = result.rows.map(row => ({
            id: row.event_id,
            title: `Interview with Candidate ${row.candidate_id}`,
            start: row.interview_date,
            extendedProps: {
                status: row.status,
            },
        }));

        res.json(events);
    } catch (err) {
        console.error('Error loading events:', err.message);
        res.status(500).send('Error loading events');
    }
});
router.get('/api', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const query = `
            SELECT i.id AS id, u.name AS candidate_name, i.interview_date, i.status
            FROM interviews i
            JOIN applications a ON i.application_id = a.id
            JOIN users u ON a.user_id = u.id
        `;
        const result = await pool.query(query);

        const events = result.rows.map(row => ({
            id: row.id,
            title: `Interview with ${row.candidate_name}`,
            start: row.interview_date,
            extendedProps: {
                status: row.status,
            },
        }));

        res.json(events);
    } catch (err) {
        console.error('Error loading events:', err.message);
        res.status(500).json({ error: 'Failed to load events' });
    }
});


module.exports = router;
