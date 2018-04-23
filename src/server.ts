import * as express from 'express';
import * as http from 'http';
import * as util from 'util';

const debug = require('debug')('salman-activity-backend:server');

export class Server {

  app: express.Application;

  private server: http.Server;

  constructor(private port = 3000) {
    this.app = express();
  }

  bootstrap() {
    this.app.set('port', this.port);
    
    this.server = http.createServer(this.app);
    this.server = this.server.listen(this.port);
    this.server.on('error', this.onError.bind(this));
    this.server.on('listening', this.onListening.bind(this));
  }

  async stop() {
    return new Promise((resolve, reject) => {
      this.server.removeAllListeners()
      .close(err => {
        if (err) {
          reject(err);
        }
        else {
          resolve();
        }
      });
    });
  }

  private onError(error) {
    if (error.syscall !== 'listen') {
      throw error;
    }
  
    const bind = typeof this.port === 'string' ? 'Pipe ' + this.port : 'Port ' + this.port;
  
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
      default:
        throw error;
    }
  }
  
  private onListening() {
    const addr = this.server.address();
    const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    debug('Listening on ' + bind);
  }

}