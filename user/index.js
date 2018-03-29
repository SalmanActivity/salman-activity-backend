var express = require('express')
var auth = require('../auth/index')
var crud = require('./crud')

var router = express.Router()

router.get('/', auth.auth, crud.findAllUsers)
router.get('/me', auth.auth, crud.findCurrentUser)
router.get('/:userId', auth.auth, crud.findOneUser)
router.post('/', auth.auth, auth.admin, crud.createOneUser)
router.put('/:userId', auth.auth, auth.admin, crud.updateOneUser)
router.delete('/:userId', auth.auth, auth.admin, crud.deleteOneUser)

module.exports = router;