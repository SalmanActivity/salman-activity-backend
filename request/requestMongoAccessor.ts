import { Schema, Model, Document, model } from 'mongoose'
import { MongoAccessor } from '../accessor/mongo'
import RequestAccessor from './requestAccessor'
import RequestMongoModel from './requestMongoModel'
import Request from './request'

export default class RequestMongoAccessor extends MongoAccessor<Request> implements RequestAccessor {
  async getAllBetween(start:Date, end:Date):Promise<Request[]> {

    let condition = {
      'startTime': {
        '$gte': start,
        '$lt': end
      }
    }

    let result:Document[] = await this.mongoModel.find(condition).exec()
    let promiseList:Promise<Request>[] = result.map<Promise<Request>>((val, idx) => this.docSerializer.serialize(val))
    let itemArray:Request[] = await Promise.all(promiseList)
    return itemArray
  }
  
  constructor() {
    super(RequestMongoModel)
  }
}