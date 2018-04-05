var express = require('express')
var auth = require('../auth/index')
var crud = require('./crud')

var router = express.Router();

router.get('/', auth.auth, crud.findAllDivisions)
router.get('/:divisionId', auth.auth, crud.findOneDivision)
router.post('/', auth.auth, auth.admin, crud.createOneDivision)
router.put('/:divisionId', auth.auth, auth.admin, crud.updateOneDivision)
router.delete('/:divisionId', auth.auth, auth.admin, crud.deleteOneDivision)

module.exports = router;