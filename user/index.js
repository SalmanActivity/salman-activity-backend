var express = require('express')
var auth = require('./auth')

var router = express.Router();

router.post('/login', auth.login)
router.get('/check_auth', auth.auth)

module.exports = router;