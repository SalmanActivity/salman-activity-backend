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
router.get('/:id', auth.auth)
router.post('/', auth.auth, auth.admin)
router.put('/:id', auth.auth, auth.admin)
router.delete('/:id', auth.auth, auth.admin)

module.exports = router;