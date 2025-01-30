const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');


router.get('/dashboard', authenticateToken, (req, res) => {
    if (req.user.role === 'candidate') {
        res.render('candidateDashboard', {
            title: 'Candidate Dashboard',
            name: req.user.name,
        });
    } else {
        res.redirect('/');
    }
});

module.exports = router;
