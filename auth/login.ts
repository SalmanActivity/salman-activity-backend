import { verify } from 'password-hash'
import { sign } from 'jsonwebtoken'
import defaultConfig, { Config } from '../config'
import { User, UserAccessor } from '../user'
import UserMongoAccessor from '../user/userMongoAccessor'

export default function login(userAccessor: UserAccessor = new UserMongoAccessor(),
                              config:Config = defaultConfig) {
  return async (req, res) => {
    let username = undefined
    let password = undefined

    try {
      let usernameAndPasswordCheck = null
      if (req.body.username && req.body.password) {
        username = req.body.username
        password = req.body.password
      } else {
        throw {status: 401, cause: 'empty username or password'}
      }

      let user:User = await userAccessor.getByUsername(username)
      if (user && user.enabled && verify(password, user.password)) {
        let payload = {
          id: user.id,
          name: user.name,
          username: user.username
        }
        let token = sign(payload, config.secretKey)
        return res.header('Authorization', 'JWT ' + token).status(200).json({token})
      } else
        throw {status: 403, cause: 'wrong username or password'}
    } catch(err) {
      if (!err.status) {
        err = {
          status: 500,
          cause: err
        }
      }
      res.status(err.status).json({
        error: {
          msg: 'login failed',
          cause: err.cause
        }
      })
    }
  }
}