import * as async from 'async';
import * as util from 'util';

/**
 * Fungsi ini akan mengubah one fungsi yang dimasukkan dalam parameter menjadi many function. Contoh fungsi one adalah
 * fungsi untuk memfilter object seperti berikut:
 * ```
 * async filterObject(object) => {
 *  return object.id < 10 ? object : null
 * }
 * ```
 * fungsi tersebut menerima sebuah object dan mengembalikan sebuah object. Jika fungsi tersebut dimasukkan kedalam
 * parameter fungsi oneToManyFunction maka, fungsi tersebut akan menjadi ekivalen dengan fungsi berikut:
 * ```
 * async filterObjectMany(objectArray) => {
 *  return objectArray.map(obj => filterObject(obj)).filter(obj => obj)
 * }
 * ```
 * @param oneFunction fungsi yang akan diubah menjadi many function.
 */
export function oneToManyFunction(oneFunction) {
  return async <T>(valArr, context): Promise<T[]> => {
    const parallelArr = valArr.map(val => oneFunction(val, context));
    const results = await Promise.all(parallelArr);
    const resultArr = [];
    for (let i = 0; i < valArr.length; i++) {
      if (results[i]) {
        resultArr.push(results[i]);
      }
    }
    return resultArr;
  };
}

/**
 * Fungsi ini akan mengubah many function menjadi one function.
 * @param oneFunction fungsi yang akan diubah menjadi one function.
 */
export function manyToOneFunction(manyFunction) {
  return async <T>(result, context): Promise<T> => {
    const res = await manyFunction([result], context);
    return result && result.length > 0 ? result[0] : null;
  };
}

/**
 * Fungsi ini digunakan untuk membuat fungsi filter berdasarkan nama attribute. Fungsi filter merupakan fungsi yang
 * digunakan untuk memfilter attribute dari suatu object. Misalnya untuk untuk menampilkan pengguna yang ada pada
 * suatu server, attribute password tidak relevan untuk ditampilkan, fungsi ini akan menghapus attribute password
 * tersebut sebelum ditampilkan. Contoh fungsi filter yang menghapus attribute password adalah sebagai berikut:
 * ```
 * async filterPassword(object) {
 *  delete object['passsword']
 *  return object
 * }
 * ```
 * Fungsi simpleFilterFieldOne akan menciptakan fungsi seperti diatas. Attribute yang dapat difilter tidak hanya password
 * saja melainkan dapat ditentukan oleh developer. Parameter fungsi ini merupakan array yang menyatakan whitelist attribute
 * yang ingin ditampilkan. Contohnya: `simpleFilterFieldOne(['id','name','division.id','division.name'])` akan menciptakan
 * fungsi yang memfilter semua attribute dari object selain attribute `id`, `name`, `division.id`, dan `division.name`.
 * @param fieldArr attribute yang ingin dipertahankan setelah fungsi yang dihasilkan dipanggil.
 */
export function simpleFilterFieldOne(fieldArr) {
  return async <T>(obj, context): Promise<T> => {
    const newObj = {};

    for (const key of fieldArr) {
      const paths = key.split('.');
      let newObjRecurse = newObj;
      let objRecurse = obj;
      let exists = true;
      for (const idx of paths.slice(0,-1)) {
        if (!objRecurse || !(idx in objRecurse)) {
          exists = false;
          break;
        }
        objRecurse = objRecurse[idx];

        if (!(idx in newObjRecurse)) {
          newObjRecurse[idx] = {};
        }
        newObjRecurse = newObjRecurse[idx];
      }
      if (!exists) {
        continue;
      }
      const localKey = paths[paths.length - 1];
      if (objRecurse && localKey in objRecurse) {
        newObjRecurse[localKey] = objRecurse[localKey];
      }
    }

    return newObj as T;
  };
}

/**
 * Digunakan untuk mendapatkan fungsi default jika pengguna tidak menspesifikasi fungsi yang dibutuhkan oleh endpoint.
 * @param func nama fungsi yang ingin didapatkan.
 */
export function defaultFunction(func) {
  const init = async (req, context) => req;

  const deleteOne = async (item, context) => item;

  const fetchOne = async (item, context) => item;

  const filterOne = async (item, context) => item;

  const convertOne = async (item, context) => item;

  const filterFieldOne = async (item, context) => item;

  const deleteMany = oneToManyFunction(deleteOne); 

  const fetchMany = oneToManyFunction(fetchOne);

  const filterMany = oneToManyFunction(filterOne);

  const convertMany = oneToManyFunction(convertOne);

  const filterFieldMany = oneToManyFunction(filterFieldOne);

  const defaultFunctions = {
    init, deleteOne, fetchOne, filterOne, convertOne, filterFieldOne,
    deleteMany, fetchMany, filterMany, convertMany, filterFieldMany
  };

  return defaultFunctions[func];
}

/**
 * Fungsi ini digunakan untuk mendapatkan fungsi-fungsi yang dibutuhkan developer dari object option. Jika developer
 * membutuhkan fungsi one misalnya filterOne akan tetapi object option hanya memiliki many function misalnya filterMany,
 * maka fungsi ini akan mengubah fungsi filterOne menjadi filterMany menggunakan fungsi manyToOneFunction.
 * @param option object option yang diberikan oleh developer.
 * @param functionNeeded fungsi-fungsi yang dibutuhkan.
 */
export function fetchOptionFunctions<T>(option:T[], functionNeeded:string[]): T {
  const result = {};
  for (const func of functionNeeded) {
    if (option[func]) {
      result[func] = option[func];
    } else if (func.substr(-3) === 'One') {
      const functionMany = func.substr(0, func.length - 3) + 'Many';
      if (option[functionMany]) {
        result[func] = manyToOneFunction(option[functionMany]);
      } else {
        result[func] = defaultFunction(func);
      }
    } else if (func.substr(-4) === 'Many') {
      const functionOne = func.substr(0, func.length - 4) + 'One';
      if (option[functionOne]) {
        result[func] = oneToManyFunction(option[functionOne]);
      } else {
        result[func] = defaultFunction(func);
      }
    } else {
      result[func] = defaultFunction(func);
    }
  }

  return result as T;
}
