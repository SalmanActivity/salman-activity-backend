import { Document } from 'mongoose';
import { Item } from '../item';
import { MongoItem } from './mongoItem';

/**
 * Interface ini menyatakan suatu standar yang digunakan oleh kelas mongo accessor untuk mengubah object
 * mongo menjadi object yang didefinisikan oleh user. Kelas ini dapat dikatakan menggunakan adapter pattern
 * yang mengubah object dari mongo menjadi object yang dibutuhkan user.
 */
export interface MongoDocumentSerializer<T extends Item> {

  /**
   * Method ini mengubah object mongo menjadi object yang didefinisikan user.
   * @param mongoDocument dokumen mongo yang ingin diubah
   */
  serialize(mongoDocument: Document): Promise<T>;

  /**
   * Method ini mengubah object user menjadi object mongo item yang digunakan oleh mongoose.
   * @param document user document yang ingin diubah menjadi mongo document.
   */
  deserialize(document: T): Promise<MongoItem>;

}