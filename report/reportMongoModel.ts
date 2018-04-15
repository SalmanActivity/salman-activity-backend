import { Schema, Model, Document, model } from 'mongoose'
import { RequestMongoModel } from '../request'


let reportSchema:Schema = new Schema({
  image: {
    type: Buffer,
    required: true
  },
  description: {
    type: String,
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
