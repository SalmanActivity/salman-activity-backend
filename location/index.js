var express = require('express')
var auth = require('../user/auth')
var crud = require('./crud')

var router = express.Router();

router.get('/', auth.auth, crud.findAllLocations)
router.get('/:locationId', auth.auth, crud.findOneLocation)
router.post('/', auth.auth, auth.admin, crud.createOneLocation)
router.put('/:locationId', auth.auth, auth.admin, crud.updateOneLocation)
router.delete('/:locationId', auth.auth, auth.admin, crud.deleteOneLocation)

module.exports = router;