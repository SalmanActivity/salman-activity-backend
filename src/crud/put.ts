import { displayError } from './error';
import * as crudUtil from './util';

/**
 * Fungsi ini digunakan untuk menciptakan middleware yang digunakan untuk melakukan modifikasi object.
 * Proses modifikasi object terdiri dari beberapa tahap, yaitu:
 * 1. init: tahapan ini optional dan digunakan untuk inisialisasi middleware, fungsi option.init akan dipanggil
 * 2. fetch object: tahapan untuk mencari object yang ingin diubah, tahapan ini akan memanggil fungsi
 *    option.fetchOne untuk mendapatkan object yang akan diubah.
 * 3. validasi: tahapan ini bertujuan untuk memvalidasi input dari pengguna, fungsi option.validateOne akan
 *    dipanggil untuk melakukan validasi.
 * 4. update object: tahapan ini bertujuan untuk memasukkan object baru ke penyimpanan dan mengganti object lama,
 *    fungsi option.updateOne akan dipanggil untuk menangani penyimpanan.
 * 5. convert object: tahapain ini digunakan untuk mengubah bentuk object menjadi bentuk lain, misalnya untuk
 *    menghapus attribute tertentu dari object atau mengubah attribute-nya. pada tahapan ini fungsi option.convertOne
 *    akan dipanggil.
 * 6. filter field: tahapan ini digunakan untuk memilih atribut apa saja yang akan ditampilkan sebagai response
 *    endpoint. Fungsi option.filterFieldOne akan dipanggil untuk menjalankan tahapan ini.
 * Setelah keempat tahapan selesai dilakukan, maka response yang berupa object yang telah tersimpan akan dikirimkan
 * sebagai response endpoint.
 * @param option object yang berisi fungsi untuk menjalankan proses-proses pada modifikasi object.
 * @returns express middleware yang digunakan untuk melakukan modifikasi object.
 */
export function updateOne(option) {
  const requiredFunctions = ['init','fetchOne','validateOne','updateOne','convertOne','filterFieldOne'];
  const {init,fetchOne,validateOne,updateOne,convertOne,filterFieldOne} = crudUtil.fetchOptionFunctions(option, requiredFunctions);

  return async (req, res, next) => {
    const context = {};

    try {
      let object = await init(req, context);
      object = await fetchOne(object, context);
      if (!object) {
        throw {status:404, cause: 'object not found'};
      }
      try {
        object = await validateOne(object, context);
      } catch (err) {
        if (err.status) {
          throw err;
        }
        else {
          throw {status:400, cause: err};
        }
      }
      object = await updateOne(object, context);
      object = await convertOne(object, context);
      object = await filterFieldOne(object, context);
      res.status(200).json(object);
    } catch (err) {
      displayError(res, 'cannot update object')(err);
    }
  };
}
