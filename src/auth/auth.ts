import { user } from './roles';
import { UserAccessor } from '../user';
import UserMongoAccessor from '../user/userMongoAccessor';
import { config as defaultConfig, Config } from '../config';

/**
 * Digunakan untuk mengautentikasi user seperti yang dilakukan oleh middleware user.
 * Perbedaan dengan middleware user adalah: middleware ini akan langsung memberikan response
 * 403 jika user tidak terautentikasi.
 * @param userAccessor accessor yang digunakan untuk mendapatkan user berdasarkan username
 * @param config configuration untuk mendapatkan secret key dari server
 */
export function auth(
  userAccessor: UserAccessor = new UserMongoAccessor(),
  config: Config = defaultConfig
) {
  const userMiddleware = user(userAccessor, config);

  return async (req, res, next) => {
    return userMiddleware(req, res, () => {
      if (req.user) {
        next();
      } else {
        const error = {
          error: {
            msg: 'cannot perform action',
            cause: 'unauthorized access'
          }
        };
        res.status(403).json(error);
      }
    });
  };
}
