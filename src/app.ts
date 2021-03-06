import { Server } from './server';
import * as bodyParser from 'body-parser';
import * as morgan from 'morgan';
import { Application } from 'express';
import { config } from './config';
import * as mongoose from 'mongoose';
import * as auth from './auth';
import * as status from './status';
import * as user from './user';
import * as division from './division';
import * as location from './location';
import * as request from './request';
import * as report from './report';

const debug = require('debug')('salman-activity-backend:server');

// bootstrapping server

function normalizePort(val: string): number {
  const port: number = Number(val);
  if (port >= 0) {
    return port;
  }
  return 3000;
}
const port: number = normalizePort(process.env.PORT || '3000');

export let server:Server = new Server(port);
export const app:Application = server.app;

server.bootstrap();

export function stop() {
  return server.stop().then(() => mongoose.disconnect());
}

mongoose.connect(config.mongoConnection).then(() => {
  debug('connected to mongo server');
}).catch(error => {
  debug('error connecting to mongo server');
});

// routing server

app.use(morgan('combined'));
app.use(bodyParser.json({limit: '20mb'}));
app.use(bodyParser.urlencoded({limit: '20mb', extended: false }));

if (config.trustedDomain) {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', config.trustedDomain);
    next();
  });
}

app.get('/', (req,res) => res.redirect('/api/v1/status/healthcheck'));

app.use('/api/v1/auth', auth.router);
app.use('/api/v1/status', status.router);
app.use('/api/v1/users', user.router);
app.use('/api/v1/divisions', division.router);
app.use('/api/v1/locations', location.router);
app.use('/api/v1/requests', request.router);
app.use('/api/v1/', report.router);