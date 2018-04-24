import { displayError } from './error';
import * as crudUtil from './util';

/**
 * Fungsi ini digunakan untuk menciptakan middleware yang digunakan untuk melakukan pencarian object.
 * Pencarian terdiri dari beberapa tahap, yaitu:
 * 1. init: tahapan ini optional dan digunakan untuk inisialisasi middleware, fungsi option.init akan dipanggil
 * 2. fetch object: tahapan untuk mencari object yang diinginkan, tahapan ini akan memenggil fungsi
 *    option.fetchMany untuk mendapatkan object yang akan ditampilkan.
 * 3. convert object: tahapain ini digunakan untuk mengubah bentuk object menjadi bentuk lain, misalnya untuk
 *    menghapus attribute tertentu dari object atau mengubah attribute-nya. pada tahapan ini fungsi option.convertMany
 *    akan dipanggil.
 * 4. filter many: tahapan ini memilih object mana saja yang akan dikirimkan pada response. Pada tahapan ini,
 *    fungsi option.filterMany akan dipanggil.
 * 5. filter field: tahapan ini digunakan untuk memilih atribut apa saja yang akan ditampilkan sebagai response
 *    endpoint. Fungsi option.filterFieldMany akan dipanggil untuk menjalankan tahapan ini.
 * Setelah keempat tahapan selesai dilakukan, maka response yang berupa array of object yang akan dikirimkan
 * sebagai response.
 * @param option object yang berisi fungsi untuk menjalankan pencarian object.
 * @returns express middleware yang digunakan untuk melakukan pencarian object.
 */
export function readMany(option) {
  const requiredFunctions = ['init','fetchMany','convertMany','filterMany','filterFieldMany'];
  const {init,fetchMany,convertMany,filterMany,filterFieldMany} = crudUtil.fetchOptionFunctions(option, requiredFunctions);

  return async (req, res, next) => {
    const context = {};
    try {
      let object = await init(req, context);
      object = await fetchMany(object, context);
      object = await convertMany(object, context);
      object = await filterMany(object, context);
      object = await filterFieldMany(object, context);
      res.status(200).json(object);
    } catch (err) {
      displayError(res, 'cannot fetch objects')(err);
    }
  };
}

/**
 * Fungsi ini digunakan untuk menciptakan middleware yang digunakan untuk mendapatkan sebuah object tertentu secara
 * spesifik. Proses yang dilakukan sama seperti readMany, hanya saja jika tidak terdapat object yang dimaksud maka
 * response berupa error 404.
 * @param option object yang berisi fungsi untuk menjalankan pencarian object.
 * @returns express middleware yang digunakan untuk melakukan pencarian object.
 */
export function readOne(option) {
  const requiredFunctions = ['init','fetchOne','convertOne','filterOne','filterFieldOne'];
  const {init,fetchOne,convertOne,filterOne,filterFieldOne} = crudUtil.fetchOptionFunctions(option, requiredFunctions);

  return async (req, res, next) => {
    try {
      const context = {};
      let object = await init(req, context);
      object = await fetchOne(object, context);

      if (object) {
        object = await convertOne(object, context);
      }
      else {
        throw {status:404, cause: 'object not found'};
      }
      
      if (object) {
        object = await filterOne(object, context);
      }
      else {
        throw {status:404, cause: 'object not found'};
      }
    
      if (object) {
        object = await filterFieldOne(object, context);
      }
      else {
        throw {status:404, cause: 'object not found'};
      }

      res.status(200).json(object);
    } catch (err) {
      displayError(res, 'cannot fetch specific object')(err);
    }
  };
}
