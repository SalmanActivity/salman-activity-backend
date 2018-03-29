var util = require('util')
var jwt = require('jsonwebtoken')
var config = require('../config')
var user = require('../user/user')

function auth(req, res, next) {
  let token = undefined
  if (req.body.token)
    token = req.body.token
  if (req.header('Authorization')) {
    let tokenHeader = req.header('Authorization')
    let tokenArr = tokenHeader.split(' ')
    if (tokenArr.length == 2 && tokenArr[0].toLowerCase() == 'jwt')
      token = tokenArr[1]
  }
  req.token = token

  return util.promisify(jwt.verify)(token, config.secretKey)
  .then(data => user.findOne({username: data.username}).exec())
  .then(user => {
    req.user = user.toJSON ? user.toJSON() : user
    return next()
  })
  .catch((err) => {
    res.status(403).json({
      error: {
        msg: 'cannot perform action',
        cause: 'unauthorized access'
      }
    })
  })
}

module.exports = auth