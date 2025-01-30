const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const token = req.cookies.auth_token;
    if (!token) {
        return res.redirect('/');
    }

    jwt.verify(token, 'secretkey', (err, user) => {
        if (err) {
            return res.redirect('/');
        }
        req.user = user; 
        next();
    });
}

function authorizeAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).send('Access denied');
    }
    next();
}

function authorizeCandidate(req, res, next) {
    if (req.user && req.user.role === 'candidate') {
        return next();
    }
    return res.status(403).send('Access denied.');
}

module.exports = { authenticateToken, authorizeAdmin, authorizeCandidate };
