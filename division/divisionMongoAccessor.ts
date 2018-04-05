import { Schema, Model, Document, model } from 'mongoose'
import DivisionAccessor from './divisionAccessor'
import Division from './division'
import { MongoAccessor } from '../accessor/mongo'
import DivisionModel from './divisionMongoModel'

export default class DivisionMongoAccessor extends MongoAccessor<Division> implements DivisionAccessor {
  constructor() {
    super(DivisionModel)
  }
}