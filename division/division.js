var mongoose = require('mongoose')

var divisionSchema = mongoose.Schema({
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
divisionSchema.plugin(require('meanie-mongoose-to-json'))

module.exports = mongoose.model('division', divisionSchema)