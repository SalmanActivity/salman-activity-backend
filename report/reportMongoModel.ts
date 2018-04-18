import { Schema, Model, Document, model } from 'mongoose'
import { RequestMongoModel } from '../request'
import { PhotoMongoModel } from '../photo'

let reportSchema:Schema = new Schema({
  issuedTime: {
    type: Date,
    required: true,
  },
  request: {
    type: Schema.Types.ObjectId,
    ref: RequestMongoModel.modelName,
    required: true
  },
  content: {
    type: String,
    required: true
  }, 
  photo: {
    type: Schema.Types.ObjectId,
    ref: PhotoMongoModel.modelName,
    required: true
  }
})

let reportModel: Model<Document> = model('report', reportSchema)

export default reportModel
