var util = require('util')
var jwt = require('jsonwebtoken')
var config = require('../config')
var userModel = require('../user/user')

function user(req, res, next) {
  let token = undefined
  if (req.body.token)
    token = req.body.token
  if (req.header('Authorization')) {
    let tokenHeader = req.header('Authorization')
    let tokenArr = tokenHeader.split(/\s+/)
    if (tokenArr.length == 2 && tokenArr[0].toLowerCase() == 'jwt')
      token = tokenArr[1]
  }
  req.token = token

  return util.promisify(jwt.verify)(token, config.secretKey)
  .then(data => userModel.findOne({username: data.username}).populate('division').exec())
  .then(user => {
    req.user = user.toJSON ? user.toJSON() : user
    return next()
  })
  .catch(err => next())
}

function auth(req, res, next) {
  return user(req, res, (err) => {
    if (!err && req.user)
      return next()
    else
      return res.status(403).json({
        error: {
          msg: 'cannot perform action',
          cause: 'unauthorized access'
        }
      })
  })
}

module.exports = { user, auth }
