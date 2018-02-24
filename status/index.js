var express = require('express')
var healthcheck = require('./healtcheck')

var router = express.Router();
router.get('/healthcheck', healthcheck)

module.exports = router;