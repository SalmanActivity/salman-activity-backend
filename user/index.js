var express = require('express')
var auth = require('./auth')
var entity = require('./entity')

var router = express.Router();

router.post('/login', auth.login)
router.post('/check_auth', auth.auth, (req, res, next) => {
    res.json({
        login: true,
        token: req.token
    })
})

router.get('/', auth.auth, entity.findAllUsers)
router.get('/:userId', auth.auth, entity.findOneUser)
router.post('/', auth.auth, auth.admin, entity.createOneUser)
router.put('/:userId', auth.auth, auth.admin, entity.updateOneUser)
router.delete('/:userId', auth.auth, auth.admin, entity.deleteOneUser)

module.exports = router;