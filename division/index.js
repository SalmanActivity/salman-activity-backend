var express = require('express')
var crud = require('./crud')

var router = express.Router();

router.get('/', auth.auth)
router.get('/:userId', auth.auth)
router.post('/', auth.auth, auth.admin)
router.put('/:userId', auth.auth, auth.admin)
router.delete('/:userId', auth.auth, auth.admin)

module.exports = router;