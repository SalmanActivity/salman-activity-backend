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
      .end((err, res) => {
        assert.isArray(res.body)
        assert.isAbove(res.body.length, 0, 'should return requests more than 0')
        for (let item of res.body) {
          let startTime = new Date(item.startTime)
          assert.isAtLeast(startTime, new Date(2018, 1))
          assert.isAtMost(startTime, new Date(2018, 2))
          assert.equal(item.status, 'accepted')
        }
        done()
      })
    })

  	it('should return all in month in same division including deleted one', (done) => {
      server.get('/api/v1/requests/')
      .set({'Authorization': 'JWT ' + userAuth})
      .query({month:2, year:2018})
      .expect(200)
      .end((err, res) => {
        assert.isArray(res.body)
        assert.isAbove(res.body.length, 0, 'should return requests more than 0')
        for (let item of res.body)
          assert.equal(item.division.id, '5aa9359a2b21732a73d54068')
        done()
      })
    })

    it('should return all requests in month', (done) => {
      server.get('/api/v1/requests/')
      .set({'Authorization': 'JWT ' + adminAuth})
      .query({month:2, year:2018})
      .expect(200)
      .end((err, res) => {
        assert.isArray(res.body)
        assert.isAbove(res.body.length, 0, 'should return requests more than 0')
        for (let item of res.body) {
          let startTime = new Date(item.startTime)
          assert.isAtLeast(startTime, new Date(2018, 1))
          assert.isAtMost(startTime, new Date(2018, 2))
        }
        done()
      })
    })

  })

  
})
