import Accessor from "../accessor"
import { Model, Document, Types } from "mongoose"
import MongoDocumentSerializer from "./mongoDocumentSerializer"
import Item from '../item'

class DefaultMongoDocumentSerializer<T> implements MongoDocumentSerializer<T> {

  async serialize(mongoDocument: Document): Promise<T> {
    let result:T
    for (let key in mongoDocument) {
      if (result[key] instanceof Types.ObjectId)
        mongoDocument.populate(key)
      if (key != '_id')
        result[key] = mongoDocument[key]
    }
    result['id'] = mongoDocument._id
    return result
  }

}

export default class MongoAccessor<T extends Item> implements Accessor<T> {

  constructor(public mongoModel: Model<Document>,
              protected docSerializer: MongoDocumentSerializer<T> = new DefaultMongoDocumentSerializer<T>()) {
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
    let itemModel = new this.mongoModel(object)
    if (object.id)
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
      document = await document.set(object).save()
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