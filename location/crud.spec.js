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

  })


})