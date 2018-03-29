var sinon = require('sinon')
var assert = require('chai').assert
var crud = require('./crud')
var location = require('./location')
var ObjectId = require('mongoose').Types.ObjectId


describe('location crud endpoint test', () => {
	let documents = [], findStub, findOneStub, req = {}, res, next
  beforeEach(() => {
	  next = sinon.stub()
	  res = {status:sinon.stub(), json:sinon.stub(), header:sinon.stub()}
	  res.status.returnsThis()
	  res.json.returnsThis()

	  documents = [
	    {'id':'5aa9359a2b21732a73d5406a', 'name': 'loc 1', 'enabled': true},
	    {'id':'5aa9359a2b21732a73d5406b', 'name': 'loc 2', 'enabled': false},
	    {'id':'5aa9359a2b21732a73d5406c', 'name': 'loc 3', 'enabled': true},
	    {
	      'id':'5aa9359a2b21732a73d5406d',
	      'name': 'loc 4',
	      'enabled': false,
	      'secret': 'somesecretvalue'
	    }
	  ]

	  findStub = sinon.stub(location, 'find').callsFake((filter, callback) => {callback(null, documents)})
	  findOneStub = sinon.stub(location, 'findOne').callsFake((filter, callback) => {
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

  describe('Get all location endpoint', () => {
  	it('should return all location including deleted one', (done) => {
      crud.findAllLocations(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200)
        sinon.assert.calledWith(res.json, [
          {'id':'5aa9359a2b21732a73d5406a', 'name': 'loc 1', 'enabled': true},
          {'id':'5aa9359a2b21732a73d5406b', 'name': 'loc 2', 'enabled': false},
          {'id':'5aa9359a2b21732a73d5406c', 'name': 'loc 3', 'enabled': true},
          {'id':'5aa9359a2b21732a73d5406d', 'name': 'loc 4', 'enabled': false}
        ])
        done()
      }).catch(err => done(err))
    })

    it('should return empty location with status code 200', (done) => {
      let temp = documents
      documents = []
      crud.findAllLocations(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200)
        sinon.assert.calledWith(res.json, [])
        done()
      }).catch(err => done(err)).then(() => documents = temp)
    })

    it('should return only id,name,enabled field', (done) => {
      crud.findAllLocations(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200)
        sinon.assert.calledWith(res.json, [
          {'id':'5aa9359a2b21732a73d5406a', 'name': 'loc 1', 'enabled': true},
          {'id':'5aa9359a2b21732a73d5406b', 'name': 'loc 2', 'enabled': false},
          {'id':'5aa9359a2b21732a73d5406c', 'name': 'loc 3', 'enabled': true},
          {'id':'5aa9359a2b21732a73d5406d', 'name': 'loc 4','enabled': false}
        ])
        done()
      }).catch(err => done(err))
    })

  })

  describe('GET specific location endpoint', () => {
  	it('should return specific location', (done) => {
      let req = {params: {locationId: '5aa9359a2b21732a73d5406a'}}
      crud.findOneLocation(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200)
        sinon.assert.calledWith(res.json, {'id':'5aa9359a2b21732a73d5406a', 'name': 'loc 1', 'enabled': true})
        done()
      }).catch(err => done(err))
    })

    it('should return specific location even it has been deleted', (done) => {
      let req = {params: {locationId: '5aa9359a2b21732a73d5406b'}}
      crud.findOneLocation(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200)
        sinon.assert.calledWith(res.json, {'id':'5aa9359a2b21732a73d5406b', 'name': 'loc 2', 'enabled': false})
        done()
      }).catch(err => done(err))
    })

    it('should return 404 not found if id is invalid', (done) => {
      let req = {params: {locationId: 'ab*1'}}
      crud.findOneLocation(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 404)
        assert.notEqual(res.json.getCall(0).args[0].error, null)
        done()
      }).catch(err => done(err))
    })

    it('should return 404 not found if division doesnt exists', (done) => {
      let req = {params: {locationId: '5aa9359a2b21732a73d5406e'}}
      crud.findOneLocation(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 404)
        assert.notEqual(res.json.getCall(0).args[0].error, null)
        done()
      }).catch(err => done(err))
    })

    it('should return field only id,name,enabled', (done) => {
      let req = {params: {locationId: '5aa9359a2b21732a73d5406d'}}
      crud.findOneLocation(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200)
        sinon.assert.calledWith(res.json, {'id':'5aa9359a2b21732a73d5406d', 'name': 'loc 4','enabled': false})
        done()
      }).catch(err => done(err))
    })

  })

  describe('DELETE specific location endpoint', () => {

    it('should change location enabled to false', (done) => {
      let req = {params: {locationId: '5aa9359a2b21732a73d5406a'}}
      crud.deleteOneLocation(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 202)
        sinon.assert.calledWith(res.json, {'id':'5aa9359a2b21732a73d5406a', 'name': 'loc 1', 'enabled': false})
        done()
      }).catch(err => done(err))
    })

    it('should keep deleted location enabled to false', (done) => {
      let req = {params: {locationId: '5aa9359a2b21732a73d5406b'}}
      crud.deleteOneLocation(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 202)
        sinon.assert.calledWith(res.json, {'id':'5aa9359a2b21732a73d5406b', 'name': 'loc 2', 'enabled': false})
        done()
      }).catch(err => done(err))
    })

    it('should return 404 error status when location not found', (done) => {
      let req = {params: {locationId: '5aa9359a2b21732a73d5406f'}}
      crud.deleteOneLocation(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 404)
        assert.notEqual(res.json.getCall(0).args[0].error, null)
        done()
      }).catch(err => done(err))
    })

  })

  describe('POST specific location endpoint', () => {

    it('should add new location', (done) => {
      let req = {body: {name: 'new location'}}
      let saveStub = sinon.stub(location.prototype, 'save').callsFake(cb => {
        documents.push({
          id: new ObjectId(),
          name: 'new location',
          enabled: true
        })
        cb(null, documents[documents.length-1])
      })
      crud.createOneLocation(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200)
        let response = res.json.getCall(0).args[0]
        sinon.assert.match(response.name, 'new location')
        done()
      }).catch(err => done(err))
    })
    
    it('should return 400 and send validation error when name is too short', (done) => {
      let req = {body: {name: 'ab'}}
      crud.createOneLocation(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 400)
        assert.notEqual(res.json.getCall(0).args[0].error, null)
        done()
      }).catch(err => done(err))
    })

    it('should return 400 and send validation error when name is too short', (done) => {
      let req = {body: {name: new Array(256+1).join('x')}}
      crud.createOneLocation(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 400)
        assert.notEqual(res.json.getCall(0).args[0].error, null)
        done()
      }).catch(err => done(err))
    })

    it('should return 400 and send validation error when name is missing', (done) => {
      let req = {body: {}}
      crud.createOneLocation(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 400)
        assert.notEqual(res.json.getCall(0).args[0].error, null)
        done()
      }).catch(err => done(err))
    })

  })

  describe('PUT specific location endpoint', () => {

    it('should change new location name', (done) => {
      let req = {
        params: {locationId: '5aa9359a2b21732a73d5406a'},
        body: {name: 'update location name'}
      }
      crud.updateOneLocation(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200)
        sinon.assert.calledWith(res.json, {'id':'5aa9359a2b21732a73d5406a', 'name': 'update location name', 'enabled': true})
        done()
      }).catch(err => done(err))
    })

    it('should return 404 when location id not found', (done) => {
      let req = {params: {locationId: '5aa9359a2b21732a73d5406f'}}
      crud.updateOneLocation(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 404)
        assert.notEqual(res.json.getCall(0).args[0].error, null)
        done()
      }).catch(err => done(err))
    })

    it('should return 400 and send validation error when name too short', (done) => {
      let req = {
        params: {locationId: '5aa9359a2b21732a73d5406a'},
        body: {name: 'x'}
      }
      crud.updateOneLocation(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 400)
        assert.notEqual(res.json.getCall(0).args[0].error, null)
        done()
      }).catch(err => done(err))
    })
    
    it('should return 400 and send validation error when name too long', (done) => {
      let req = {
        params: {locationId: '5aa9359a2b21732a73d5406a'},
        body: {name: new Array(256+1).join('x')}
      }
      crud.updateOneLocation(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 400)
        assert.notEqual(res.json.getCall(0).args[0].error, null)
        done()
      }).catch(err => done(err))
    })
    
    it('should return 400 and send validation error when name is missing', (done) => {
      let req = {
        params: {locationId: '5aa9359a2b21732a73d5406a'},
        body: {}
      }
      crud.updateOneLocation(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 400)
        assert.notEqual(res.json.getCall(0).args[0].error, null)
        done()
      }).catch(err => done(err))
    })

  })




})