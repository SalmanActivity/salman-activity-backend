var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var config = require('./config')
var debug = require('debug')('salman-activity-backend:server')

var app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())

app.get('/', (req,res) => res.redirect('/api/v1/status/healthcheck'))

app.use('/api/v1/auth', require('./auth/index').router)
app.use('/api/v1/status', require('./status/index'))
app.use('/api/v1/users', require('./user/index'))
app.use('/api/v1/divisions', require('./division/index'))
app.use('/api/v1/locations', require('./location/index'))
app.use('/api/v1/requests', require('./request/index'))

mongoose.connect(config.mongoConnection).then(resp => {
    debug('connected to mongo server')
}).catch(error => {
    debug('error connecting to mongo server')
})

module.exports = app
