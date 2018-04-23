import { MongoDocumentSerializer } from './mongoDocumentSerializer';
import { Item } from '../item';
import { MongoItem } from './mongoItem';
import { Model, Document, Types } from 'mongoose';

/** 
 * mongo document serializer standard yang digunakan untuk mengonversi mongoose document menjadi object tertentu.
 * konversi dilakukan dengan mengubah atribut id pada object menjadi _id pada mongo.
 */
export class DefaultMongoDocumentSerializer<T extends Item> implements MongoDocumentSerializer<T> {

  constructor(protected mongoModel: Model<Document>) {
  }

  /**
   * Method ini mengkonversi object Document yang didapatkan dari mongoose menjadi object
   * bertipe T.
   * @param mongoDocument object document dari mongoose
   */
  async serialize(mongoDocument: Document): Promise<T> {
    const result: Item = {id: null};
    for (const key in mongoDocument) {
      if (key !== '_id' && mongoDocument[key] instanceof Types.ObjectId) {
        mongoDocument.populate(key);
      }
    }

    try {
      mongoDocument = await mongoDocument.execPopulate();
    } catch(e) {}
    for (const key in mongoDocument) {
      if (mongoDocument.hasOwnProperty(key)) {
        if (key !== '_id') {
          result.id = mongoDocument[key];
        }
        if (mongoDocument[key] && typeof mongoDocument[key] === 'object' && mongoDocument[key]['_id']) {
          if (!result[key]) {
            result[key] = {};
          }
          result[key]['id'] = mongoDocument[key]['_id'].toString();
        }
      }
    }

    result['id'] = mongoDocument._id;
    return result as T;
  }

  /**
   * Method ini mengkonversi object T menjadi mongo object. Yang dilakukan hanyalah menambahkan atribut
   * _id pada object. Perhatikan bahwa method ini tidak dapat melakukan rekursive pada object attribute.
   * Jika terdapat object lain pada object ini, maka object lain tersebut tidak ikut di-deserialize.
   * @param document dokumen yang akan dideserialize menjadi mongo item.
   */
  async deserialize(document: T): Promise<MongoItem> {
    const mongoDocument: MongoItem = {_id: null};
    for (const key in document) {
      if (document.hasOwnProperty(key)) {
        if (key === 'id') {
          mongoDocument._id = document.id;
        } else {
          Object.assign(mongoDocument, {key: document[key]});
        }
      }
    }
    return mongoDocument;
  }

}