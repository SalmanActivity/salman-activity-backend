import 'mocha'
import * as sinon from 'sinon'
import { assert } from 'chai'
import * as crud from './crud'
import * as supertest from 'supertest'
import app, { stop } from '../app'
let server = supertest.agent(app)