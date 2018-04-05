import * as sinon from 'sinon'
import { assert } from 'chai'
import * as crud from './crud'
import { DivisionAccessor } from '.'
import { InMemoryAccessor } from '../accessor'

describe('division crud endpoint test', () => {

  let documents = [], req = {}, res, next, divisionAccessor:DivisionAccessor
  let findAllDivisionsEndpoint,
      findOneDivisionEndpoint,
      createOneDivisionEndpoint,
      deleteOneDivisionEndpoint,
      updateOneDivisionEndpoint
  
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
    divisionAccessor = new InMemoryAccessor(documents)
    findAllDivisionsEndpoint = crud.findAllDivisions(divisionAccessor)
    findOneDivisionEndpoint = crud.findOneDivision(divisionAccessor)
    createOneDivisionEndpoint = crud.createOneDivision(divisionAccessor)
    deleteOneDivisionEndpoint = crud.deleteOneDivision(divisionAccessor)
    updateOneDivisionEndpoint = crud.updateOneDivision(divisionAccessor)
  })

  afterEach(() => {
    res.status.reset()
    res.json.reset()
    res.header.reset()
    next.reset()
  })

  describe('GET all division endpoint', () => {
    it('should return all division including deleted one', (done) => {
      findAllDivisionsEndpoint(req, res, next).then(() => {
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
      divisionAccessor = new InMemoryAccessor([])
      findAllDivisionsEndpoint = crud.findAllDivisions(divisionAccessor)
      findAllDivisionsEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200)
        sinon.assert.calledWith(res.json, [])
        done()
      }).catch(err => done(err))
    })

    it('should return only id,name,enabled field', (done) => {
      findAllDivisionsEndpoint(req, res, next).then(() => {
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
      findOneDivisionEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200)
        sinon.assert.calledWith(res.json, {'id':'5aa9359a2b21732a73d5406a', 'name': 'div 1', 'enabled': true})
        done()
      }).catch(err => done(err))
    })

    it('should return specific division even it has been deleted', (done) => {
      let req = {params: {divisionId: '5aa9359a2b21732a73d5406b'}}
      findOneDivisionEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200)
        sinon.assert.calledWith(res.json, {'id':'5aa9359a2b21732a73d5406b', 'name': 'div 2', 'enabled': false})
        done()
      }).catch(err => done(err))
    })

    it('should return 404 not found if division id invalid', (done) => {
      let req = {params: {divisionId: '5aa93'}}
      findOneDivisionEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 404)
        assert.notEqual(res.json.getCall(0).args[0].error, null)
        done()
      }).catch(err => done(err))
    })

    it('should return 404 not found if division doesnt exists', (done) => {
      let req = {params: {divisionId: '5aa9359a2b21732a73d5406e'}}
      findOneDivisionEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 404)
        assert.notEqual(res.json.getCall(0).args[0].error, null)
        done()
      }).catch(err => done(err))
    })

    it('should return field only id,name,enabled', (done) => {
      let req = {params: {divisionId: '5aa9359a2b21732a73d5406d'}}
      findOneDivisionEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200)
        sinon.assert.calledWith(res.json, {'id':'5aa9359a2b21732a73d5406d', 'name': 'div 4','enabled': false})
        done()
      }).catch(err => done(err))
    })

  })

  describe('DELETE specific division endpoint', () => {

    it('should change division enabled to false', (done) => {
      let req = {params: {divisionId: '5aa9359a2b21732a73d5406a'}}
      deleteOneDivisionEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 202)
        sinon.assert.calledWith(res.json, {'id':'5aa9359a2b21732a73d5406a', 'name': 'div 1', 'enabled': false})
        done()
      }).catch(err => done(err))
    })
    it('should keep deleted division enabled to false', (done) => {
      let req = {params: {divisionId: '5aa9359a2b21732a73d5406b'}}
      deleteOneDivisionEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 202)
        sinon.assert.calledWith(res.json, {'id':'5aa9359a2b21732a73d5406b', 'name': 'div 2', 'enabled': false})
        done()
      }).catch(err => done(err))
    })
    it('should return 404 error status when division not found', (done) => {
      let req = {params: {divisionId: '5aa9359a2b21732a73d5406f'}}
      deleteOneDivisionEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 404)
        assert.notEqual(res.json.getCall(0).args[0].error, null)
        done()
      }).catch(err => done(err))
    })

  })

  describe('POST specific division endpoint', () => {

    it('should add new division', (done) => {
      let req = {body: {name: 'new division'}}
      createOneDivisionEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200)
        let response = res.json.getCall(0).args[0]
        sinon.assert.match(response.name, 'new division')
        done()
      }).catch(err => done(err))
    })
    it('should return 400 and send validation error when name is too short', (done) => {
      let req = {body: {name: 'ab'}}
      createOneDivisionEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 400)
        assert.notEqual(res.json.getCall(0).args[0].error, null)
        done()
      }).catch(err => done(err))
    })
    it('should return 400 and send validation error when name is too long', (done) => {
      let req = {body: {name: new Array(256+1).join('x')}}
      createOneDivisionEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 400)
        assert.notEqual(res.json.getCall(0).args[0].error, null)
        done()
      }).catch(err => done(err))
    })
    it('should return 400 and send validation error when name is missing', (done) => {
      let req = {body: {}}
      createOneDivisionEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 400)
        assert.notEqual(res.json.getCall(0).args[0].error, null)
        done()
      }).catch(err => done(err))
    })

  })

  describe('PUT specific division endpoint', () => {

    it('should change new division name', (done) => {
      let req = {
        params: {divisionId: '5aa9359a2b21732a73d5406a'},
        body: {name: 'update division name'}
      }
      updateOneDivisionEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200)
        sinon.assert.calledWith(res.json, {'id':'5aa9359a2b21732a73d5406a', 'name': 'update division name', 'enabled': true})
        done()
      }).catch(err => done(err))
    })
    it('should return 404 when division id not found', (done) => {
      let req = {params: {divisionId: '5aa9359a2b21732a73d5406f'}}
      updateOneDivisionEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 404)
        assert.notEqual(res.json.getCall(0).args[0].error, null)
        done()
      }).catch(err => done(err))
    })
    it('should return 400 and send validation error when name too short', (done) => {
      let req = {
        params: {divisionId: '5aa9359a2b21732a73d5406a'},
        body: {name: 'x'}
      }
      updateOneDivisionEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 400)
        assert.notEqual(res.json.getCall(0).args[0].error, null)
        done()
      }).catch(err => done(err))
    })
    it('should return 400 and send validation error when name too long', (done) => {
      let req = {
        params: {divisionId: '5aa9359a2b21732a73d5406a'},
        body: {name: new Array(256+1).join('x')}
      }
      updateOneDivisionEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 400)
        assert.notEqual(res.json.getCall(0).args[0].error, null)
        done()
      }).catch(err => done(err))
    })
    it('should return 200 and send validation error when name is missing', (done) => {
      let req = {
        params: {divisionId: '5aa9359a2b21732a73d5406a'},
        body: {}
      }
      updateOneDivisionEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200)
        sinon.assert.calledWith(res.json, {'id':'5aa9359a2b21732a73d5406a', 'name': 'div 1', 'enabled': true})
        done()
      }).catch(err => done(err))
    })

  })

})
