import { Schema, Model, Document, model } from 'mongoose'
import { UserMongoModel } from '../user'
import { LocationMongoModel } from '../location'
import { DivisionMongoModel } from '../division'

let requestSchema:Schema = new Schema({
  name: {
    type: String,
    maxlength: 256,
    required: true
  },
  description: {
    type: String,
    maxlength: 1024,
  },
  personInCharge: {
    type: String,
    maxlength: 256,
    required: true
  },
  phoneNumber: {
    type: String,
    maxlength: 50,
    required: true
  },
  issuer: {
    type: Schema.Types.ObjectId,
    ref: UserMongoModel.modelName,
    required: true
  },
  issuedTime: {
    type: Date,
    required: true,
  },
  division: {
    type: Schema.Types.ObjectId,
    ref: DivisionMongoModel.modelName,
    required: true
  },
  location: {
    type: Schema.Types.ObjectId,
    ref: LocationMongoModel.modelName,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  participantNumber: {
    type: Number,
    required: false
  },
  participantDescription: {
    type: String,
    maxlength: 1024,
    required: false
  },
  speaker: {
    type: String,
    maxlength: 512,
    required: false
  },
  target: {
    type: String,
    maxlength: 1024,
    required: false
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    required: true,
    default: 'pending'
  },
  enabled: {
    type: Boolean,
    required: true,
    default: true
  },
})

let requestModel: Model<Document> = model('request', requestSchema)

export default requestModel
