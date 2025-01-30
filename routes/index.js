const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeAdmin } = require('../middlewares/auth');

router.get('/', (req, res) => {
    res.render('index', { title: 'Login' });
});

router.get('/admin', authenticateToken, authorizeAdmin, (req, res) => {
    res.render('admin', {
        title: 'Admin Dashboard',
        name: req.user.name,
    });
});

router.get('/candidate', authenticateToken, (req, res) => {
    if (req.user.role === 'candidate') {
        res.render('candidateDashboard', {
            title: 'Candidate Dashboard',
            name: req.user.name,
        });
    } else {
        res.redirect('/');
    }
});

router.get('/logout', (req, res) => {
    
    res.clearCookie('authToken'); 
    res.redirect('/');
});

module.exports = router;
