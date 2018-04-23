import { Schema, Model, Document, model } from 'mongoose';

const divisionSchema:Schema = new Schema({
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

const divisionModel: Model<Document> = model('division', divisionSchema);

export default divisionModel;