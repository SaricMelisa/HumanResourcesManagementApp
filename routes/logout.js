const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
   
    res.clearCookie('authToken'); 
    res.redirect('/'); 
});

module.exports = router;
