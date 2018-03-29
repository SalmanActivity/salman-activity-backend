var mongoose = require('mongoose')

var locationSchema = mongoose.Schema({
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
locationSchema.plugin(require('meanie-mongoose-to-json'))

module.exports = mongoose.model('location', locationSchema)