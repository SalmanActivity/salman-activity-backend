import { Schema, Model, Document, model } from 'mongoose'
import { RequestMongoModel } from '../request'



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
    type: String,
    required: true
  }

})

let reportModel: Model<Document> = model('report', reportSchema)

export default reportModel
