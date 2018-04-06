import Accessor from '../accessor'
import { Model, Document, Types } from 'mongoose'
import MongoDocumentSerializer from './mongoDocumentSerializer'
import Item from '../item'

class DefaultMongoDocumentSerializer<T> implements MongoDocumentSerializer<T> {

  constructor(protected mongoModel: Model<Document>) {
  }

  async serialize(mongoDocument: Document): Promise<T> {
    let result:any = {}
    for (let key in mongoDocument)
      if (key !== '_id' && mongoDocument[key] instanceof Types.ObjectId)
        mongoDocument.populate(key)
    try {
      mongoDocument = await mongoDocument.execPopulate()
    } catch(e) {}
    for (let key in mongoDocument) {
      if (key != '_id')
        result[key] = mongoDocument[key]
      if (mongoDocument[key] && typeof mongoDocument[key] === 'object' && mongoDocument[key]['_id']) {
        if (!result[key])
          result[key] = {}
        result[key]['id'] = mongoDocument[key]['_id'].toString()
      }
    }
    result['id'] = mongoDocument._id
    return result
  }

  async deserialize(document: T): Promise<any> {
    let mongoDocument:any = {}
    for (let key in document) {
      if (key === 'id')
        mongoDocument['_id'] = document[key]
      else if (document[key] && typeof document[key] === 'object' && document[key]['id'])
        mongoDocument[key] = document[key]['id']
      else
        mongoDocument[key] = document[key]
    }
    return mongoDocument
  }

}

export default class MongoAccessor<T extends Item> implements Accessor<T> {

  constructor(public mongoModel: Model<Document>,
              protected docSerializer: MongoDocumentSerializer<T> = new DefaultMongoDocumentSerializer<T>(mongoModel)) {
  }

  async getAll(): Promise<T[]> {
    let result:Document[] = await this.mongoModel.find({}).exec()
    let promiseList:Promise<T>[] = result.map<Promise<T>>((val, idx) => this.docSerializer.serialize(val))
    let itemArray:T[] = await Promise.all(promiseList)
    return itemArray
  }

  async getById(id: string): Promise<T> {
    let objectId = this.toObjectId(id)
    let result:Document = await this.mongoModel.findById(objectId).exec()
    if (!result)
      return undefined
    
    let item:T = await this.docSerializer.serialize(result)
    return item
  }

  async insert(object: T): Promise<T> {
    let deserializedObject = await this.docSerializer.deserialize(object)
    let itemModel = new this.mongoModel(deserializedObject)
    if (!itemModel._id && object.id)
      itemModel._id = object.id
    let doc = await itemModel.save()
    return this.docSerializer.serialize(doc)
  }

  async deleteAll(): Promise<void> {
    await this.mongoModel.deleteMany({}).exec()
  }

  async delete(object: T): Promise<T> {
    return await this.mongoModel.deleteOne({_id:object.id}).exec()
  }

  async update(object: T): Promise<T> {
    let document: Document = await this.mongoModel.findById(object.id).exec()
    if (document) {
      let newDocument = await this.docSerializer.deserialize(object)
      document = await document.set(newDocument).save()
      return this.docSerializer.serialize(document)
    } else
      throw new Error('Document not found')
  }

  private toObjectId(id: string):Types.ObjectId {
    try {
      return new Types.ObjectId(id)
    } catch (e) {
      return new Types.ObjectId("000000000000000000000000")
    }
  }

}