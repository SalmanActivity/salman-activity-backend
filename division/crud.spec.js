var sinon = require('sinon')
var assert = require('chai').assert
var crud = require('./crud')
var division = require('./division')

describe('division crud endpoint test', () => {

  describe('GET all division endpoint', () => {
    var req, res, next;
    beforeEach(() => {
      [req, next]  = [sinon.stub(), sinon.stub()]
      res = {status:sinon.stub(), json:sinon.stub(), header:sinon.stub()}
      res.status.returnsThis()
      res.json.returnsThis()
    })

    afterEach(function() {
      res.status.reset()
      res.json.reset()
      res.header.reset()
      req.reset()
      next.reset()
    })

    it('should return all division including deleted one', (done) => {
      let mockedDiv = sinon.stub(division, 'find')
      let documents = [
        {'name': 'some div name', 'enabled': true},
        {'name': 'some div name 2', 'enabled': false},
        {'name': 'some div name 3','enabled': false}
      ]
      mockedDiv.callsFake((filter, callback) => {callback(null, documents)})

      crud.findAllDivisions(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200)
        sinon.assert.calledWith(res.json, documents)
        done()
      }).catch(err => done(err)).then(() => mockedDiv.restore())
    })

    it('should return empty division with staus code 200', (done) => {
      let mockedDiv = sinon.stub(division, 'find')
      mockedDiv.callsFake((filter, callback) => {callback(null, [])})

      crud.findAllDivisions(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200)
        sinon.assert.calledWith(res.json, [])
        done()
      }).catch(err => done(err)).then(() => mockedDiv.restore())
    })

    it('should return only id,name,enabled field', (done) => {
      let mockedDiv = sinon.stub(division, 'find')
      let documents = [
        {'name': 'some div name', 'enabled': true, 'secret':1},
        {'name': 'some div name 2', 'enabled': false, 'id':3, 'secret':'key'},
        {'name': 'some div name 3','enabled': false, 'sec':4}
      ]
      mockedDiv.callsFake((filter, callback) => {callback(null, documents)})

      crud.findAllDivisions(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200)
        sinon.assert.calledWith(res.json, [
          {'name': 'some div name', 'enabled': true},
          {'name': 'some div name 2', 'enabled': false, 'id':3},
          {'name': 'some div name 3','enabled': false}
        ])
        done()
      }).catch(err => done(err)).then(() => mockedDiv.restore())
    })

  })

  describe('GET specific division endpoint', () => {
    var req = {}, res, next, mockedDiv;
    beforeEach(() => {
      next = sinon.stub()
      res = {status:sinon.stub(), json:sinon.stub(), header:sinon.stub()}
      res.status.returnsThis()
      res.json.returnsThis()

      mockedDiv = sinon.stub(division, 'findOne')
      let documents = [
        {'id':'5aa9359a2b21732a73d5406a', 'name': 'div 1', 'enabled': true},
        {'id':'5aa9359a2b21732a73d5406b', 'name': 'div 2', 'enabled': false},
        {'id':'5aa9359a2b21732a73d5406c', 'name': 'div 3', 'enabled': true},
        {
          'id':'5aa9359a2b21732a73d5406d',
          'name': 'div 4',
          'enabled': true,
          'secret': 'somesecretvalue'
        }
      ]
      mockedDiv.callsFake((filter, callback) => {
        for (doc of documents)
          if (doc.id == filter._id)
            return callback(null, doc)
        return callback(null, null)
      })
    })

    afterEach(function() {
      res.status.reset()
      res.json.reset()
      res.header.reset()
      next.reset()
    })

    it('should return specific division', (done) => {
      let req = {params: {divisionId: '5aa9359a2b21732a73d5406a'}}
      crud.findOneDivision(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200)
        sinon.assert.calledWith(res.json, {'id':'5aa9359a2b21732a73d5406a', 'name': 'div 1', 'enabled': true})
        done()
      }).catch(err => done(err)).then(() => mockedDiv.restore())
    })

    it('should return specific division even it has been deleted', (done) => {
      let req = {params: {divisionId: '5aa9359a2b21732a73d5406b'}}
      crud.findOneDivision(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200)
        sinon.assert.calledWith(res.json, {'id':'5aa9359a2b21732a73d5406b', 'name': 'div 2', 'enabled': false})
        done()
      }).catch(err => done(err)).then(() => mockedDiv.restore())
    })

    it('should return 404 not found if division doesnt exists', (done) => {
      let req = {params: {divisionId: '5aa9359a2b21732a73d5406e'}}
      crud.findOneDivision(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 404)
        assert.notEqual(res.json.getCall(0).args[0].error, null)
        done()
      }).catch(err => done(err)).then(() => mockedDiv.restore())
    })

    it('should return field only id,name,enabled', (done) => {
      let req = {params: {divisionId: '5aa9359a2b21732a73d5406d'}}
      crud.findOneDivision(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200)
        sinon.assert.calledWith(res.json, {'id':'5aa9359a2b21732a73d5406d', 'name': 'div 4','enabled': true,})
        done()
      }).catch(err => done(err)).then(() => mockedDiv.restore())
    })

  })

})
