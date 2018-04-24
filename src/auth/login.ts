import { verify } from 'password-hash';
import { sign } from 'jsonwebtoken';
import { config as defaultConfig, Config } from '../config';
import { User, UserAccessor } from '../user';
import UserMongoAccessor from '../user/userMongoAccessor';

/**
 * Endpoint ini digunakan untuk melakukan autentikasi pengguna menggunakan username dan password.
 * Jika pengguna terautentikasi, maka response berupa token yang menyatakan bahwa pengguna tersebut
 * terautentikasi. Token tersebut dapat digunakan untuk melakukan aksi-aksi berikutnya tanpa perlu
 * mengirimkan username dan password untuk setiap aksi.
 * @param userAccessor accessor yang digunakan untuk mendapatkan user berdasarkan username
 * @param config configuration untuk mendapatkan secret key dari server
 */
export function login(
  userAccessor: UserAccessor = new UserMongoAccessor(),
  config:Config = defaultConfig
) {
  return async (req, res) => {
    let username = undefined;
    let password = undefined;
    console.log("req bodyusername di login " + req.body.username);
    try {
      const usernameAndPasswordCheck = null;
      if (req.body.username && req.body.password) {
        username = req.body.username;
        password = req.body.password;
      } else {
        throw {status: 401, cause: 'empty username or password'};
      }

      const user:User = await userAccessor.getByUsername(username);
      if (user && user.enabled && verify(password, user.password)) {
        const payload = {
          id: user.id,
          name: user.name,
          username: user.username
        };
        const token = sign(payload, config.secretKey);
        return res.header('Authorization', 'JWT ' + token).status(200).json({token});
      } else {
        throw {status: 403, cause: 'wrong username or password'};
      }
    } catch(err) {
      if (!err.status) {
        err = {
          status: 500,
          cause: err
        };
      }
      res.status(err.status).json({
        error: {
          msg: 'login failed',
          cause: err.cause
        }
      });
    }
  };
}