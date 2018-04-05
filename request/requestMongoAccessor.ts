import { Schema, Model, Document, model } from 'mongoose'
import { MongoAccessor } from '../accessor/mongo'
import RequestAccessor from './requestAccessor'
import RequestMongoModel from './requestMongoModel'
import Request from './request'

export default class RequestMongoAccessor extends MongoAccessor<Request> implements RequestAccessor {
  constructor() {
    super(RequestMongoModel)
  }
}