import { Server } from './server'
import * as bodyParser from 'body-parser'
import * as morgan from 'morgan'
import { Application } from 'express'
import config from './config'
import * as mongoose from 'mongoose'
import * as auth from './auth'
import * as status from './status'
import * as user from './user'
import * as division from './division'
import * as location from './location'
import * as request from './request'

let debug = require('debug')('salman-activity-backend:server')

// bootstrapping server

function normalizePort(val: string): number {
  let port: number = parseInt(val, 10)
  if (port >= 0)
    return port
  return 3000
}
let port: number = normalizePort(process.env.PORT || '3000')

export let server:Server = new Server(port)
let app:Application = server.app

server.bootstrap()

export function stop() {
  return server.stop().then(() => mongoose.disconnect())
}

mongoose.connect(config.mongoConnection).then(resp => {
    debug('connected to mongo server')
}).catch(error => {
    debug('error connecting to mongo server')
})

// routing server

app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', (req,res) => res.redirect('/api/v1/status/healthcheck'))

app.use('/api/v1/auth', auth.router)
app.use('/api/v1/status', status.router)
app.use('/api/v1/users', user.router)
app.use('/api/v1/divisions', division.router)
app.use('/api/v1/locations', location.router)
app.use('/api/v1/requests', request.router)

export default app