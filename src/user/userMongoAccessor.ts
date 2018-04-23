import UserAccessor from './userAccessor';
import { MongoAccessor, MongoDocumentSerializer } from '../accessor/mongo';
import UserModel from './userMongoModel';
import User from './user';
import { Document } from 'mongoose';
import { Division } from '../division';
import { DivisionMongoDocumentSerializer } from '../division/divisionMongoAccessor';

export class UserMongoDocumentSerializer implements MongoDocumentSerializer<User> {
  constructor(protected divisionSerializer:MongoDocumentSerializer<Division> = new DivisionMongoDocumentSerializer()) {
  }
  async serialize(mongoDocument: Document): Promise<User> {
    if (!mongoDocument) {
      return null;
    }
    
    await mongoDocument.populate('division').execPopulate();
    let division:any = mongoDocument.get('division');
    if (division) {
      division = await this.divisionSerializer.serialize(division);
    }

    return {
      id: mongoDocument._id ? mongoDocument._id.toString() : undefined,
      name: mongoDocument.get('name'),
      username: mongoDocument.get('username'),
      email: mongoDocument.get('email'),
      password: mongoDocument.get('password'),
      division,
      enabled: mongoDocument.get('enabled'),
      admin: mongoDocument.get('admin'),
    };
  }
  async deserialize(document: User): Promise<any> {
    if (!document) {
      return null;
    }
    
    return {
      _id: document.id,
      name: 'name' in document ? document.name : undefined,
      username: 'username' in document ? document.username : undefined,
      email: 'email' in document ? document.email : undefined,
      password: 'password' in document ? document.password : undefined,
      division: 'division' in document ? await this.divisionSerializer.deserialize(document.division) : undefined,
      enabled: 'enabled' in document ? document.enabled : undefined,
      admin: 'admin' in document ? document.admin : undefined
    };
  }
}

export default class UserMongoAccessor extends MongoAccessor<User> implements UserAccessor {
  constructor() {
    super(UserModel, new UserMongoDocumentSerializer());
  }

  async getByUsername(username: string): Promise<User> {
    const result:Document = await this.mongoModel.findOne({username}).exec();
    if (!result) {
      return undefined;
    }
    const item:User = await this.docSerializer.serialize(result);
    return item;
  }

  async getByEmail(email:string):Promise<User> {
    const result:Document = await this.mongoModel.findOne({email}).exec();
    if (!result) {
      return undefined;
    }
    const item:User = await this.docSerializer.serialize(result);
    return item;
  }
}