import * as util from 'util'
import * as jwt from 'jsonwebtoken'
import defaultConfig, { Config } from '../config'
import { UserAccessor, UserMongoAccessor } from '../user'

export function admin() {
  return async (req, res, next) => {
    if (req.user && req.user.admin)
      return next()
    
    return res.status(403).json({
      error: {
        msg: 'only admin can perform this action',
        cause: 'unauthorized access'
      }
    })
  }
}

export function user(userAccessor: UserAccessor = new UserMongoAccessor(), config:Config = defaultConfig) {
  return async (req, res, next) => {
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

    try {
      let verifyFunction = util.promisify(jwt.verify)
      let data = await verifyFunction(token, config.secretKey)
      if (data)
        req.user = await userAccessor.getById(data.id)
    } catch(err) {
    }
    next()
  }
}