import { Schema, Model, Document, model } from 'mongoose'
import DivisionModel from '../division/divisionMongoModel'

let userSchema:Schema = new Schema({
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  division: {
    type: Schema.Types.ObjectId,
    ref: DivisionModel.modelName
  },
  enabled: {
    type: Boolean,
    required: true,
    default: true
  },
  admin: {
    type: Boolean,
    default: false
  }
})

let userModel: Model<Document> = model('user', userSchema)

export default userModel