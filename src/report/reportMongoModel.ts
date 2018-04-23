import { Schema, Model, Document, model } from 'mongoose';
import { RequestMongoModel } from '../request';
import { PhotoMongoModel } from '../photo';

const reportSchema:Schema = new Schema({
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
});

const reportModel: Model<Document> = model('report', reportSchema);

export default reportModel;
