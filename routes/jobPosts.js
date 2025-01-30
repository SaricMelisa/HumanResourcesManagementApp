const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeAdmin } = require('../middlewares/auth');
const pool = require('../config/db');

router.get('/', authenticateToken, authorizeAdmin, async (req, res) => {
    const { position, status, deadline } = req.query; 
    let query = 'SELECT * FROM job_posts WHERE 1=1'; 
    const params = [];

    if (position) {
        query += ' AND title ILIKE $' + (params.length + 1);
        params.push(`%${position}%`);
    }

    if (status) {
        query += ' AND status = $' + (params.length + 1);
        params.push(status);
    }

    if (deadline) {
        query += ' AND application_deadline <= $' + (params.length + 1);
        params.push(deadline);
    }

    query += ' ORDER BY created_at DESC';

    try {
        const result = await pool.query(query, params);
        res.render('jobPosts', {
            title: 'Manage Job Posts',
            name: req.user.name,
            jobPosts: result.rows,
        });
    } catch (err) {
        console.error('Database Error:', err.message);
        res.status(500).send('Server error');
    }
});

router.get('/new', authenticateToken, authorizeAdmin, (req, res) => {
    res.render('createJobPost', {
        title: 'Create Job Post',
        name: req.user.name,
    });
});

router.post('/', authenticateToken, authorizeAdmin, async (req, res) => {
    const { title, description, application_deadline } = req.body;

    if (!title || !description || !application_deadline) {
        return res.status(400).send('All fields are required.');
    }

    try {
        const query = `
            INSERT INTO job_posts (title, description, application_deadline, status)
            VALUES ($1, $2, $3, 'active')
        `;
        await pool.query(query, [title, description, application_deadline]);
        res.redirect('/admin/job-posts');
    } catch (err) {
        console.error('Database Error:', err.message);
        res.status(500).send('Server error');
    }
});

router.get('/:id/applications', authenticateToken, authorizeAdmin, async (req, res) => {
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

        res.render('jobApplications', {
            title: 'Job Applications',
            name: req.user.name,
            applications: result.rows,
        });
    } catch (err) {
        console.error('Database Error:', err.message);
        res.status(500).send('Server error');
    }
});

router.post('/:id/archive', authenticateToken, authorizeAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const query = `
            UPDATE job_posts
            SET status = 'archived'
            WHERE id = $1
        `;
        await pool.query(query, [id]);
        res.redirect('/admin/job-posts');
    } catch (err) {
        console.error('Database Error:', err.message);
        res.status(500).send('Server error');
    }
});

router.get('/:id/edit', authenticateToken, authorizeAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const query = `SELECT * FROM job_posts WHERE id = $1`;
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).send('Job post not found.');
        }

        res.render('editJobPost', {
            title: 'Edit Job Post',
            name: req.user.name,
            jobPost: result.rows[0],
        });
    } catch (err) {
        console.error('Database Error:', err.message);
        res.status(500).send('Server error');
    }
});

router.post('/:id/edit', authenticateToken, authorizeAdmin, async (req, res) => {
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

router.post('/:id/delete', authenticateToken, authorizeAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const query = `DELETE FROM job_posts WHERE id = $1`;
        await pool.query(query, [id]);
        res.redirect('/admin/job-posts');
    } catch (err) {
        console.error('Database Error:', err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
