var passwordHash = require('password-hash')
var jwt = require('jsonwebtoken')
var config = require('../config')
var user = require('../user/user')

function login(req, res, next) {
  let username = undefined
  let password = undefined

  let usernameAndPasswordCheck = null
  if (req.body.username && req.body.password) {
    username = req.body.username
    password = req.body.password
    usernameAndPasswordCheck = Promise.resolve()
  } else {
    res.status(401)
    usernameAndPasswordCheck = Promise.reject('empty username or password')
  }

  return usernameAndPasswordCheck.then(() =>
    user.findOne({username}).exec().catch(error => Promise.reject('internal server error'))
  )
  .then((userDocument) => {
    if (userDocument && userDocument.enabled && passwordHash.verify(password, userDocument.password)) {
      let payload = {
        name: userDocument.name,
        username: userDocument.username
      }
      let token = jwt.sign(payload, config.secretKey)
      return res.header('Authorization', 'JWT ' + token).status(200).json({token})
    } else {
      res.status(403)
      return Promise.reject('wrong username or password')
    }
  })
  .catch((error) => {
    res.json({
      error: {
        msg: 'login failed',
        cause: error
      }
    })
  })
}

module.exports = login