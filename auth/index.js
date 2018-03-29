var express = require('express')
var router = express.Router()
var login = require('./login')
var auth = require('./auth')

router.post('/login', login)
router.post('/check_auth', auth.auth, (req, res, next) => {
    res.json({
        login: true,
        token: req.token
    })
})

module.exports = {
  router,
  login: require('./login'),
  user: require('./auth').user,
  auth: require('./auth').auth,
  roles: require('./roles'),
  admin: require('./roles').admin
}