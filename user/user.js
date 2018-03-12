var mongoose = require('mongoose')
var divisionSchema = require('../division/division').schema

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
    password: {
        type: String,
        required: true
    },
    division: divisionSchema,
    enabled: {
        type: Boolean,
        required: true,
        default: true
    },
    roles: [{
        type: String,
        enum: ['admin', 'division']
    }]
})

module.exports = mongoose.model('user', userSchema)