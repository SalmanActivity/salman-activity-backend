import { Schema, Model, Document, model } from 'mongoose'
import { MongoAccessor, MongoDocumentSerializer } from '../accessor/mongo'
import ReportAccessor from './reportAccessor'
import ReportMongoModel from './reportMongoModel'
import Report from './report'
import { User } from '../user'
import { UserMongoDocumentSerializer } from '../user/userMongoAccessor'
import { Division } from '../division'
import { DivisionMongoDocumentSerializer } from '../division/divisionMongoAccessor'
import { Request } from '../request'
import { RequestMongoDocumentSerializer } from '../request/requestMongoAccessor'


export class ReportMongoDocumentSerializer implements MongoDocumentSerializer<Report> {
  constructor(protected userSerializer:MongoDocumentSerializer<User> = new UserMongoDocumentSerializer(),
              protected divisionSerializer:MongoDocumentSerializer<Division> = new DivisionMongoDocumentSerializer(),
              protected requestSerializer:MongoDocumentSerializer<Request> = new LocationMongoDocumentSerializer()) {
  }
async serialize(mongoDocument: Document): Promise<Report> {
    if (!mongoDocument)
      return null

    mongoDocument = await mongoDocument.populate('division')
      .populate('reporter')
      .populate('request')
      .execPopulate()

    let reporter:any = mongoDocument.get('reporter')
    if (reporter)
      reporter = await this.userSerializer.serialize(reporter)

    let division:any = mongoDocument.get('division')
    if (division)
      division = await this.divisionSerializer.serialize(division)

    let Request:any = mongoDocument.get('Request')
    if (Request)
      Request = await this.requestSerializer.serialize(Request)

    return {
      id: mongoDocument._id ? mongoDocument._id.toString() : undefined,
      image: mongoDocument.get('image'),
      description: mongoDocument.get('description'),
      reporter,
      division,
      reportTime : mongoDocument.get('reportTime'),
      request,
      status: mongoDocument.get('status'),
      enabled: mongoDocument.get('enabled')
    }
  }
  async deserialize(document: Report): Promise<any> {
    if (!document)
      return null
    
    return {
      _id: document.id,
      image: 'image' in document ? document.image : undefined,
      description: 'description' in document ? document.description : undefined,
      reporter: 'reporter' in document ? await this.userSerializer.deserialize(document.reporter) : undefined,
      division: 'division' in document ? await this.divisionSerializer.deserialize(document.division) : undefined,
      reportTime: 'reportTime' in document ? document.reportTime : undefined,
      request: 'request' in document ? await this.requestSerializer.deserialize(document.request) : undefined,
      status: 'status' in document ? document.status : undefined,
      enabled: 'enabled' in document ? document.enabled : undefined
    }
  }
}


export default class ReportMongoAccessor extends MongoAccessor<Report> implements ReportAccessor {
  constructor() {
    super(ReportModel, new ReportMongoDocumentSerializer())
  }

	async getAllBetween(start:Date, end:Date):Promise<Request[]> {
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

}