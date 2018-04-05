import UserAccessor from './userAccessor'
import { MongoAccessor } from '../accessor/mongo'
import UserModel from './userMongoModel'
import User from './user'
import { Document } from 'mongoose'

export default class UserMongoAccessor extends MongoAccessor<User> implements UserAccessor {
  constructor() {
    super(UserModel)
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