var sinon = require('sinon')
var assert = require('chai').assert
var crud = require('./crud')
var user = require('./user')
var passwordHash = require('password-hash')
var ObjectId = require('mongoose').Types.ObjectId

describe('user crud endpoint test', () => {
  let documents = [], findStub, findOneStub, req = {}, res, next

  beforeEach(() => {
    next = sinon.stub()
    res = {status:sinon.stub(), json:sinon.stub(), header:sinon.stub()}
    res.status.returnsThis()
    res.json.returnsThis()

    documents = [
      {
        id: '5aa9359a2b21732a73d5406a',
        name: 'Test User 1',
        username: 'test_user_1',
        email: 'test_user_1@test.com',
        password: passwordHash.generate('test_user_1_pass'),
        division: {'id':'6aa9359a2b21732a73d5406a', 'name': 'div 1', 'enabled': true},
        enabled: true,
        admin: false
      },
      {
        id: '5aa9359a2b21732a73d5406b',
        name: 'Test User 2',
        username: 'test_user_2',
        email: 'test_user_2@test.com',
        password: passwordHash.generate('test_user_2_pass'),
        secret: 'field'
      },
      {
        id: '5aa9359a2b21732a73d5406c',
        name: 'Test User Admin 1',
        username: 'test_user_admin_1',
        email: 'test_user_admin_1@test.com',
        password: passwordHash.generate('test_user_admin_1_pass'),
        division: {'id':'6aa9359a2b21732a73d5406a', 'name': 'div 1', 'enabled': true},
        enabled: true,
        admin: true
      },
      {
        id: '5aa9359a2b21732a73d5406d',
        name: 'Test User 3',
        username: 'test_user_3',
        email: 'test_user_3@test.com',
        password: passwordHash.generate('test_user_3_pass'),
        division: {'id':'6aa9359a2b21732a73d5406b', 'name': 'div 2', 'enabled': false}
      },
    ]

    findStub = sinon.stub(user, 'find').callsFake((filter, callback) => {callback(null, documents)})
    findOneStub = sinon.stub(user, 'findOne').callsFake((filter, callback) => {
      for (doc of documents)
        if (doc.id == filter._id)
          return callback(null, doc)
      return callback(null, null)
    })
    for (doc of documents) {
      doc.save = sinon.stub().callsFake(callback => callback(null, doc))
      doc.set = sinon.stub().callsFake(data => {
        if (data.name) doc.name = data.name
        if (data.enabled) doc.enabled = data.enabled
      })
    }
  })

  afterEach(() => {
    res.status.reset()
    res.json.reset()
    res.header.reset()
    next.reset()
    findStub.restore()
    findOneStub.restore()
  })

  describe('Get all users endpoint', () => {

  	it('should return all users including deleted one', (done) => {
      let req = {user: documents[2]}
      crud.findAllUsers(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200)
        let ret = res.json.getCall(0).args[0]
        sinon.assert.match(ret.length, documents.length)
        done()
      }).catch(err => done(err))
    })

    it('should return all users in the same division only', (done) => {
      let req = {user: documents[0]}
      crud.findAllUsers(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200)
        sinon.assert.calledWith(res.json, [
          {
            id: '5aa9359a2b21732a73d5406a',
            name: 'Test User 1',
            username: 'test_user_1',
            email: 'test_user_1@test.com',
            division: {'id':'6aa9359a2b21732a73d5406a', 'name': 'div 1', 'enabled': true},
            enabled: true,
            admin: false
          },
          {
            id: '5aa9359a2b21732a73d5406c',
            name: 'Test User Admin 1',
            username: 'test_user_admin_1',
            email: 'test_user_admin_1@test.com',
            division: {'id':'6aa9359a2b21732a73d5406a', 'name': 'div 1', 'enabled': true},
            enabled: true,
            admin: true
          }
        ])
        done()
      }).catch(err => done(err))
    })

    it('should return only id,name,username,division,enabled,admin field', (done) => {
      let req = {user: documents[2]}
      crud.findAllUsers(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200)
        sinon.assert.calledWith(res.json, [
          {
            id: '5aa9359a2b21732a73d5406a',
            name: 'Test User 1',
            username: 'test_user_1',
            email: 'test_user_1@test.com',
            division: {'id':'6aa9359a2b21732a73d5406a', 'name': 'div 1', 'enabled': true},
            enabled: true,
            admin: false
          },
          {
            id: '5aa9359a2b21732a73d5406b',
            name: 'Test User 2',
            username: 'test_user_2',
            email: 'test_user_2@test.com',
          },
          {
            id: '5aa9359a2b21732a73d5406c',
            name: 'Test User Admin 1',
            username: 'test_user_admin_1',
            email: 'test_user_admin_1@test.com',
            division: {'id':'6aa9359a2b21732a73d5406a', 'name': 'div 1', 'enabled': true},
            enabled: true,
            admin: true
          },
          {
            id: '5aa9359a2b21732a73d5406d',
            name: 'Test User 3',
            username: 'test_user_3',
            email: 'test_user_3@test.com',
            division: {'id':'6aa9359a2b21732a73d5406b', 'name': 'div 2', 'enabled': false}
          }
        ])
        done()
      }).catch(err => done(err))
    })

  })

})
