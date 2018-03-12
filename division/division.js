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

module.exports = mongoose.model('division', divisionSchema)