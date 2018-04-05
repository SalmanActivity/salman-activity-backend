import { user } from './roles'
import { UserAccessor, UserMongoAccessor } from '../user'
import defaultConfig, { Config } from '../config'

export default function auth(userAccessor: UserAccessor = new UserMongoAccessor(),
                            config: Config = defaultConfig) {
  return (req, res, next) => {
    return new Promise((resolve, reject) => {
      user(userAccessor, config)(req, res, () => {
        if (req.user)
          resolve(next())
        else {
          let error = {
            error: {
              msg: 'cannot perform action',
              cause: 'unauthorized access'
            }
          }
          res.status(403).json(error)
          resolve(error)
        }
      })
    })
  }
  
}
