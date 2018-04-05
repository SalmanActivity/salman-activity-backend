import * as express from 'express'
import * as http from 'http'

let debug = require('debug')('salman-activity-backend:server')

export class Server {

  public app: express.Application

  private server: http.Server

  constructor(private port:number = 3000) {
    this.app = express()
  }

  bootstrap() {
    this.app.set('port', this.port)
    
    this.server = http.createServer(this.app)
    this.server.listen(this.port)
    this.server.on('error', this.onError.bind(this))
    this.server.on('listening', this.onListening.bind(this))
  }

  private onError(error) {
    if (error.syscall !== 'listen')
      throw error
  
    let bind = typeof this.port === 'string' ? 'Pipe ' + this.port : 'Port ' + this.port
  
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges')
        process.exit(1)
        break
      case 'EADDRINUSE':
        console.error(bind + ' is already in use')
        process.exit(1)
        break
      default:
        throw error
    }
  }
  
  private onListening() {
    let addr = this.server.address()
    let bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port
    debug('Listening on ' + bind)
  }

}