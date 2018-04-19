import { Schema, Model, Document, model } from 'mongoose'
import { MongoAccessor, MongoDocumentSerializer } from '../accessor/mongo'
import ReportAccessor from './reportAccessor'
import ReportMongoModel from './reportMongoModel'
import Report from './report'
import { Request } from '../request'
import { RequestMongoDocumentSerializer } from '../request/requestMongoAccessor'
import { Photo, PhotoMongoAccessor, PhotoAccessor, PhotoMongoDocumentSerializer } from '../photo'

export class ReportMongoDocumentSerializer implements MongoDocumentSerializer<Report> {
  
  constructor(protected requestSerializer: MongoDocumentSerializer<Request> = new RequestMongoDocumentSerializer(),
              protected photoSerializer: MongoDocumentSerializer<Photo> = new PhotoMongoDocumentSerializer()) {
  }
  
  async serialize(mongoDocument: Document): Promise<Report> {
    if (!mongoDocument)
      return null

    mongoDocument = await mongoDocument.populate('request').populate('photo').execPopulate()

    let request:any = mongoDocument.get('request')
    if (request)
      request = await this.requestSerializer.serialize(request)

    let photo:any = mongoDocument.get('photo')
    if (photo)
      photo = await this.photoSerializer.serialize(photo)

    return {
      id: mongoDocument._id ? mongoDocument._id.toString() : undefined,
      issuedTime: mongoDocument.get('issuedTime'),
      request,
      content: mongoDocument.get('content'),
      photo
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
      photo: 'photo' in document ? await this.photoSerializer.deserialize(document.photo) : undefined
    }
  }
}


export default class ReportMongoAccessor extends MongoAccessor<Report> implements ReportAccessor {
  
  constructor(reportSerializer: MongoDocumentSerializer<Report> = new ReportMongoDocumentSerializer(),
              protected photoAccessor: PhotoAccessor = new PhotoMongoAccessor()) {
    super(ReportMongoModel, reportSerializer)
  }

  async getAllBetween(start:Date, end:Date):Promise<Report[]> {
    let condition = {
      'startTime': {
        '$gte': start,
        '$lt': end
      }
    }

    let result:Document[] = await this.mongoModel.find(condition).exec()
    let promiseList: Promise<Report>[] = result.map<Promise<Report>>((val, idx) => this.docSerializer.serialize(val))
    let itemArray: Report[] = await Promise.all(promiseList)
    return itemArray
  }

  async getByRequestId(requestId:string):Promise<Report> {
    let result: Document = await this.mongoModel.findOne({request: requestId}).exec()
    if (!result)
      return undefined
    let item: Report = await this.docSerializer.serialize(result)
    return item
  }

  async deleteAll(): Promise<void> {
    let allReports = await super.getAll()
    allReports = allReports.filter(report => report.photo)
    let promises = allReports.map(report => this.photoAccessor.delete(report.photo))
    await Promise.all(promises)
    await super.deleteAll()
  }

  async insert(object: Report): Promise<Report>{
    await this.photoAccessor.insert(object.photo)
    return await super.insert(object)
  }

  async update(object: Report): Promise<Report>{
    await this.photoAccessor.update(object.photo)
    return await super.update(object)
  }

}