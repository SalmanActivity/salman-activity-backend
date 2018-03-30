var sinon = require('sinon')
var assert = require('chai').assert
var crud = require('./crud')
var server = require('supertest')(require('../app'))

describe('request crud endpoint test', () => {

  let adminAuth, userAuth

  before((done) => {
    let promiseAdmin = server.post('/api/v1/auth/login')
    .send({
      'username': 'test_admin_1',
      'password': 'test_admin_1_pass'
    })
    .expect(200)
    .then(res => {adminAuth = res.body.token})

    let promiseUser = server.post('/api/v1/auth/login')
    .send({
      'username': 'test_user_1',
      'password': 'test_user_1_pass'
    })
    .expect(200)
    .then(res => {userAuth = res.body.token})

    Promise.all([promiseAdmin, promiseUser])
    .then(res => done())
    .catch(err => done(err))
  })

  describe('GET all requests endpoint', () => {

    it('should return all requests in month that accepted except the deleted one', (done) => {
      server.get('/api/v1/requests/')
      .query({month:2, year:2018})
      .expect(200)
      .then(res => {
        assert.isArray(res.body)
        assert.isAbove(res.body.length, 0, 'should return requests more than 0')
        for (let item of res.body) {
          let startTime = new Date(item.startTime)
          assert.isAtLeast(startTime, new Date(2018, 1))
          assert.isAtMost(startTime, new Date(2018, 2))
          assert.equal(item.status, 'accepted')
        }
        done()
      }).catch(err => done(err))
    })

  	it('should return all in month in same division including deleted one', (done) => {
      server.get('/api/v1/requests/')
      .set({'Authorization': 'JWT ' + userAuth})
      .query({month:2, year:2018})
      .expect(200)
      .then(res => {
        assert.isArray(res.body)
        assert.isAbove(res.body.length, 0, 'should return requests more than 0')
        for (let item of res.body)
          assert.equal(item.division.id, '5aa9359a2b21732a73d54068')
        done()
      }).catch(err => done(err))
    })

    it('should return all requests in month', (done) => {
      server.get('/api/v1/requests/')
      .set({'Authorization': 'JWT ' + adminAuth})
      .query({month:2, year:2018})
      .expect(200)
      .then(res => {
        assert.isArray(res.body)
        assert.isAbove(res.body.length, 0, 'should return requests more than 0')
        for (let item of res.body) {
          let startTime = new Date(item.startTime)
          assert.isAtLeast(startTime, new Date(2018, 1))
          assert.isAtMost(startTime, new Date(2018, 2))
        }
        done()
      }).catch(err => done(err))
    })

  })

  let checkSpecificRequest = (document) => {
    return res => {
      assert.equal(res.status, 200)
      assert.equal(res.body.id, document._id)
      assert.equal(res.body.status, document.status)
      assert.equal(new Date(res.body.startTime).getTime(), document.startTime.getTime())
      assert.equal(new Date(res.body.endTime).getTime(), document.endTime.getTime())
      assert.equal(res.body.enabled, document.enabled)
      assert.equal(res.body.description, document.description)
    }
  }

  describe('GET specific request endpoint', () => {

    it('should return specific request if admin', (done) => {
      server.get('/api/v1/requests/5aaa89e2a892471e3cdc84de')
      .set({'Authorization': 'JWT ' + adminAuth})
      .then(checkSpecificRequest({
        _id: '5aaa89e2a892471e3cdc84de',
        name: 'request 5',
        description: 'description of request 5',
        startTime: new Date(2018, 1, 1, 13),
        endTime: new Date(2018, 1, 1, 17),
        status: 'accepted',
        enabled: true
      })).then(() => done()).catch(err => done(err))
    })

    it('should return specific request if current user is same division', (done) => {
      server.get('/api/v1/requests/5aaa89e2a892471e3cdc84de')
      .set({'Authorization': 'JWT ' + userAuth})
      .then(checkSpecificRequest({
        _id: '5aaa89e2a892471e3cdc84de',
        name: 'request 5',
        description: 'description of request 5',
        startTime: new Date(2018, 1, 1, 13),
        endTime: new Date(2018, 1, 1, 17),
        status: 'accepted',
        enabled: true
      })).then(() => done()).catch(err => done(err))
    })

    it('should return specific request even if it has been deleted', (done) => {
      server.get('/api/v1/requests/5aaa89e2a892471e3cdc84df')
      .set({'Authorization': 'JWT ' + userAuth})
      .then(checkSpecificRequest({
        _id: '5aaa89e2a892471e3cdc84df',
        name: 'request 6',
        description: 'description of request 6',
        startTime: new Date(2018, 1, 1, 13),
        endTime: new Date(2018, 1, 1, 17),
        status: 'rejected',
        enabled: false
      })).then(() => done()).catch(err => done(err))
    })

    it('should return specific request if current user is public and request is accepted and enabled', (done) => {
      server.get('/api/v1/requests/5aaa89e2a892471e3cdc84e1')
      .set({'Authorization': 'JWT ' + userAuth})
      .then(checkSpecificRequest({
        _id: '5aaa89e2a892471e3cdc84e1',
        name: 'request 8',
        description: 'description of request 8',
        startTime: new Date(2018, 1, 23, 13),
        endTime: new Date(2018, 1, 23, 17),
        status: 'accepted',
        enabled: true
      })).then(() => done()).catch(err => done(err))
    })

    it('should return specific request even if it has been deleted', (done) => {
      server.get('/api/v1/requests/5aaa89e2a892471e3cdc84df')
      .set({'Authorization': 'JWT ' + userAuth})
      .then(checkSpecificRequest({
        _id: '5aaa89e2a892471e3cdc84df',
        name: 'request 6',
        description: 'description of request 6',
        startTime: new Date(2018, 1, 1, 13),
        endTime: new Date(2018, 1, 1, 17),
        status: 'rejected',
        enabled: false
      })).then(() => done()).catch(err => done(err))
    })

    let check404Error = res => {
      assert.equal(res.status, 404)
      assert.containsAllKeys(res.body.error, ['msg', 'cause'])
      assert(res.body.error.cause.includes('not found'))
    }

    it('should return 404 not found if request doesnt exists', (done) => {
      server.get('/api/v1/requests/5aaa89e2a892471e3cdcf4df')
      .set({'Authorization': 'JWT ' + userAuth})
      .then(check404Error).then(() => done()).catch(err => done(err))
    })

    it('should return 404 not found if request id not 24 hex string', (done) => {
      server.get('/api/v1/requests/somekey')
      .set({'Authorization': 'JWT ' + userAuth})
      .then(check404Error).then(() => done()).catch(err => done(err))
    })

    it('should return 404 not found if request exists but not for division', (done) => {
      server.get('/api/v1/requests/5aaa89e2a892471e3cdc84e2')
      .set({'Authorization': 'JWT ' + userAuth})
      .then(check404Error).then(() => done()).catch(err => done(err))
    })

    it('should return 404 not found if request exists but rejected', (done) => {
      server.get('/api/v1/requests/5aaa89e2a892471e3cdc84e2')
      .then(check404Error).then(() => done()).catch(err => done(err))
    })

    it('should return 404 not found if request exists but pending', (done) => {
      server.get('/api/v1/requests/5aaa89e2a892471e3cdc84e3')
      .then(check404Error).then(() => done()).catch(err => done(err))
    })

    it('should return 404 not found if request exists but disabled and current user is public user', (done) => {
      server.get('/api/v1/requests/5aaa89e2a892471e3cdc84e4')
      .then(check404Error).then(() => done()).catch(err => done(err))
    })

  })

  describe('DELETE specific request endpoint', () => {

    let checkEnabledFalse = res => {
      assert.equal(res.status, 202)
      assert.isFalse(res.body.enabled)
    }

    it('should change request enabled to false', (done) => {
      server.delete('/api/v1/requests/5aaa89e2a892471e3cdc84e1')
      .set({'Authorization': 'JWT ' + adminAuth})
      .then(checkEnabledFalse).then(() => done()).catch(err => done(err))
    })

    it('should keep deleted request enabled to false', (done) => {
      server.delete('/api/v1/requests/5aaa89e2a892471e3cdc84df')
      .set({'Authorization': 'JWT ' + adminAuth})
      .then(checkEnabledFalse).then(() => done()).catch(err => done(err))
    })

  })

  describe('POST specific user endpoint', () => {

    it('should add new user', (done) => {
      done()
    })

    it('should return 400 and send validation error when name is too short', (done) => {
      done()
    })

    it('should return 400 and send validation error when name is too long', (done) => {
      done()
    })

    it('should return 400 and send validation error when name is missing', (done) => {
      done()
    })

    it('should return 400 and send validation error when username is too short', (done) => {
      done()
    })

    it('should return 400 and send validation error when username is too long', (done) => {
      done()
    })

    it('should return 400 and send validation error when username is missing', (done) => {
      done()
    })

    it('should return 400 and send validation error when username is used', (done) => {
      done()
    })

    it('should return 400 and send validation error when email is invalid', (done) => {
      done()
    })

    it('should return 400 and send validation error when email is too short', (done) => {
      done()
    })

    it('should return 400 and send validation error when email is too long', (done) => {
      done()
    })

    it('should return 400 and send validation error when email is missing', (done) => {
      done()
    })

    it('should return 400 and send validation error when email is used', (done) => {
      done()
    })

    it('should return 400 and send validation error when password is too short', (done) => {
      done()
    })

    it('should return 400 and send validation error when password is too long', (done) => {
      done()
    })

    it('should return 400 and send validation error when password is missing', (done) => {
      done()
    })

    it('should return 400 and send validation error when division is invalid', (done) => {
      done()
    })

    it('should return 400 and send validation error when division is not found', (done) => {
      done()
    })

    it('should return 400 and send validation error when enabled is invalid', (done) => {
      done()
    })

    it('should return 400 and send validation error when admin is invalid', (done) => {
      done()
    })

  })

  describe('PUT specific user endpoint', () => {

    it('should change new user', (done) => {
      done()
    })

    it('should change new user with some field', (done) => {
      done()
    })

    it('should keep username', (done) => {
      done()
    })

    it('should return 400 when username is taken', (done) => {
      done()
    })

    it('should return 400 when email is taken', (done) => {
      done()
    })

    it('should return 404 when user id not found', (done) => {
      done()
    })

  })
})
