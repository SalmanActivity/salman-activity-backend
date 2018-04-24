import { displayError } from './error';
import * as crudUtil from './util';

/**
 * Fungsi ini digunakan untuk menciptakan middleware yang digunakan untuk melakukan penyimpanan object baru.
 * Penyimpanan terdiri dari beberapa tahap, yaitu:
 * 1. init: tahapan ini optional dan digunakan untuk inisialisasi middleware, fungsi option.init akan dipanggil
 * 2. validasi: tahapan ini bertujuan untuk memvalidasi input dari pengguna, fungsi option.validateOne akan
 *    dipanggil untuk melakukan validasi.
 * 3. insert object: tahapan ini bertujuan untuk memasukkan object ke penyimpanan, fungsi option.insertOne akan 
 *    dipanggil untuk menangani penyimpanan.
 * 4. convert object: tahapain ini digunakan untuk mengubah bentuk object menjadi bentuk lain, misalnya untuk
 *    menghapus attribute tertentu dari object atau mengubah attribute-nya. pada tahapan ini fungsi option.convertOne
 *    akan dipanggil.
 * 5. filter field: tahapan ini digunakan untuk memilih atribut apa saja yang akan ditampilkan sebagai response
 *    endpoint. Fungsi option.filterFieldOne akan dipanggil untuk menjalankan tahapan ini.
 * Setelah keempat tahapan selesai dilakukan, maka response yang berupa object yang telah tersimpan akan dikirimkan
 * sebagai response endpoint.
 * @param option object yang berisi fungsi untuk menjalankan penyimpanan object baru.
 * @returns express middleware yang digunakan untuk melakukan penyimpanan object baru.
 */
export function createOne(option) {
  const requiredFunctions = ['init','validateOne','insertOne','convertOne','filterFieldOne'];
  const {init,validateOne,insertOne,convertOne,filterFieldOne} = crudUtil.fetchOptionFunctions(option, requiredFunctions);

  return async (req, res, next) => {
    const context = {};
    
    try {
      let object = await init(req, context);
      try {
        object = await validateOne(object, context);
      } catch (err) {
        if (err.status) {
          throw err;
        }
        throw {status:400, cause:err};
      }
      object = await insertOne(object, context);
      object = await convertOne(object, context);
      object = await filterFieldOne(object, context);
      res.status(200).json(object);
    } catch (err) {
      displayError(res, 'cannot insert object')(err);
    }
  };
}