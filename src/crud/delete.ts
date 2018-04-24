import { displayError } from './error';
import * as crudUtil from './util';

/**
 * Fungsi ini digunakan untuk menciptakan middleware yang digunakan untuk melakukan penghapusan object.
 * Penghapusan terdiri dari beberapa tahap, yaitu:
 * 1. init: tahapan ini optional dan digunakan untuk inisialisasi middleware, fungsi option.init akan dipanggil
 * 2. fetch object: tahapan untuk mendapatkan object yang ingin dihapus, tahapan ini akan memenggil fungsi
 *    option.fetchOne untuk mendapatkan object yang akan dihapus, jika tidak terdapat object yang akan dihapus
 *    (option.fetchOne mengembalikan nilai null/undefined) maka middleware akan memberikan response 404 object
 *    not found.
 * 3. delete object: tahapan ini merupakan tahapan penghapusan object. Fungsi option.deleteOne akan dipanggil untuk
 *    menghapus object yang didapatkan di tahan kedua.
 * 4. filter field: tahapan ini digunakan untuk memilih atribut apa saja yang akan ditampilkan sebagai response
 *    endpoint. Fungsi option.filterFieldOne akan dipanggil untuk menjalankan tahapan ini.
 * Setelah keempat tahapan selesai dilakukan, maka response yang berupa object yang telah terhapus akan dikirimkan
 * sebagai response endpoint.
 * @param option object yang berisi fungsi untuk menjalankan delete
 * @returns express middleware yang digunakan untuk melakukan penghapusan object.
 */
export function deleteOne(option) {
  const requiredFunctions = ['init', 'deleteOne', 'fetchOne', 'filterFieldOne'];
  const { init, deleteOne, fetchOne, filterFieldOne } = crudUtil.fetchOptionFunctions(option, requiredFunctions);
  
  return async (req, res, next) => {
    const context = {};
    let fetchedObject = {};

    try {
      let object = await init(req, context);
      object = await fetchOne(object, context);
      if (object) {
        fetchedObject = object;
      }
      else {
        throw {status:404, cause: 'object not found'};
      }
      object = await deleteOne(object, context);
      object = await filterFieldOne(fetchedObject, context);
      res.status(202).json(object);
    } catch(err) {
      displayError(res, 'cannot delete object')(err);
    }
  };
}
