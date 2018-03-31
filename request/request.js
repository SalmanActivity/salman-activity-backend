var mongoose = require('mongoose')
var userModel = require('../user/user')
var divisionModel = require('../division/division')
var locationModel = require('../location/location')

var requestSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 256,
    required: true
  },
  description: {
    type: String,
    maxlength: 1024,
  },
  issuer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: userModel.modelName,
    required: true
  },
  issuedTime: {
    type: Date,
    required: true,
  },
  division: {
    type: mongoose.Schema.Types.ObjectId,
    ref: divisionModel.modelName,
    required: true
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: locationModel.modelName,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  participantNumber: Number,
  participantDescription: {
    type: String,
    maxlength: 1024
  },
  speaker: {
    type: String,
    maxlength: 512
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    required: true,
    default: 'pending'
  },
  enabled: {
    type: Boolean,
    required: true,
    default: true
  },
})
requestSchema.plugin(require('meanie-mongoose-to-json'))

module.exports = mongoose.model('request', requestSchema)