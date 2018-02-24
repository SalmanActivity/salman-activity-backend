var express = require('express')
var auth = require('./auth')

var router = express.Router();

router.post('/login', auth.login)
router.get('/check_auth', auth.auth, (req, res, next) => {
    res.json({
        status: 'success',
        success: true,
        login: true
    })
})

module.exports = router;