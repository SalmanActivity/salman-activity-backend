import * as sinon from 'sinon';
import { assert } from 'chai';
import * as crud from './crud';
import LocationAccessor from './locationAccessor';
import { InMemoryAccessor } from '../accessor';


describe('location crud endpoint test', () => {
  let documents = [], findStub, findOneStub, req = {}, res, next, locationAccessor:LocationAccessor;
  let findAllLocationsEndpoint,
      findOneLocationEndpoint,
      createOneLocationEndpoint,
      deleteOneLocationEndpoint,
      updateOneLocationEndpoint;
  beforeEach(() => {
	  next = sinon.stub();
	  res = {status:sinon.stub(), json:sinon.stub(), header:sinon.stub()};
	  res.status.returnsThis();
	  res.json.returnsThis();

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
	  ];
    locationAccessor = new InMemoryAccessor(documents);
    findAllLocationsEndpoint = crud.findAllLocations(locationAccessor);
    findOneLocationEndpoint = crud.findOneLocation(locationAccessor);
    createOneLocationEndpoint = crud.createOneLocation(locationAccessor);
    deleteOneLocationEndpoint = crud.deleteOneLocation(locationAccessor);
    updateOneLocationEndpoint = crud.updateOneLocation(locationAccessor);
  });

  afterEach(() => {
    res.status.reset();
    res.json.reset();
    res.header.reset();
    next.reset();
  });

  describe('Get all location endpoint', () => {
  	it('should return all location including deleted one', (done) => {
      findAllLocationsEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200);
        sinon.assert.calledWith(res.json, [
          {'id':'5aa9359a2b21732a73d5406a', 'name': 'loc 1', 'enabled': true},
          {'id':'5aa9359a2b21732a73d5406b', 'name': 'loc 2', 'enabled': false},
          {'id':'5aa9359a2b21732a73d5406c', 'name': 'loc 3', 'enabled': true},
          {'id':'5aa9359a2b21732a73d5406d', 'name': 'loc 4', 'enabled': false}
        ]);
        done();
      }).catch(err => done(err));
    });

    it('should return empty location with status code 200', (done) => {
      findAllLocationsEndpoint = crud.findAllLocations(new InMemoryAccessor([]));
      findAllLocationsEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200);
        sinon.assert.calledWith(res.json, []);
        done();
      }).catch(err => done(err));
    });

    it('should return only id,name,enabled field', (done) => {
      findAllLocationsEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200);
        sinon.assert.calledWith(res.json, [
          {'id':'5aa9359a2b21732a73d5406a', 'name': 'loc 1', 'enabled': true},
          {'id':'5aa9359a2b21732a73d5406b', 'name': 'loc 2', 'enabled': false},
          {'id':'5aa9359a2b21732a73d5406c', 'name': 'loc 3', 'enabled': true},
          {'id':'5aa9359a2b21732a73d5406d', 'name': 'loc 4','enabled': false}
        ]);
        done();
      }).catch(err => done(err));
    });

  });

  describe('GET specific location endpoint', () => {
  	it('should return specific location', (done) => {
      const req = {params: {locationId: '5aa9359a2b21732a73d5406a'}};
      findOneLocationEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200);
        sinon.assert.calledWith(res.json, {'id':'5aa9359a2b21732a73d5406a', 'name': 'loc 1', 'enabled': true});
        done();
      }).catch(err => done(err));
    });

    it('should return specific location even it has been deleted', (done) => {
      const req = {params: {locationId: '5aa9359a2b21732a73d5406b'}};
      findOneLocationEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200);
        sinon.assert.calledWith(res.json, {'id':'5aa9359a2b21732a73d5406b', 'name': 'loc 2', 'enabled': false});
        done();
      }).catch(err => done(err));
    });

    it('should return 404 not found if id is invalid', (done) => {
      const req = {params: {locationId: 'ab*1'}};
      findOneLocationEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 404);
        assert.notEqual(res.json.getCall(0).args[0].error, null);
        done();
      }).catch(err => done(err));
    });

    it('should return 404 not found if division doesnt exists', (done) => {
      const req = {params: {locationId: '5aa9359a2b21732a73d5406e'}};
      findOneLocationEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 404);
        assert.notEqual(res.json.getCall(0).args[0].error, null);
        done();
      }).catch(err => done(err));
    });

    it('should return field only id,name,enabled', (done) => {
      const req = {params: {locationId: '5aa9359a2b21732a73d5406d'}};
      findOneLocationEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200);
        sinon.assert.calledWith(res.json, {'id':'5aa9359a2b21732a73d5406d', 'name': 'loc 4','enabled': false});
        done();
      }).catch(err => done(err));
    });

  });

  describe('DELETE specific location endpoint', () => {

    it('should change location enabled to false', (done) => {
      const req = {params: {locationId: '5aa9359a2b21732a73d5406a'}};
      deleteOneLocationEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 202);
        sinon.assert.calledWith(res.json, {'id':'5aa9359a2b21732a73d5406a', 'name': 'loc 1', 'enabled': false});
        done();
      }).catch(err => done(err));
    });

    it('should keep deleted location enabled to false', (done) => {
      const req = {params: {locationId: '5aa9359a2b21732a73d5406b'}};
      deleteOneLocationEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 202);
        sinon.assert.calledWith(res.json, {'id':'5aa9359a2b21732a73d5406b', 'name': 'loc 2', 'enabled': false});
        done();
      }).catch(err => done(err));
    });

    it('should return 404 error status when location not found', (done) => {
      const req = {params: {locationId: '5aa9359a2b21732a73d5406f'}};
      deleteOneLocationEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 404);
        assert.notEqual(res.json.getCall(0).args[0].error, null);
        done();
      }).catch(err => done(err));
    });

  });

  describe('POST specific location endpoint', () => {

    it('should add new location', (done) => {
      const req = {body: {name: 'new location'}};
      createOneLocationEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200);
        const response = res.json.getCall(0).args[0];
        sinon.assert.match(response.name, 'new location');
        done();
      }).catch(err => done(err));
    });
    
    it('should return 400 and send validation error when name is too short', (done) => {
      const req = {body: {name: 'ab'}};
      createOneLocationEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 400);
        assert.notEqual(res.json.getCall(0).args[0].error, null);
        done();
      }).catch(err => done(err));
    });

    it('should return 400 and send validation error when name is too short', (done) => {
      const req = {body: {name: new Array(256+1).join('x')}};
      createOneLocationEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 400);
        assert.notEqual(res.json.getCall(0).args[0].error, null);
        done();
      }).catch(err => done(err));
    });

    it('should return 400 and send validation error when name is missing', (done) => {
      const req = {body: {}};
      createOneLocationEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 400);
        assert.notEqual(res.json.getCall(0).args[0].error, null);
        done();
      }).catch(err => done(err));
    });

  });

  describe('PUT specific location endpoint', () => {

    it('should change new location name', (done) => {
      const req = {
        params: {locationId: '5aa9359a2b21732a73d5406a'},
        body: {name: 'update location name'}
      };
      updateOneLocationEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200);
        sinon.assert.calledWith(res.json, {'id':'5aa9359a2b21732a73d5406a', 'name': 'update location name', 'enabled': true});
        done();
      }).catch(err => done(err));
    });

    it('should return 404 when location id not found', (done) => {
      const req = {params: {locationId: '5aa9359a2b21732a73d5406f'}};
      updateOneLocationEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 404);
        assert.notEqual(res.json.getCall(0).args[0].error, null);
        done();
      }).catch(err => done(err));
    });

    it('should return 400 and send validation error when name too short', (done) => {
      const req = {
        params: {locationId: '5aa9359a2b21732a73d5406a'},
        body: {name: 'x'}
      };
      updateOneLocationEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 400);
        assert.notEqual(res.json.getCall(0).args[0].error, null);
        done();
      }).catch(err => done(err));
    });
    
    it('should return 400 and send validation error when name too long', (done) => {
      const req = {
        params: {locationId: '5aa9359a2b21732a73d5406a'},
        body: {name: new Array(256+1).join('x')}
      };
      updateOneLocationEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 400);
        assert.notEqual(res.json.getCall(0).args[0].error, null);
        done();
      }).catch(err => done(err));
    });
    
    it('should return 200 and not changes when name is missing', (done) => {
      const req = {
        params: {locationId: '5aa9359a2b21732a73d5406a'},
        body: {}
      };
      updateOneLocationEndpoint(req, res, next).then(() => {
        sinon.assert.calledWith(res.status, 200);
        sinon.assert.calledWith(res.json, {'id':'5aa9359a2b21732a73d5406a', 'name': 'loc 1', 'enabled': true});
        done();
      }).catch(err => done(err));
    });

  });




});