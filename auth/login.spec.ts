import 'mocha'
import * as sinon from 'sinon'
import * as passwordHash from 'password-hash'
import login from './login'
import { InMemoryAccessor } from '../accessor'
import { User, UserAccessor } from '../user'

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

describe('login endpoint test', function() {

  var responseSpy, userModelMocked, loginEndpoint

  beforeEach(function() {
    let userDocuments = [
      {
        id: '5aa9359a2b21732a73d54068',
        name: 'test user 1',
        username: 'some_user_with_username_1',
        password: passwordHash.generate('password_of_username_sample_1'),
        enabled: true
      },
      {
        id: '5aa9359a2b21732a73d54069',
        name: 'test user 2',
        username: 'some_user_with_username_2',
        password: passwordHash.generate('password_of_username_sample_2'),
        enabled: false
      },
      {
        id: '5aa9359a2b21732a73d5406a',
        name: 'test user 3',
        username: 'some_user_with_username_3',
        password: passwordHash.generate('password_of_username_sample_3'),
      },
    ]
    loginEndpoint = login(new FakeUserAccessor(userDocuments))
    
    responseSpy = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
      header: sinon.stub().returnsThis()
    }
  })
  
  it('should return access token when username and password matched and user is enabled', (done) => {
    let username = 'some_user_with_username_1'
    let password = 'password_of_username_sample_1'
    let reqMocked = { body: { username, password } }

    loginEndpoint(reqMocked, responseSpy).then(() => {
      sinon.assert.calledWith(responseSpy.status, 200)
      sinon.assert.match(responseSpy.json.getCall(0).args[0].token ? 1 : 0, 1)
      done()
    }).catch((err) => {
      done('login failed, return rejected promise' + err)
    })
  })

  it('should return error when username and password matched and user is disabled', (done) => {
    let username = 'some_user_with_username_2'
    let password = 'password_of_username_sample_2'
    let reqMocked = { body: { username, password } }
    
    loginEndpoint(reqMocked, responseSpy).then(() => {
      sinon.assert.calledWith(responseSpy.status, 403)
      sinon.assert.match(responseSpy.json.getCall(0).args[0].error.cause, 'wrong username or password')
      sinon.assert.match(responseSpy.json.getCall(0).args[0].error.msg, 'login failed')
      done()
    }).catch((err) => {
      done('return rejected promise' + err)
    })
  })

  it('should return error when username and password matched and user enbled is missing', (done) => {
    let username = 'some_user_with_username_3'
    let password = 'password_of_username_sample_3'
    let reqMocked = { body: { username, password } }
    
    loginEndpoint(reqMocked, responseSpy).then(() => {
      sinon.assert.calledWith(responseSpy.status, 403)
      sinon.assert.match(responseSpy.json.getCall(0).args[0].error.cause, 'wrong username or password')
      sinon.assert.match(responseSpy.json.getCall(0).args[0].error.msg, 'login failed')
      done()
    }).catch((err) => {
      done('return rejected promise' + err)
    })
  })

  it('should return error when username doesnt even exists', (done) => {
    let username = 'some_user_with_username_4'
    let password = 'password_of_username_sample_3'
    let reqMocked = { body: { username, password } }
    
    loginEndpoint(reqMocked, responseSpy).then(() => {
      sinon.assert.calledWith(responseSpy.status, 403)
      sinon.assert.match(responseSpy.json.getCall(0).args[0].error.cause, 'wrong username or password')
      sinon.assert.match(responseSpy.json.getCall(0).args[0].error.msg, 'login failed')
      done()
    }).catch((err) => {
      done('return rejected promise' + err)
    })
  })

  it('should return error when username match but password doesnt', (done) => {
    let username = 'some_user_with_username_1'
    let password = 'password_of_username_sample_3'
    let reqMocked = { body: { username, password } }
    
    loginEndpoint(reqMocked, responseSpy).then(() => {
      sinon.assert.calledWith(responseSpy.status, 403)
      sinon.assert.match(responseSpy.json.getCall(0).args[0].error.cause, 'wrong username or password')
      sinon.assert.match(responseSpy.json.getCall(0).args[0].error.msg, 'login failed')
      done()
    }).catch((err) => {
      done('return rejected promise' + err)
    })
  })

  it('should return error when username is empty', (done) => {
    let username = ''
    let password = 'password_of_username_sample_3'
    let reqMocked = { body: { username, password } }
    
    loginEndpoint(reqMocked, responseSpy).then(() => {
      sinon.assert.calledWith(responseSpy.status, 401)
      sinon.assert.match(responseSpy.json.getCall(0).args[0].error.cause, 'empty username or password')
      sinon.assert.match(responseSpy.json.getCall(0).args[0].error.msg, 'login failed')
      done()
    }).catch((err) => {
      done('return rejected promise' + err)
    })
  })

  it('should return error when password is empty', (done) => {
    let username = 'some_user_with_username_1'
    let password = ''
    let reqMocked = { body: { username, password } }
    
    loginEndpoint(reqMocked, responseSpy).then(() => {
      sinon.assert.calledWith(responseSpy.status, 401)
      sinon.assert.match(responseSpy.json.getCall(0).args[0].error.cause, 'empty username or password')
      sinon.assert.match(responseSpy.json.getCall(0).args[0].error.msg, 'login failed')
      done()
    }).catch((err) => {
      done('return rejected promise' + err)
    })
  })

  it('should return error when username and password is empty', (done) => {
    let username = ''
    let password = ''
    let reqMocked = { body: { username, password } }
    
    loginEndpoint(reqMocked, responseSpy).then(() => {
      sinon.assert.calledWith(responseSpy.status, 401)
      sinon.assert.match(responseSpy.json.getCall(0).args[0].error.cause, 'empty username or password')
      sinon.assert.match(responseSpy.json.getCall(0).args[0].error.msg, 'login failed')
      done()
    }).catch((err) => {
      done('return rejected promise' + err)
    })
  })

  afterEach(function() {
    responseSpy.status.reset()
    responseSpy.json.reset()
    responseSpy.header.reset()
  })

})