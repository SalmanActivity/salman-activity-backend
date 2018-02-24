var mongoose = require('mongoose')

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
    roles: [String]
})

module.exports = mongoose.model('user', userSchema)