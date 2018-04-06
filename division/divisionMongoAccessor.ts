import { Schema, Model, Document, model } from 'mongoose'
import DivisionAccessor from './divisionAccessor'
import Division from './division'
import { MongoAccessor, MongoDocumentSerializer } from '../accessor/mongo'
import DivisionModel from './divisionMongoModel'

export class DivisionMongoDocumentSerializer implements MongoDocumentSerializer<Division> {
  async serialize(mongoDocument: Document): Promise<Division> {
    if (!mongoDocument)
      return null
    return {
      id: mongoDocument._id ? mongoDocument._id.toString() : undefined,
      name: mongoDocument.get('name'),
      enabled: mongoDocument.get('enabled')
    }
  }
  async deserialize(document: Division): Promise<any> {
    if (!document)
      return null
    return {
      _id: document.id,
      name: document.name,
      enabled: document.enabled
    }
  }
}

export default class DivisionMongoAccessor extends MongoAccessor<Division> implements DivisionAccessor {
  constructor() {
    super(DivisionModel, new DivisionMongoDocumentSerializer())
  }
}