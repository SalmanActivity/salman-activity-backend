import { Accessor } from '../accessor';
import { Model, Document, Types } from 'mongoose';
import { MongoDocumentSerializer } from './mongoDocumentSerializer';
import { DefaultMongoDocumentSerializer } from './defaultMongoDocumentSerializer';
import { Item } from '../item';

/** 
 * Implementasi dari interface accessor. Implementasi yang dilakukan menggunakan library mongoose. Kelas ini
 * pada dasarnya berperan sebagai wrapper pada library mongoose. Kelas ini dapat digunakan dengan memanggil
 * konstruktor dengan parameter model mongo dan serializer.
 */
export class MongoAccessor<T extends Item> implements Accessor<T> {

  constructor(public mongoModel: Model<Document>,
              protected docSerializer: MongoDocumentSerializer<T> = new DefaultMongoDocumentSerializer<T>(mongoModel)) {
  }

  /**
   * Mendapatkan seluruh document yang ada di database. dilakukan dengan menggunakan fungsi find pada mongoose dengan
   * criteria {}
   */
  async getAll(): Promise<T[]> {
    const result:Document[] = await this.mongoModel.find({}).exec();
    const promiseList:Array<Promise<T>> = result.map<Promise<T>>((val, idx) => this.docSerializer.serialize(val));
    const itemArray:T[] = await Promise.all(promiseList);
    return itemArray;
  }

  /**
   * Mendapatkan document dari mongoose. Dilakukan dengan menggunakan fungsi findById pada mongoose.
   * @param id id dari document yang ingin didapatkan.
   */
  async getById(id: string): Promise<T> {
    const objectId = this.toObjectId(id);
    const result:Document = await this.mongoModel.findById(objectId).exec();
    if (!result) {
      return undefined;
    }
    
    const item:T = await this.docSerializer.serialize(result);
    return item;
  }

  /**
   * Digunakan untuk menyimpan document baru ke dalam mongo databse. Fungsi ini akan mengubah object yang dimasukkan
   * menjadi bentuk mongo document dengan menggunakan serializer. Document kemudian disimpan ke mongo dataabase
   * dengan menggunakan fungsi save pada mongoose.
   * @param object object yang ingin disimpan
   */
  async insert(object: T): Promise<T> {
    const deserializedObject = await this.docSerializer.deserialize(object);
    const itemModel = new this.mongoModel(deserializedObject);
    if (!itemModel._id && object.id) {
      itemModel._id = object.id;
    }
    const doc = await itemModel.save();
    return this.docSerializer.serialize(doc);
  }

  /**
   * Digunakan untuk menghapus seluruh documents pada mongo database. Diimplementasikan dengan menggunakan fungsi
   * deleteMany pada library mongoose. 
   */
  async deleteAll(): Promise<void> {
    await this.mongoModel.deleteMany({}).exec();
  }

  /**
   * Digunakan untuk menghapus object tertentu dari mongo database. Object diidentifikasi dengan id dari parameter.
   * @param object object yang ingin dihapus.
   */
  async delete(object: T): Promise<T> {
    return await this.mongoModel.deleteOne({_id:object.id}).exec();
  }

  /**
   * Digunakan untuk mengupdate object pada mongo databse. Parameter merupakan object yang akan digunakan untuk
   * menggantikan object lama. Object lama diidentifikasi dari atribut id pada parameter.
   * @param object object yang ingin diupdate.
   */
  async update(object: T): Promise<T> {
    let document: Document = await this.mongoModel.findById(object.id).exec();
    if (document) {
      const newDocument = await this.docSerializer.deserialize(object);
      document = await document.set(newDocument).save();
      return this.docSerializer.serialize(document);
    } else {
      throw new Error('Document not found');
    }
  }

  /**
   * Fungsi ini mengonversi string menjadi ObjectId mongoose. Jika string tidak sesuai format object id (24 character
   * string hexadesimal), maka fungsi akan mengembalikan object id 0.
   * @param id id object dalam bentuk string
   */
  private toObjectId(id: string): Types.ObjectId {
    try {
      return new Types.ObjectId(id);
    } catch (e) {
      return new Types.ObjectId("000000000000000000000000");
    }
  }

}