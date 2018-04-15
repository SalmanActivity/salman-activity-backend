import { Schema, Model, Document, model } from 'mongoose'
import { RequestMongoModel } from '../request'
import { UserMongoModel } from '../user'
import { DivisionMongoModel } from '../division'


let reportSchema:Schema = new Schema({
  image: {
    type: Buffer,
    required: true
  },
  description: {
    type: String,
    required: true
  },
   reporter: {
    type: Schema.Types.ObjectId,
    ref: UserMongoModel.modelName,
    required: true
  },
   division: {
    type: Schema.Types.ObjectId,
    ref: DivisionMongoModel.modelName,
    required: true
  },
  request: {
    type: Schema.Types.ObjectId,
    ref: RequestMongoModel.modelName,
    required: true
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
  }
})

let reportModel: Model<Document> = model('report', reportSchema)

export default reportModel
