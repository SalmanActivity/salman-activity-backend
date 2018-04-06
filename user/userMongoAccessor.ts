import UserAccessor from './userAccessor'
import { MongoAccessor, MongoDocumentSerializer } from '../accessor/mongo'
import UserModel from './userMongoModel'
import User from './user'
import { Document } from 'mongoose'
import { Division, DivisionMongoDocumentSerializer } from '../division'

export class UserMongoDocumentSerializer implements MongoDocumentSerializer<User> {
  constructor(protected divisionSerializer:MongoDocumentSerializer<Division> = new DivisionMongoDocumentSerializer()) {
  }
  async serialize(mongoDocument: Document): Promise<User> {
    await mongoDocument.populate('division').execPopulate()
    let division:any = mongoDocument.get('division')
    if (division)
      division = this.divisionSerializer.serialize(division)

    return {
      id: mongoDocument._id ? mongoDocument._id.toString() : undefined,
      name: mongoDocument['name'] ? mongoDocument.get('name') : undefined,
      username: mongoDocument['username'] ? mongoDocument.get('username') : undefined,
      email: mongoDocument['email'] ? mongoDocument.get('email') : undefined,
      password: mongoDocument['password'] ? mongoDocument.get('password') : undefined,
      division,
      enabled: mongoDocument['enabled'] ? mongoDocument.get('enabled') : undefined,
      admin: mongoDocument['admin'] ? mongoDocument.get('admin') : undefined,
    }
  }
  async deserialize(document: User): Promise<any> {
    return {
      _id: document.id,
      name: document.name ? document.name : undefined,
      username: document.username ? document.username : undefined,
      email: document.email ? document.email : undefined,
      password: document.password ? document.password : undefined,
      division: document.division ? this.divisionSerializer.deserialize(document.division) : undefined,
      enabled: document.enabled ? document.enabled : undefined,
      admin: document.admin ? document.admin : undefined
    }
  }
}

export default class UserMongoAccessor extends MongoAccessor<User> implements UserAccessor {
  constructor() {
    super(UserModel, new UserMongoDocumentSerializer())
  }

  async getByUsername(username: string): Promise<User> {
    let result:Document = await this.mongoModel.findOne({username}).exec()
    if (!result)
      return undefined
    let item:User = await this.docSerializer.serialize(result)
    return item
  }

  async getByEmail(email:string):Promise<User> {
    let result:Document = await this.mongoModel.findOne({email}).exec()
    if (!result)
      return undefined
    let item:User = await this.docSerializer.serialize(result)
    return item
  }
}