import { Schema, Model, Document, model } from 'mongoose'
import LocationAccessor from './locationAccessor'
import Location from './location'
import { MongoAccessor, MongoDocumentSerializer } from '../accessor/mongo'
import LocationModel from './locationMongoModel'

export class LocationMongoDocumentSerializer implements MongoDocumentSerializer<Location> {
  async serialize(mongoDocument: Document): Promise<Location> {
    return {
      id: mongoDocument._id ? mongoDocument._id.toString() : undefined,
      name: mongoDocument.get('name'),
      enabled: mongoDocument.get('enabled')
    }
  }
  async deserialize(document: Location): Promise<any> {
    return {
      _id: document.id,
      name: document.name,
      enabled: document.enabled
    }
  }
}

export default class LocationMongoAccessor extends MongoAccessor<Location> implements LocationAccessor {
  constructor() {
    super(LocationModel, new LocationMongoDocumentSerializer())
  }
}