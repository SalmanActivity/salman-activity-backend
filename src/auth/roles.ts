import * as util from 'util';
import * as jwt from 'jsonwebtoken';
import { config as defaultConfig, Config } from '../config';
import { UserAccessor } from '../user/userAccessor';
import { UserMongoAccessor } from '../user/userMongoAccessor';

/**
 * Middleware admin digunakan untuk memberikan response 403 jika user yang mengakses suatu
 * endpoint bukanlah seorang admin. Jika user merupakan admin maka request akan diteruskan
 * ke middleware berikutnya.
 */
export function admin() {
  return async (req, res, next) => {
    if (req.user && req.user.admin) {
      return next();
    }
    
    return res.status(403).json({
      error: {
        msg: 'only admin can perform this action',
        cause: 'unauthorized access'
      }
    });
  };
}

/**
 * Middleware user digunakan untuk melakukan menginspeksi token yang dikirimkan oleh pengguna. Token
 * didapatkan pengguna saat melakukan login. Middleware melakukan pengecekan apakah token yang dikirimkan
 * pengguna merupakan token yang valid. Selain itu, middleware ini juga akan memberikan informasi mengenai
 * user yang sedang mengakses request ke middleware berikutnya. Setelah middleware ini dipanggil maka
 * `req.user` akan berisi object user yang sedang mengakses endpoint. Jika user tidak ditemukan atau token
 * kosong atau token tidak valid, maka `req.user` akan bernilai `undefined`. Middleware ini selalu meneruskan
 * request ke middleware berikutnya meskipun token tidak valid.
 * @param userAccessor accessor yang digunakan untuk mendapatkan user berdasarkan username
 * @param config configuration untuk mendapatkan secret key dari server
 */
export function user(
  userAccessor: UserAccessor = new UserMongoAccessor(),
  config:Config = defaultConfig
) {
  return async (req, res, next) => {
    let token = undefined;
    if (req.body.token) {
      token = req.body.token;
    }
    if (req.query && req.query.token) {
      token = req.query.token;
    }
    if (req.header('Authorization')) {
      const tokenHeader = req.header('Authorization');
      const tokenArr = tokenHeader.split(/\s+/);
      if (tokenArr.length === 2 && tokenArr[0].toLowerCase() === 'jwt') {
        token = tokenArr[1];
      }
    }
    req.token = token;

    try {
      const verifyFunction = util.promisify(jwt.verify);
      const data = await verifyFunction(token, config.secretKey);
      if (data) {
        req.user = await userAccessor.getById(data.id);
      }
    } catch(err) {
    }
    next();
  };
}