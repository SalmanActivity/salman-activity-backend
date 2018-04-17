import { Schema, Model, Document, model } from 'mongoose'

let photoSchema:Schema = new Schema({
  name: {
    type: String,
    required: true
  },
  mime: {
    type: String,
    required: true
  },
  uploadTime: {
    type: Date,
    required: true
  },
  checksum: {
    type: String,
    required: true
  }
})

let photoModel: Model<Document> = model('photo', photoSchema)

export default photoModel