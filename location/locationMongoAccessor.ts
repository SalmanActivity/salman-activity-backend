import { Schema, Model, Document, model } from 'mongoose'
import LocationAccessor from './locationAccessor'
import Location from './location'
import { MongoAccessor } from '../accessor/mongo'
import LocationModel from './locationMongoModel'

export default class LocationMongoAccessor extends MongoAccessor<Location> implements LocationAccessor {
  constructor() {
    super(LocationModel)
  }
}