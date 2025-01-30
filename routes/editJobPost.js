const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeAdmin } = require('../middlewares/auth');
const pool = require('../config/db');

router.get('/job-posts/:id/edit', authenticateToken, authorizeAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('SELECT * FROM job_posts WHERE id = $1', [id]);
        const jobPost = result.rows[0];

        if (!jobPost) {
            return res.status(404).send('Job post not found.');
        }

        res.render('editJobPost', {
            title: 'Edit Job Post',
            name: req.user.name,
            jobPost,
        });
    } catch (err) {
        console.error('Database Error:', err.message);
        res.status(500).send('Server error');
    }
});

router.post('/job-posts/:id/edit', authenticateToken, authorizeAdmin, async (req, res) => {
    const { id } = req.params;
    const { title, description, application_deadline } = req.body;

    if (!title || !description || !application_deadline) {
        return res.status(400).send('All fields are required.');
    }

    try {
        const query = `
            UPDATE job_posts
            SET title = $1, description = $2, application_deadline = $3
            WHERE id = $4
        `;
        await pool.query(query, [title, description, application_deadline, id]);
        res.redirect('/admin/job-posts');
    } catch (err) {
        console.error('Database Error:', err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
