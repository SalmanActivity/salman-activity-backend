import { Schema, Model, Document, model } from 'mongoose';

const photoSchema:Schema = new Schema({
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
});

const photoModel: Model<Document> = model('photo', photoSchema);

export { photoModel as PhotoMongoModel };