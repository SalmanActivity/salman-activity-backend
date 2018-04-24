import { Schema, Model, Document, model } from 'mongoose';
import { LocationAccessor } from './locationAccessor';
import { Location } from './location';
import { MongoAccessor, MongoDocumentSerializer, MongoItem } from '../accessor/mongo';
import { LocationMongoModel } from './locationMongoModel';

export class LocationMongoDocumentSerializer implements MongoDocumentSerializer<Location> {
  async serialize(mongoDocument: Document): Promise<Location> {
    if (!mongoDocument) {
      return null;
    }
    return {
      id: mongoDocument._id ? mongoDocument._id.toString() : undefined,
      name: mongoDocument.get('name'),
      enabled: mongoDocument.get('enabled')
    };
  }
  async deserialize(document: Location): Promise<MongoItem> {
    if (!document) {
      return null;
    }
    return {
      _id: document.id,
      name: document.name,
      enabled: document.enabled
    } as MongoItem;
  }
}

export class LocationMongoAccessor extends MongoAccessor<Location> implements LocationAccessor {
  constructor() {
    super(LocationMongoModel, new LocationMongoDocumentSerializer());
  }
}