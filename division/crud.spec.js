var sinon = require('sinon')
var crud = require('./crud')
var division = require('./division')

describe('division crud endpoint test', () => {

  describe('GET all endpoint', () => {
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

})
