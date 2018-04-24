import { Schema, Model, Document, model } from 'mongoose';

const locationSchema:Schema = new Schema({
  name: {
    type: String,
    required: true
  },
  enabled: {
    type: Boolean,
    required: true,
    default: true
  },
});

const locationModel: Model<Document> = model('location', locationSchema);

export { locationModel as LocationMongoModel };