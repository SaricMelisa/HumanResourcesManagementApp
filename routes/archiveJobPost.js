const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeAdmin } = require('../middlewares/auth');
const pool = require('../config/db');

router.post('/job-posts/:id/archive', authenticateToken, authorizeAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const query = `
            UPDATE job_posts
            SET status = 'archived'
            WHERE id = $1
        `;
        const result = await pool.query(query, [id]);

        if (result.rowCount === 0) {
            return res.status(404).send('Job post not found.');
        }

        res.redirect('/admin/job-posts');
    } catch (err) {
        console.error('Database Error:', err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
