var sinon = require('sinon')
var assert = require('chai').assert
var crud = require('./crud')
var division = require('./division')

describe('division crud endpoint test', () => {

  let documents = [], findStub, findOneStub, req = {}, res, next
  beforeEach(() => {
    next = sinon.stub()
    res = {status:sinon.stub(), json:sinon.stub(), header:sinon.stub()}
    res.status.returnsThis()
    res.json.returnsThis()

    documents = [
      {'id':'5aa9359a2b21732a73d5406a', 'name': 'div 1', 'enabled': true},
      {'id':'5aa9359a2b21732a73d5406b', 'name': 'div 2', 'enabled': false},
      {'id':'5aa9359a2b21732a73d5406c', 'name': 'div 3', 'enabled': true},
      {
        'id':'5aa9359a2b21732a73d5406d',
        'name': 'div 4',
        'enabled': false,
        'secret': 'somesecretvalue'
      }
    ]

    findStub = sinon.stub(division, 'find').callsFake((filter, callback) => {callback(null, documents)})
    findOneStub = sinon.stub(division, 'findOne').callsFake((filter, callback) => {
      for (doc of documents)
        if (doc.id == filter._id)
          return callback(null, doc)
      return callback(null, null)
    })
    for (doc of documents)
      doc.save = sinon.stub().callsFake(callback => callback(null, doc))
  })

  afterEach(() => {
    res.status.reset()
    res.json.reset()
    res.header.reset()
    next.reset()
    findStub.restore()
    findOneStub.restore()
  })

  describe('GET all division endpoint', () => {
    it('should return all division including deleted one', (done) => {
      crud.findAllDivisions(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200)
        sinon.assert.calledWith(res.json, [
          {'id':'5aa9359a2b21732a73d5406a', 'name': 'div 1', 'enabled': true},
          {'id':'5aa9359a2b21732a73d5406b', 'name': 'div 2', 'enabled': false},
          {'id':'5aa9359a2b21732a73d5406c', 'name': 'div 3', 'enabled': true},
          {'id':'5aa9359a2b21732a73d5406d', 'name': 'div 4','enabled': false}
        ])
        done()
      }).catch(err => done(err))
    })

    it('should return empty division with status code 200', (done) => {
      let temp = documents
      documents = []
      crud.findAllDivisions(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200)
        sinon.assert.calledWith(res.json, [])
        done()
      }).catch(err => done(err)).then(() => documents = temp)
    })

    it('should return only id,name,enabled field', (done) => {
      crud.findAllDivisions(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200)
        sinon.assert.calledWith(res.json, [
          {'id':'5aa9359a2b21732a73d5406a', 'name': 'div 1', 'enabled': true},
          {'id':'5aa9359a2b21732a73d5406b', 'name': 'div 2', 'enabled': false},
          {'id':'5aa9359a2b21732a73d5406c', 'name': 'div 3', 'enabled': true},
          {'id':'5aa9359a2b21732a73d5406d', 'name': 'div 4','enabled': false}
        ])
        done()
      }).catch(err => done(err))
    })

  })

  describe('GET specific division endpoint', () => {
    it('should return specific division', (done) => {
      let req = {params: {divisionId: '5aa9359a2b21732a73d5406a'}}
      crud.findOneDivision(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200)
        sinon.assert.calledWith(res.json, {'id':'5aa9359a2b21732a73d5406a', 'name': 'div 1', 'enabled': true})
        done()
      }).catch(err => done(err))
    })

    it('should return specific division even it has been deleted', (done) => {
      let req = {params: {divisionId: '5aa9359a2b21732a73d5406b'}}
      crud.findOneDivision(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200)
        sinon.assert.calledWith(res.json, {'id':'5aa9359a2b21732a73d5406b', 'name': 'div 2', 'enabled': false})
        done()
      }).catch(err => done(err))
    })

    it('should return 404 not found if division doesnt exists', (done) => {
      let req = {params: {divisionId: '5aa9359a2b21732a73d5406e'}}
      crud.findOneDivision(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 404)
        assert.notEqual(res.json.getCall(0).args[0].error, null)
        done()
      }).catch(err => done(err))
    })

    it('should return field only id,name,enabled', (done) => {
      let req = {params: {divisionId: '5aa9359a2b21732a73d5406d'}}
      crud.findOneDivision(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200)
        sinon.assert.calledWith(res.json, {'id':'5aa9359a2b21732a73d5406d', 'name': 'div 4','enabled': false})
        done()
      }).catch(err => done(err))
    })

  })

  describe('DELETE specific division endpoint', () => {

    it('should change division enabled to false', (done) => {
      let req = {params: {divisionId: '5aa9359a2b21732a73d5406a'}}
      crud.deleteOneDivision(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 202)
        sinon.assert.calledWith(res.json, {'id':'5aa9359a2b21732a73d5406a', 'name': 'div 1', 'enabled': false})
        done()
      }).catch(err => done(err))
    })
    it('should keep deleted division enabled to false', (done) => {
      let req = {params: {divisionId: '5aa9359a2b21732a73d5406b'}}
      crud.deleteOneDivision(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 202)
        sinon.assert.calledWith(res.json, {'id':'5aa9359a2b21732a73d5406b', 'name': 'div 2', 'enabled': false})
        done()
      }).catch(err => done(err))
    })
    it('should return 404 error status when division not found', (done) => {
      let req = {params: {divisionId: '5aa9359a2b21732a73d5406f'}}
      crud.deleteOneDivision(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 404)
        assert.notEqual(res.json.getCall(0).args[0].error, null)
        done()
      }).catch(err => done(err))
    })

  })

  describe('POST specific division endpoint', () => {

    it('should add new division', (done) => {
      done()
    })
    it('should return 400 and send validation error when name is invalid', (done) => {
      done()
    })
    it('should return 400 and send validation error when name is missing', (done) => {
      done()
    })

  })

  describe('PUT specific division endpoint', () => {

    it('should change new division name', (done) => {
      done()
    })
    it('should return 404 when division id not found', (done) => {
      done()
    })
    it('should return 400 and send validation error when name is invalid', (done) => {
      done()
    })
    it('should return 400 and send validation error when name is missing', (done) => {
      done()
    })

  })

})
