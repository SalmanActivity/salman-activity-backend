var sinon = require('sinon')
var assert = require('chai').assert
var crud = require('./crud')
var user = require('./user')
var division = require('../division/division')
var passwordHash = require('password-hash')
var ObjectId = require('mongoose').Types.ObjectId

describe('user crud endpoint test', () => {
  let documents = [], findStub, findOneStub, populateStub, req = {}, res, next

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
        division: {'id':'6aa9359a2b21732a73d5406b', 'name': 'div 2', 'enabled': false},
        enabled: false,
      },
    ]

    findStub = sinon.stub(user, 'find').callsFake((filter, callback) => {callback(null, documents)})
    populateStub = sinon.stub(user, 'populate').returnsThis()
    findOneStub = sinon.stub(user, 'findOne').callsFake((filter, callback) => {
      for (doc of documents)
        if ((!filter._id || doc.id == filter._id) &&
            (!filter.username || doc.username == filter.username) &&
            (!filter.email || doc.email == filter.email))
          return callback(null, doc)
      return callback(null, null)
    })
    for (doc of documents) {
      doc.save = sinon.stub().callsFake(callback => callback(null, doc))
      doc.set = sinon.stub().callsFake(data => {
        if (data.name) doc.name = data.name
        if (data.username) doc.username = data.username
        if (data.email) doc.email = data.email
        if (data.password) doc.password = data.password
        if (data.division) doc.division = data.division
        if (data.enabled) doc.enabled = data.enabled
        if (data.admin) doc.admin = data.admin
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
    populateStub.restore()
  })

  describe('GET all users endpoint', () => {

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
            division: {'id':'6aa9359a2b21732a73d5406b', 'name': 'div 2', 'enabled': false},
            enabled:false
          }
        ])
        done()
      }).catch(err => done(err))
    })

  })

  describe('GET specific user endpoint', () => {

    it('should return specific user if admin', (done) => {
      let req = {params: {userId: '5aa9359a2b21732a73d5406a'}, user: {admin:true}}
      crud.findOneUser(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200)
        sinon.assert.calledWith(res.json, {
          id: '5aa9359a2b21732a73d5406a',
          name: 'Test User 1',
          username: 'test_user_1',
          email: 'test_user_1@test.com',
          division: {'id':'6aa9359a2b21732a73d5406a', 'name': 'div 1', 'enabled': true},
          enabled: true,
          admin: false
        })
        done()
      }).catch(err => done(err))
    })

    it('should return specific user if user same division', (done) => {
      let req = {params: {userId: '5aa9359a2b21732a73d5406a'}, user:{
        admin:false, division: {'id':'6aa9359a2b21732a73d5406a', 'name': 'div 2', 'enabled': false}
      }}
      crud.findOneUser(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200)
        sinon.assert.calledWith(res.json, {
          id: '5aa9359a2b21732a73d5406a',
          name: 'Test User 1',
          username: 'test_user_1',
          email: 'test_user_1@test.com',
          division: {'id':'6aa9359a2b21732a73d5406a', 'name': 'div 1', 'enabled': true},
          enabled: true,
          admin: false
        })
        done()
      }).catch(err => done(err))
    })

    it('should return specific user even if it has been deleted', (done) => {
      let req = {params: {userId: '5aa9359a2b21732a73d5406d'}, user: {admin:true}}
      crud.findOneUser(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200)
        sinon.assert.calledWith(res.json, {
          id: '5aa9359a2b21732a73d5406d',
          name: 'Test User 3',
          username: 'test_user_3',
          email: 'test_user_3@test.com',
          division: {'id':'6aa9359a2b21732a73d5406b', 'name': 'div 2', 'enabled': false},
          enabled:false
        })
        done()
      }).catch(err => done(err))
    })

    it('should return 404 not found if user doesnt exists', (done) => {
      let req = {params: {userId: '5aa9359a2b21732a73d540ff'}}
      crud.findOneUser(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 404)
        assert.notEqual(res.json.getCall(0).args[0].error, null)
        done()
      }).catch(err => done(err))
    })

    it('should return 404 not found if user id not 24 hex string', (done) => {
      let req = {params: {userId: 'jauhararifin'}}
      crud.findOneUser(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 404)
        assert.notEqual(res.json.getCall(0).args[0].error, null)
        done()
      }).catch(err => done(err))
    })

    it('should return 404 not found if user is not in current user division, and current user is not admin', (done) => {
      let req = {params: {userId: '5aa9359a2b21732a73d5406d'}, user:{
        admin:false, division:{'id':'6aa9359a2b21732a73d5406a', 'name': 'div 1', 'enabled': true}
      }}
      crud.findOneUser(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 404)
        assert.notEqual(res.json.getCall(0).args[0].error, null)
        done()
      }).catch(err => done(err))
    })

  })

  describe('DELETE specific user endpoint', () => {

    it('should change user enabled to false', (done) => {
      let req = {params: {userId: '5aa9359a2b21732a73d5406a'}}
      crud.deleteOneUser(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 202)
        let ret = res.json.getCall(0).args[0]
        sinon.assert.match(ret.enabled, false)
        done()
      }).catch(err => done(err))
    })

    it('should keep deleted user enabled to false', (done) => {
      let req = {params: {userId: '5aa9359a2b21732a73d5406b'}}
      crud.deleteOneUser(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 202)
        let ret = res.json.getCall(0).args[0]
        sinon.assert.match(ret.enabled, false)
        done()
      }).catch(err => done(err))
    })

    it('should return 404 error status when user not found', (done) => {
      let req = {params: {userId: '5aa9359a2b21732a73d540ff'}}
      crud.deleteOneUser(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 404)
        assert.notEqual(res.json.getCall(0).args[0].error, null)
        done()
      }).catch(err => done(err))
    })

  })

  let prepareDivision = (divDocuments, divFindStub, divFindOneStub) => {
    beforeEach(() => {
      divDocuments = [
        {'id':'6aa9359a2b21732a73d5406a', 'name': 'div 1', 'enabled': true},
        {'id':'6aa9359a2b21732a73d5406b', 'name': 'div 2', 'enabled': false}
      ]

      divFindStub = sinon.stub(division, 'find').callsFake((filter, callback) => {callback(null, divDocuments)})
      divFindOneStub = sinon.stub(division, 'findOne').callsFake((filter, callback) => {
        for (doc of divDocuments)
          if (doc.id == filter._id)
            return callback(null, doc)
        return callback(null, null)
      })
      for (doc of divDocuments) {
        doc.save = sinon.stub().callsFake(callback => callback(null, doc))
        doc.set = sinon.stub().callsFake(data => {
          if (data.name) doc.name = data.name
          if (data.enabled) doc.enabled = data.enabled
        })
      }
    })

    afterEach(() => {
      divFindStub.restore()
      divFindOneStub.restore()
    })
  }

  describe('POST specific user endpoint', () => {

    let divDocuments, divFindStub, divFindOneStub
    prepareDivision(divDocuments, divFindStub, divFindOneStub)

    it('should add new user', (done) => {
      let req = {body: {
        name: 'Test User 7',
        username: 'test_user_7',
        email: 'test_user_7@test.com',
        password: 'test_user_7_pass',
        division: '6aa9359a2b21732a73d5406a',
        enabled: true,
        admin: false
      }}
      let saveStub = sinon.stub(user.prototype, 'save').callsFake(cb => cb(null, {
        id: new ObjectId(),
        name: 'Test User 7',
        username: 'test_user_7',
        email: 'test_user_7@test.com',
        password: passwordHash.generate('test_user_7_pass'),
        division: {'id':'6aa9359a2b21732a73d5406a', 'name': 'div 1', 'enabled': true},
        enabled: true,
        admin: false
      }))
      crud.createOneUser(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200)
        let response = res.json.getCall(0).args[0]
        sinon.assert.match(response.username, 'test_user_7')
        sinon.assert.match(response.division, {'id':'6aa9359a2b21732a73d5406a', 'name': 'div 1', 'enabled': true})
        done()
        saveStub.restore()
      }).catch(err => { done(err); saveStub.restore() })
    })

    let validationTest = (body, done) => {
      crud.createOneUser({body}, res, next).then(() => {
        sinon.assert.calledWith(res.status, 400)
        assert.notEqual(res.json.getCall(0).args[0].error, null)
        done()
      }).catch(err => done(err))
    }

    it('should return 400 and send validation error when name is too short', (done) => {
      validationTest({
        name: 'ab',
        username: 'test_user_7',
        email: 'test_user_7@test.com',
        password: 'test_user_7_pass',
        division: '6aa9359a2b21732a73d5406a',
        enabled: true,
        admin: false
      }, done)
    })

    it('should return 400 and send validation error when name is too long', (done) => {
      validationTest({
        name: new Array(256+1).join('x'),
        username: 'test_user_7',
        email: 'test_user_7@test.com',
        password: 'test_user_7_pass',
        division: '6aa9359a2b21732a73d5406a',
        enabled: true,
        admin: false
      }, done)
    })

    it('should return 400 and send validation error when name is missing', (done) => {
      validationTest({
        username: 'test_user_7',
        email: 'test_user_7@test.com',
        password: 'test_user_7_pass',
        division: '6aa9359a2b21732a73d5406a',
        enabled: true,
        admin: false
      }, done)
    })
    it('should return 400 and send validation error when username is too short', (done) => {
      validationTest({
        name: 'Test User 7',
        username: 'aa',
        email: 'test_user_7@test.com',
        password: 'test_user_7_pass',
        division: '6aa9359a2b21732a73d5406a',
        enabled: true,
        admin: false
      }, done)
    })

    it('should return 400 and send validation error when username is too long', (done) => {
      validationTest({
        name: 'Test User 7',
        username: new Array(256+1).join('x'),
        email: 'test_user_7@test.com',
        password: 'test_user_7_pass',
        division: '6aa9359a2b21732a73d5406a',
        enabled: true,
        admin: false
      }, done)
    })

    it('should return 400 and send validation error when username is missing', (done) => {
      validationTest({
        name: 'Test User 7',
        email: 'test_user_7@test.com',
        password: 'test_user_7_pass',
        division: '6aa9359a2b21732a73d5406a',
        enabled: true,
        admin: false
      }, done)
    })

    it('should return 400 and send validation error when username is used', (done) => {
      validationTest({
        name: 'Test User 7',
        username: 'test_user_1',
        email: 'test_user_7@test.com',
        password: 'test_user_7_pass',
        division: '6aa9359a2b21732a73d5406a',
        enabled: true,
        admin: false
      }, done)
    })

    it('should return 400 and send validation error when email is invalid', (done) => {
      validationTest({
        name: 'Test User 7',
        username: 'test_user_7',
        email: 'test_user_7_test.com',
        password: 'test_user_7_pass',
        division: '6aa9359a2b21732a73d5406a',
        enabled: true,
        admin: false
      }, done)
    })

    it('should return 400 and send validation error when email is too short', (done) => {
      validationTest({
        name: 'Test User 7',
        username: 'test_user_7',
        email: 'a@',
        password: 'test_user_7_pass',
        division: '6aa9359a2b21732a73d5406a',
        enabled: true,
        admin: false
      }, done)
    })

    it('should return 400 and send validation error when email is too long', (done) => {
      validationTest({
        name: 'Test User 7',
        username: 'test_user_7',
        email: 'a@' + new Array(250+1).join('x') + '.com',
        password: 'test_user_7_pass',
        division: '6aa9359a2b21732a73d5406a',
        enabled: true,
        admin: false
      }, done)
    })

    it('should return 400 and send validation error when email is missing', (done) => {
      validationTest({
        name: 'Test User 7',
        username: 'test_user_7',
        password: 'test_user_7_pass',
        division: '6aa9359a2b21732a73d5406a',
        enabled: true,
        admin: false
      }, done)
    })

    it('should return 400 and send validation error when email is used', (done) => {
      validationTest({
        name: 'Test User 7',
        username: 'test_user_7',
        email: 'test_user_1@test.com',
        password: 'test_user_7_pass',
        division: '6aa9359a2b21732a73d5406a',
        enabled: true,
        admin: false
      }, done)
    })

    it('should return 400 and send validation error when password is too short', (done) => {
      validationTest({
        name: 'Test User 7',
        username: 'test_user_7',
        email: 'test_user_7@test.com',
        password: 'aa',
        division: '6aa9359a2b21732a73d5406a',
        enabled: true,
        admin: false
      }, done)
    })

    it('should return 400 and send validation error when password is too long', (done) => {
      validationTest({
        name: 'Test User 7',
        username: 'test_user_7',
        email: 'test_user_7@test.com',
        password: new Array(101+1).join('x'),
        division: '6aa9359a2b21732a73d5406a',
        enabled: true,
        admin: false
      }, done)
    })

    it('should return 400 and send validation error when password is missing', (done) => {
      validationTest({
        name: 'Test User 7',
        username: 'test_user_7',
        email: 'test_user_7@test.com',
        division: '6aa9359a2b21732a73d5406a',
        enabled: true,
        admin: false
      }, done)
    })

    it('should return 400 and send validation error when division is invalid', (done) => {
      validationTest({
        name: 'Test User 7',
        username: 'test_user_7',
        email: 'test_user_7@test.com',
        password: 'test_user_7_pass',
        division: 'xxxxxxxxxxxxxxxxxx',
        enabled: true,
        admin: false
      }, done)
    })

    it('should return 400 and send validation error when division is not found', (done) => {
      validationTest({
        name: 'Test User 7',
        username: 'test_user_7',
        email: 'test_user_7@test.com',
        password: 'test_user_7_pass',
        division: '6aa9359a2b21732a73d540ff',
        enabled: true,
        admin: false
      }, done)
    })

    it('should return 400 and send validation error when enabled is invalid', (done) => {
      validationTest({
        name: 'Test User 7',
        username: 'test_user_7',
        email: 'test_user_7@test.com',
        password: 'test_user_7_pass',
        division: '6aa9359a2b21732a73d5406a',
        enabled: 'jauhar',
        admin: false
      }, done)
    })

    it('should return 400 and send validation error when admin is invalid', (done) => {
      validationTest({
        name: 'Test User 7',
        username: 'test_user_7',
        email: 'test_user_7@test.com',
        password: 'test_user_7_pass',
        division: '6aa9359a2b21732a73d5406a',
        enabled: true,
        admin: 'arifin'
      }, done)
    })

  })

  describe('PUT specific user endpoint', () => {

    let divDocuments, divFindStub, divFindOneStub
    prepareDivision(divDocuments, divFindStub, divFindOneStub)

    it('should change new user', (done) => {
      let req = {
        params: {userId: '5aa9359a2b21732a73d5406a'},
        body: {
          name: 'Jauhar Arifin',
          username: 'jauhararifin',
          email: 'jauhararifin10@gmail.com',
          password: 'jauhararifin_pass',
          division: '6aa9359a2b21732a73d5406b',
          enabled: false,
          admin: true
        }
      }
      crud.updateOneUser(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200)
        let response = res.json.getCall(0).args[0]
        sinon.assert.match(response.name, 'Jauhar Arifin')
        sinon.assert.match(response.username, 'jauhararifin')
        sinon.assert.match(response.email, 'jauhararifin10@gmail.com')
        sinon.assert.match(response.division.id, '6aa9359a2b21732a73d5406b')
        done()
      }).catch(err => done(err))
    })

    it('should change new user with some field', (done) => {
      let req = {
        params: {userId: '5aa9359a2b21732a73d5406a'},
        body: { name: 'Jauhar Arifin' }
      }
      crud.updateOneUser(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200)
        let response = res.json.getCall(0).args[0]
        sinon.assert.match(response.name, 'Jauhar Arifin')
        sinon.assert.match(response.username, 'test_user_1')
        done()
      }).catch(err => done(err))
    })

    it('should keep username', (done) => {
      let req = {
        params: {userId: '5aa9359a2b21732a73d5406a'},
        body: { username: 'test_user_1' }
      }
      crud.updateOneUser(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200)
        let response = res.json.getCall(0).args[0]
        sinon.assert.match(response.username, 'test_user_1')
        done()
      }).catch(err => done(err))
    })

    it('should return 400 when username is taken', (done) => {
      let req = {
        params: {userId: '5aa9359a2b21732a73d5406a'},
        body: { username: 'test_user_2' }
      }
      crud.updateOneUser(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 400)
        assert.notEqual(res.json.getCall(0).args[0].error, null)
        done()
      }).catch(err => done(err))
    })

    it('should return 400 when email is taken', (done) => {
      let req = {
        params: {userId: '5aa9359a2b21732a73d5406a'},
        body: { email: 'test_user_admin_1@test.com' }
      }
      crud.updateOneUser(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 400)
        assert.notEqual(res.json.getCall(0).args[0].error, null)
        done()
      }).catch(err => done(err))
    })

    it('should return 404 when user id not found', (done) => {
      let req = {params: {userId: '6aa9359a2b21732a73d5406a'}}
      crud.updateOneUser(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 404)
        assert.notEqual(res.json.getCall(0).args[0].error, null)
        done()
      }).catch(err => done(err))
    })

  })
})
