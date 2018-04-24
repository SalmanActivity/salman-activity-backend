import { Schema, Model, Document, model } from 'mongoose';
import { DivisionMongoModel } from '../division/divisionMongoModel';

const userSchema:Schema = new Schema({
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
    ref: DivisionMongoModel.modelName
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
});

const userModel: Model<Document> = model('user', userSchema);

export { userModel as UserMongoModel };