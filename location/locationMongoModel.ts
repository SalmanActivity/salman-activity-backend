import { Schema, Model, Document, model } from 'mongoose'

let locationSchema:Schema = new Schema({
  name: {
    type: String,
    required: true
  },
  enabled: {
    type: Boolean,
    required: true,
    default: true
  },
})

let locationModel: Model<Document> = model('location', locationSchema)

export default locationModel