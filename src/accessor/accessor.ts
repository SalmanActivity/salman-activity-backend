import { Item } from './item';

/**
 * Accessor mendefinisikan kelas yang digunakan untuk menyimpan dan mendapatkan object. Interface ini
 * umumnya digunakan untuk menyimpan object ke database. Object ini memberikan abstraksi penyimpanan object
 * sehingga mudah untuk melakukan unit testing. T pada kelas ini mengacu pada tipe object yang ingin disimpan.
 * Object yang dapat ditangani oleh kelas ini harus merupakan turunan dari kelas Item sehingga setiap object
 * memiliki attribut id.
 */
export interface Accessor<T extends Item> {

  /**
   * Method ini digunakan untuk mendapatkan seluruh object yang ada. Perhatikan bahwa object yang didapatkan
   * adalah semua object. Hati-hati menggunakan kelas ini karena bisa saja hasilnya sangat besar.
   */
  getAll(): Promise<T[]>;

  /**
   * Method ini digunakan untuk mendapatkan object tertentu yang memiliki id sesuai parameter.
   * @param id id dari object yang ingin didapatkan.
   */
  getById(id:string): Promise<T>;

  /**
   * Method ini digunakan untuk memasukkan object baru ke penyimpanan. Method ini dapat memberikan error
   * tergantung implementasi. Object yang tidak memiliki id juga dapat memberikan error tergantung implementasi.
   * @param object object yang ingin disimpan.
   */
  insert(object: T): Promise<T>;

  /**
   * Method ini digunakan untuk menghapus seluruh object atau document yang ada pada penyimpanan.
   */
  deleteAll(): Promise<void>;

  /**
   * Method ini digunakan untuk menghapus object tertentu dari penyimpanan.
   * @param object object yang ingin dihapus.
   */
  delete(object: T): Promise<T>;

  /**
   * Method ini digunakan untuk mengubah object yang sudah ada di penyimpanan. Paramter dari method ini mendefinisikan
   * object baru yang akan disimpan untuk menggantikan object lama. Object lama diidentifikasi dengan id-nya.
   * @param object object yang ingin diupdate.
   */
  update(object: T): Promise<T>;

}