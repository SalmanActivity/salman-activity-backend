import { user } from './roles';
import { UserAccessor } from '../user';
import UserMongoAccessor from '../user/userMongoAccessor';
import defaultConfig, { Config } from '../config';

export default function auth(userAccessor: UserAccessor = new UserMongoAccessor(),
                            config: Config = defaultConfig) {
  return (req, res, next) => {
    return new Promise((resolve, reject) => {
      user(userAccessor, config)(req, res, () => {
        if (req.user) {
          next();
        }
        else {
          const error = {
            error: {
              msg: 'cannot perform action',
              cause: 'unauthorized access'
            }
          };
          res.status(403).json(error);
        }
        resolve();
      });
    });
  };
  
}
