var express = require('express')
var auth = require('../auth/index')
var crud = require('./crud')
var router = express.Router()

router.get('/', auth.user, crud.findAllRequests)
router.get('/:requestId', auth.user, crud.findOneRequest)
router.post('/', auth.auth, crud.createOneRequest)
router.put('/:requestId', auth.user, crud.updateOneRequest)
router.delete('/:requestId', auth.auth, crud.deleteOneRequest)

module.exports = router