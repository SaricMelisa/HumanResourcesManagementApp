const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken, authorizeCandidate } = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/cv/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

router.get('/profile', authenticateToken, authorizeCandidate, async (req, res) => {
    try {
        const query = `SELECT * FROM candidate_profiles WHERE user_id = $1`;
        const result = await pool.query(query, [req.user.id]);
        const profile = result.rows[0];

        res.render('candidateProfile', { profile });
    } catch (err) {
        console.error('Database Error:', err.message);
        res.status(500).send('Server error');
    }
});

router.post('/profile', authenticateToken, authorizeCandidate, upload.single('cv_file'), async (req, res) => {
    const { full_name, phone_number, address, skills, education, experience } = req.body;
    const cv_file_path = req.file ? `/uploads/cv/${req.file.filename}` : null;

    try {
        const query = `
            INSERT INTO candidate_profiles (user_id, full_name, phone_number, address, skills, education, experience, cv_file_path)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (user_id) DO UPDATE
            SET full_name = $2, phone_number = $3, address = $4, skills = $5, education = $6, experience = $7, cv_file_path = COALESCE($8, candidate_profiles.cv_file_path), updated_at = CURRENT_TIMESTAMP
        `;
        await pool.query(query, [req.user.id, full_name, phone_number, address, skills, education, experience, cv_file_path]);

        res.redirect('/candidate/profile');
    } catch (err) {
        console.error('Database Error:', err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
