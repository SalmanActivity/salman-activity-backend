var sinon = require('sinon')
var passwordHash = require('password-hash')
var jwt = require('jsonwebtoken')
var auth = require('./auth')

describe('login endpoint test', function() {

    var responseSpy, userModelMocked
    before(function() {
        let userDocuments = [
            {
                name: 'test user 1',
                username: 'some_user_with_username_1',
                password: passwordHash.generate('password_of_username_sample_1'),
                enabled: true
            },
            {
                name: 'test user 2',
                username: 'some_user_with_username_2',
                password: passwordHash.generate('password_of_username_sample_2'),
                enabled: false
            },
            {
                name: 'test user 3',
                username: 'some_user_with_username_3',
                password: passwordHash.generate('password_of_username_sample_3'),
            },
        ]
        userModelMocked = sinon.stub(require('./user'), 'findOne')
        userModelMocked.returns({exec: () => Promise.resolve(null)})
        for (let user of userDocuments)
            userModelMocked.withArgs({username: user.username}).returns({
                exec: () => Promise.resolve(user)
            })
        
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

        auth.login(reqMocked, responseSpy, null).then(() => {
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
        
        auth.login(reqMocked, responseSpy, null).then(() => {
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
        
        auth.login(reqMocked, responseSpy, null).then(() => {
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
        
        auth.login(reqMocked, responseSpy, null).then(() => {
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
        
        auth.login(reqMocked, responseSpy, null).then(() => {
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
        
        auth.login(reqMocked, responseSpy, null).then(() => {
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
        
        auth.login(reqMocked, responseSpy, null).then(() => {
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
        
        auth.login(reqMocked, responseSpy, null).then(() => {
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

    after(function() {
        userModelMocked.restore()
    })

})

describe('auth middleware test', function() {

    var responseSpy, userModelMocked, config
    before(function() {
        let userDocuments = [
            {
                name: 'test user 1',
                username: 'some_user_with_username_1',
            }
        ]
        userModelMocked = sinon.stub(require('./user'), 'findOne')
        for (let user of userDocuments)
            userModelMocked.withArgs({username: user.username}).returns({
                exec: () => Promise.resolve(user)
            })
        
        responseSpy = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub().returnsThis(),
            header: sinon.stub().returnsThis()
        }

        config = sinon.stub(require('../config'), 'secretKey').value('test_secret')
    })

    it('should process next middleware when token in header and valid', (done) => {
        let config = require('../config')
        let user = { name: 'test user 1', username: 'some_user_with_username_1' }
        let token = jwt.sign(user, config.secretKey)
        let requestMocked = {
            body: {},
            header: sinon.stub().withArgs('Authorization').returns('JWT ' + token)
        }
        let next = sinon.spy()
        
        auth.auth(requestMocked, responseSpy, function() {
            sinon.assert.match(requestMocked.user, user)
            done()
        })
    })

})