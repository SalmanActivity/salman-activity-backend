import 'mocha'
import * as sinon from 'sinon'
import * as jwt from 'jsonwebtoken'
import * as auth from '.'
import { InMemoryAccessor } from '../accessor'
import { User, UserAccessor } from '../user'
import { Config } from '../config';

class FakeUserAccessor extends InMemoryAccessor<User> implements UserAccessor {
  async getByUsername(username: string): Promise<User> {
    for (let item of this.documents)
      if (item.username === username)
        return item
    return null
  }
  constructor(documents:any[]) {
    super(documents)
  }
}

describe('auth middleware test', function() {

  var responseSpy, userModelMocked, config: Config, authEndpoint
  beforeEach(function() {
    let userDocuments = [
      {
        id: '5aa9359a2b21732a73d5406a',
        name: 'test user 1',
        username: 'some_user_with_username_1',
      }
    ]
    config = {'secretKey': 'test_secret', 'mongoConnection':''}
    authEndpoint = auth.auth(new FakeUserAccessor(userDocuments), config)
    
    responseSpy = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
      header: sinon.stub().returnsThis()
    }
  })

  let successCheck = (done, user, responseSpy, requestMocked) => {
    let next = sinon.spy()
    responseSpy.status.callsFake(function(statusCode) {
      if (statusCode == 403)
        done('failed auth')
      return this
    })

    authEndpoint(requestMocked, responseSpy, function() {
      sinon.assert.match(requestMocked.user, user)
      done()
    }).catch(done)
  }

  it('should process next middleware when token in header and valid', (done) => {
    let user = { id:'5aa9359a2b21732a73d5406a', name: 'test user 1', username: 'some_user_with_username_1' }
    let token = jwt.sign(user, config.secretKey)
    let requestMocked:any = {
      body: {},
      header: sinon.stub().withArgs('Authorization').returns('JWT ' + token)
    }
    successCheck(done, user, responseSpy, requestMocked)
  })

  it('should process next middleware when token in body and valid', (done) => {
    let user = { id:'5aa9359a2b21732a73d5406a', name: 'test user 1', username: 'some_user_with_username_1' }
    let token = jwt.sign(user, config.secretKey)
    let requestMocked:any = {header:function(){}, body: { token }}
    successCheck(done, user, responseSpy, requestMocked)
  })

  let unauthorizedCheck = (done, requestMocked, responseSpy, next) => {
    authEndpoint(requestMocked, responseSpy, next).then(() => {
      responseSpy.status.calledWith(403)
      sinon.assert.calledWith(responseSpy.status, 403)
      let jsonCallArg = responseSpy.json.getCall(0).args[0]
      if (!jsonCallArg)
        sinon.assert.fail('json response is null')
      sinon.assert.match(jsonCallArg.error.msg, 'cannot perform action')
      sinon.assert.match(jsonCallArg.error.cause, 'unauthorized access')
      sinon.assert.notCalled(next)
      done()
    }).catch(done.bind(this))
  }

  it('should return error when token in header and invalid', (done) => {
    let config = require('../config')
    let user = { id:'5aa9359a2b21732a73d5406a', name: 'test user 1', username: 'some_user_with_username_1' }
    let token = jwt.sign(user, 'not_the_secret_key')
    let requestMocked = {
      body: {},
      header: sinon.stub().withArgs('Authorization').returns('JWT ' + token)
    }
    let next = sinon.spy()

    unauthorizedCheck(done, requestMocked, responseSpy, next)
  })

  it('should return error when token in body and invalid', (done) => {
    let config = require('../config')
    let user = { id:'5aa9359a2b21732a73d5406a', name: 'test user 1', username: 'some_user_with_username_1' }
    let token = jwt.sign(user, 'not_the_secret_key')
    let requestMocked = {
      body: {token},
      header: sinon.stub()
    }
    let next = sinon.spy()

    unauthorizedCheck(done, requestMocked, responseSpy, next)
  })

  it('should return error when no token is provided', (done) => {
    let config = require('../config')
    let requestMocked = {body: {}, header: sinon.stub()}
    let next = sinon.spy()

    unauthorizedCheck(done, requestMocked, responseSpy, next)
  })

})