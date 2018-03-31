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
      assert.equal(new Date(res.body.issuedTime).getTime(), document.issuedTime.getTime())
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
        issuedTime: new Date(2018, 1, 1, 10),
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
        issuedTime: new Date(2018, 1, 1, 10),
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
        issuedTime: new Date(2018, 1, 1, 10),
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
        issuedTime: new Date(2018, 1, 1, 10),
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
        issuedTime: new Date(2018, 1, 1, 10),
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

    it('should add new request with current user as issuer and division', (done) => {
      server.post('/api/v1/requests/')
      .set({'Authorization': 'JWT ' + userAuth})
      .send({
        name: 'request test 1',
        description: 'description of request test 1',
        location: '5aaa89e2a892471e3cdc84d8', // location 1
        startTime: new Date(2018, 5, 28, 13).getTime(),
        endTime: new Date(2018, 5, 28, 17).getTime(),
      }).then(res => {
        assert.equal(res.status, 200)
        assert.isNotEmpty(res.body.id)
        assert.equal(res.body.description, 'description of request test 1')
        assert.equal(res.body.name, 'request test 1')
        assert.equal(res.body.issuer.id, '5aa9359a2b21732a73d5406a')
        assert.equal(res.body.division.id, '5aa9359a2b21732a73d54068') // division 1
        assert.equal(res.body.status, 'pending')
        done()
      }).catch(done)
    })

    it('should add new request with current user as issuer and division is specific', (done) => {
      server.post('/api/v1/requests/')
      .set({'Authorization': 'JWT ' + adminAuth})
      .send({
        name: 'request test 2',
        description: 'description of request test 2',
        division: '5aaa860001e1901b03651171', // divisi 2
        location: '5aaa89e2a892471e3cdc84d8', // location 1
        startTime: new Date(2018, 5, 28, 13).getTime(),
        endTime: new Date(2018, 5, 28, 17).getTime(),
      }).then(res => {
        assert.equal(res.status, 200)
        assert.isNotEmpty(res.body.id)
        assert.equal(res.body.name, 'request test 2')
        assert.equal(res.body.description, 'description of request test 2')
        assert.equal(res.body.issuer.id, '5aa9359a2b21732a73d54069')
        assert.equal(res.body.division.id, '5aaa860001e1901b03651171') // division 2
        assert.equal(res.body.status, 'pending')
        done()
      }).catch(done)
    })

    let templateObject = {
      name: 'template request name',
      description: 'template description',
      location: '5aaa89e2a892471e3cdc84d9', // location 2
      startTime: new Date(2018, 7, 13, 10).getTime(),
      endTime: new Date(2018, 7, 13, 15).getTime(),
      participantNumber: 10,
      participantDescription: 'template participant description',
      speaker: 'template speakder description'
    }

    let check400Error = res => {
      assert.equal(res.status, 400)
      assert.hasAllKeys(res.body, 'error')
      assert.hasAllKeys(res.body.error, ['cause', 'msg'])
      assert.isNotEmpty(res.body.error.msg)
      assert.isNotEmpty(res.body.error.cause)
    }

    it('should return 400 and send validation error when name is too short', (done) => {
      server.post('/api/v1/requests/')
      .set({'Authorization': 'JWT ' + adminAuth})
      .send(Object.assign(templateObject, {name:'j'}))
      .then(check400Error).then(() => done()).catch(done)
    })

    it('should return 400 and send validation error when name is too long', (done) => {
      server.post('/api/v1/requests/')
      .set({'Authorization': 'JWT ' + adminAuth})
      .send(Object.assign(templateObject, {name:new Array(256+1).join('x')}))
      .then(check400Error).then(() => done()).catch(done)
    })

    it('should return 400 and send validation error when name is missing', (done) => {
      server.post('/api/v1/requests/')
      .set({'Authorization': 'JWT ' + adminAuth})
      .send(Object.assign(templateObject, {name:null}))
      .then(check400Error).then(() => done()).catch(done)
    })

    it('should return 400 and send validation error when description is too long', (done) => {
      server.post('/api/v1/requests/')
      .set({'Authorization': 'JWT ' + adminAuth})
      .send(Object.assign(templateObject, {description:new Array(256+1).join('x')}))
      .then(check400Error).then(() => done()).catch(done)
    })

    it('should return 400 and send validation error when division is not 24 hex', (done) => {
      server.post('/api/v1/requests/')
      .set({'Authorization': 'JWT ' + adminAuth})
      .send(Object.assign(templateObject, {division:'jauhararifin'}))
      .then(check400Error).then(() => done()).catch(done)
    })

    it('should return 400 and send validation error when division is not found', (done) => {
      server.post('/api/v1/requests/')
      .set({'Authorization': 'JWT ' + adminAuth})
      .send(Object.assign(templateObject, {division:'000000000000000000000000'}))
      .then(check400Error).then(() => done()).catch(done)
    })

    it('should return 400 and send validation error when location is not 24 hex', (done) => {
      server.post('/api/v1/requests/')
      .set({'Authorization': 'JWT ' + adminAuth})
      .send(Object.assign(templateObject, {location:'jauhararifin'}))
      .then(check400Error).then(() => done()).catch(done)
    })

    it('should return 400 and send validation error when location is not found', (done) => {
      server.post('/api/v1/requests/')
      .set({'Authorization': 'JWT ' + adminAuth})
      .send(Object.assign(templateObject, {location:'000000000000000000000000'}))
      .then(check400Error).then(() => done()).catch(done)
    })

  })

  describe('PUT specific request endpoint', () => {

    it('should change new request', (done) => {
      server.put('/api/v1/requests/5aaa89e2a892471e3cdc84da')
      .set({'Authorization': 'JWT ' + adminAuth})
      .send({
        name: 'request edit 1',
        description: 'description of request edit 1',
        startTime: new Date(2018,2, 15, 9).getTime(),
        endTime: new Date(2018, 2, 15, 12).getTime(),
        participantNumber: 3,
        participantDescription: 'participant description edit',
        speaker: 'speaker edit',
        status: 'pending',
        enabled: false
      })
      .then(res => {
        assert.equal(res.status, 200)
        assert.equal(res.body.name, 'request edit 1')
        assert.equal(res.body.description, 'description of request edit 1')
        assert.equal(res.body.participantDescription, 'participant description edit')
        assert.equal(res.body.speaker, 'speaker edit')
        assert.equal(res.body.status, 'pending')
        assert.equal(res.body.enabled, false)
      }).then(() => done()).catch(done)
    })

    it('should return 403 when division want to update accepted request', (done) => {
      server.put('/api/v1/requests/5aaa89e2a892471e3cdc84de')
      .set({'Authorization': 'JWT ' + userAuth})
      .send({'name': 'changing name'})
      .then(res => {
        assert.equal(res.status, 403)
        assert.hasAllKeys(res.body, 'error')
        assert.hasAllKeys(res.body.error, ['cause', 'msg'])
        assert.isNotEmpty(res.body.error.msg)
        assert.isNotEmpty(res.body.error.cause)
      }).then(() => done()).catch(done)
    })

    it('should return 200 when admin want to update accepted request', (done) => {
      server.put('/api/v1/requests/5aaa89e2a892471e3cdc84da')
      .set({'Authorization': 'JWT ' + adminAuth})
      .send({name: 'request edit 1',})
      .then(res => {
        assert.equal(res.status, 200)
        assert.equal(res.body.name, 'request edit 1')
      }).then(() => done()).catch(done)
    })

    it('should keep issuedTime', (done) => {
      server.put('/api/v1/requests/5aaa89e2a892471e3cdc84dc')
      .set({'Authorization': 'JWT ' + adminAuth})
      .send({description: 'description of request edit 1'})
      .then(res => {
        assert.equal(res.status, 200)
        assert.equal(new Date(res.body.issuedTime).getTime(),  new Date(2018, 1, 1, 10).getTime())
      }).then(() => done()).catch(done)
    })

    let check400Error = res => {
      assert.equal(res.status, 400)
      assert.hasAllKeys(res.body, 'error')
      assert.hasAllKeys(res.body.error, ['cause', 'msg'])
      assert.isNotEmpty(res.body.error.msg)
      assert.isNotEmpty(res.body.error.cause)
    }

    it('should return 400 when status field found but current user is division', (done) => {
      server.put('/api/v1/requests/5aaa89e2a892471e3cdc84e0')
      .set({'Authorization': 'JWT ' + userAuth})
      .send({status:'accepted'})
      .then(check400Error).then(() => done()).catch(done)
    })

    it('should return 200 when status field found but current user is admin', (done) => {
      server.put('/api/v1/requests/5aaa89e2a892471e3cdc84e0')
      .set({'Authorization': 'JWT ' + adminAuth})
      .send({status:'pending'})
      .expect(200).then(() => done()).catch(done)
    })

    it('should return 400 when enabled field found but current user is division', (done) => {
      server.put('/api/v1/requests/5aaa89e2a892471e3cdc84e0')
      .set({'Authorization': 'JWT ' + userAuth})
      .send({enabled:false})
      .then(check400Error).then(() => done()).catch(done)
    })

    it('should return 200 when enabled field found but current user is admin', (done) => {
      server.put('/api/v1/requests/5aaa89e2a892471e3cdc84e0')
      .set({'Authorization': 'JWT ' + adminAuth})
      .send({enabled:false})
      .expect(200).then(() => done()).catch(done)
    })

    it('should return 400 when issuer field found', (done) => {
      server.put('/api/v1/requests/5aaa89e2a892471e3cdc84e0')
      .set({'Authorization': 'JWT ' + adminAuth})
      .send({issuer:'5aa9359a2b21732a73d5406a'})
      .then(check400Error).then(() => done()).catch(done)
    })

    it('should return 400 when issuedTime field found', (done) => {
      server.put('/api/v1/requests/5aaa89e2a892471e3cdc84e0')
      .set({'Authorization': 'JWT ' + adminAuth})
      .send({issuedTime: 10})
      .then(check400Error).then(() => done()).catch(done)
    })

    it('should return 400 when division want to change division', (done) => {
      server.put('/api/v1/requests/5aaa89e2a892471e3cdc84e0')
      .set({'Authorization': 'JWT ' + userAuth})
      .send({division:'5aaa860001e1901b03651171'}) // division 2
      .then(check400Error).then(() => done()).catch(done)
    })

    it('should return 200 when admin want to change division', (done) => {
      server.put('/api/v1/requests/5aaa89e2a892471e3cdc84e0')
      .set({'Authorization': 'JWT ' + adminAuth})
      .send({division:'5aaa860001e1901b03651171'}) // division 2
      .expect(200).then(() => done()).catch(done)
    })

    it('should return 400 when division not found', (done) => {
      server.put('/api/v1/requests/5aaa89e2a892471e3cdc84e0')
      .set({'Authorization': 'JWT ' + adminAuth})
      .send({division:'9999990001e1901b03651171'})
      .then(check400Error).then(() => done()).catch(done)
    })

    it('should return 400 when location not found', (done) => {
      server.put('/api/v1/requests/5aaa89e2a892471e3cdc84e0')
      .set({'Authorization': 'JWT ' + adminAuth})
      .send({location:'9999990001e1901b03651171'})
      .then(check400Error).then(() => done()).catch(done)
    })

    it('should return 400 when end time less than start time', (done) => {
      server.put('/api/v1/requests/5aaa89e2a892471e3cdc84e0')
      .set({'Authorization': 'JWT ' + adminAuth})
      .send({startTime: 100, endTime: 99})
      .then(check400Error).then(() => done()).catch(done)
    })

  })
})
