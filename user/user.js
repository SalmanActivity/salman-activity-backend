var mongoose = require('mongoose')
var divisionModel = require('../division/division')
var divisionSchema = divisionModel.schema

var userSchema = mongoose.Schema({
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
    type: mongoose.Schema.Types.ObjectId,
    ref: divisionModel.modelName
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
userSchema.plugin(require('meanie-mongoose-to-json'))

module.exports = mongoose.model('user', userSchema)