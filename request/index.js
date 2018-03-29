var express = require('express')
var auth = require('../auth/index')
var crud = require('./crud')
var router = express.Router()

router.get('/', auth.user, crud.findAllRequests)

module.exports = router