import { Schema, Model, Document, model } from 'mongoose';
import { MongoAccessor, MongoDocumentSerializer, MongoItem } from '../accessor/mongo';
import { RequestAccessor } from './requestAccessor';
import { RequestMongoModel } from './requestMongoModel';
import { Request } from './request';
import { User } from '../user';
import { Division } from '../division';
import { Location } from '../location';
import { UserMongoDocumentSerializer } from '../user/userMongoAccessor';
import { DivisionMongoDocumentSerializer } from '../division/divisionMongoAccessor';
import { LocationMongoDocumentSerializer } from '../location/locationMongoAccessor';

export class RequestMongoDocumentSerializer implements MongoDocumentSerializer<Request> {
  constructor(protected userSerializer:MongoDocumentSerializer<User> = new UserMongoDocumentSerializer(),
              protected divisionSerializer:MongoDocumentSerializer<Division> = new DivisionMongoDocumentSerializer(),
              protected locationSerializer:MongoDocumentSerializer<Location> = new LocationMongoDocumentSerializer()) {
  }
  async serialize(mongoDocument: Document): Promise<Request> {
    if (!mongoDocument) {
      return null;
    }

    mongoDocument = await mongoDocument.populate('division')
      .populate('issuer')
      .populate('location')
      .execPopulate();

    let division = mongoDocument.get('division');
    if (division) {
      division = await this.divisionSerializer.serialize(division);
    }

    let location = mongoDocument.get('location');
    if (location) {
      location = await this.locationSerializer.serialize(location);
    }

    let issuer = mongoDocument.get('issuer');
    if (issuer) {
      issuer = await this.userSerializer.serialize(issuer);
    }

    return {
      id: mongoDocument._id ? mongoDocument._id.toString() : undefined,
      name: mongoDocument.get('name'),
      description: mongoDocument.get('description'),
      personInCharge: mongoDocument.get('personInCharge'),
      phoneNumber: mongoDocument.get('phoneNumber'),
      issuer,
      issuedTime: mongoDocument.get('issuedTime'),
      division,
      location,
      startTime: mongoDocument.get('startTime'),
      endTime: mongoDocument.get('endTime'),
      participantNumber: mongoDocument.get('participantNumber'),
      participantDescription: mongoDocument.get('participantDescription'),
      speaker: mongoDocument.get('speaker'),
      target: mongoDocument.get('target'),
      status: mongoDocument.get('status'),
      enabled: mongoDocument.get('enabled'),
    };
  }
  async deserialize(document: Request): Promise<MongoItem> {
    if (!document) {
      return null;
    }

    return {
      _id: document.id,
      name: 'name' in document ? document.name : undefined,
      description: 'description' in document ? document.description : undefined,
      personInCharge: 'personInCharge' in document ? document.personInCharge : undefined,
      phoneNumber: 'phoneNumber' in document ? document.phoneNumber : undefined,
      issuer: 'issuer' in document ? await this.userSerializer.deserialize(document.issuer) : undefined,
      issuedTime: 'issuedTime' in document ? document.issuedTime : undefined,
      division: 'division' in document ? await this.divisionSerializer.deserialize(document.division) : undefined,
      location: 'location' in document ? await this.locationSerializer.deserialize(document.location) : undefined,
      startTime: 'startTime' in document ? document.startTime : undefined,
      endTime: 'endTime' in document ? document.endTime : undefined,
      participantNumber: 'participantNumber' in document ? document.participantNumber : undefined,
      participantDescription: 'participantDescription' in document ? document.participantDescription : undefined,
      speaker: 'speaker' in document ? document.speaker : undefined,
      target: 'target' in document ? document.target : undefined,
      status: 'status' in document ? document.status : undefined,
      enabled: 'enabled' in document ? document.enabled : undefined
    } as MongoItem;
  }
}

export class RequestMongoAccessor extends MongoAccessor<Request> implements RequestAccessor {
  constructor() {
    super(RequestMongoModel, new RequestMongoDocumentSerializer());
  }

  async getAllBetween(start:Date, end:Date):Promise<Request[]> {
    const condition = {
      'startTime': {
        '$gte': start,
        '$lt': end
      }
    };

    const result:Document[] = await this.mongoModel.find(condition).exec();
    const promiseList:Array<Promise<Request>> = result.map<Promise<Request>>((val, idx) => this.docSerializer.serialize(val));
    const itemArray:Request[] = await Promise.all(promiseList);
    return itemArray;
  }
}
