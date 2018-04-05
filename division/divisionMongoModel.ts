import { Schema, Model, Document, model } from 'mongoose'

let divisionSchema:Schema = new Schema({
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

let divisionModel: Model<Document> = model('division', divisionSchema)

export default divisionModel