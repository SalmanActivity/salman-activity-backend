import { Schema, Model, Document, model } from 'mongoose'
import { MongoAccessor, MongoDocumentSerializer } from '../accessor/mongo'
import ReportAccessor from './reportAccessor'
import ReportMongoModel from './reportMongoModel'
import Report from './report'
import { Request } from '../request'
import { RequestMongoDocumentSerializer } from '../request/requestMongoAccessor'


export class ReportMongoDocumentSerializer implements MongoDocumentSerializer<Report> {
  constructor(protected requestSerializer:MongoDocumentSerializer<Request> = new RequestMongoDocumentSerializer()) {
  }
async serialize(mongoDocument: Document): Promise<Report> {
    if (!mongoDocument)
      return null

    mongoDocument = await mongoDocument.populate('request')
      .execPopulate()

    let request:any = mongoDocument.get('request')
    if (request)
      request = await this.requestSerializer.serialize(request)

    return {
      id: mongoDocument._id ? mongoDocument._id.toString() : undefined,
      issuedTime: mongoDocument.get('issuedTime'),
      request,
      content: mongoDocument.get('content'),
      photo: mongoDocument.get('photo')
    }
  }
  async deserialize(document: Report): Promise<any> {
    if (!document)
      return null
    
    return {
      _id: document.id,
      issuedTime: 'issuedTime' in document ? document.issuedTime : undefined,
      request: 'request' in document ? await this.requestSerializer.deserialize(document.request) : undefined,
      content: 'content' in document ? document.content : undefined,
      photo: 'photo' in document ? document.photo : undefined
    }
  }
}


export default class ReportMongoAccessor extends MongoAccessor<Report> implements ReportAccessor {
  constructor() {
    super(ReportMongoModel, new ReportMongoDocumentSerializer())
  }


  async getAllBetween(start:Date, end:Date):Promise<Report[]> {
    let condition = {
      'startTime': {
        '$gte': start,
        '$lt': end
      }
    }

    let result:Document[] = await this.mongoModel.find(condition).exec()
    let promiseList:Promise<Report>[] = result.map<Promise<Report>>((val, idx) => this.docSerializer.serialize(val))
    let itemArray:Report[] = await Promise.all(promiseList)
    return itemArray
  }

  async getByRequest(request:string):Promise<Report> {
    let result:Document = await this.mongoModel.findOne({request}).exec()
    if (!result)
      return undefined
    let item:Report = await this.docSerializer.serialize(result)
    return item
  }

}