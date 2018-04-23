import 'mocha';
import * as sinon from 'sinon';
import { admin } from './roles';

describe('admin middleware test', function() {

  let responseSpy, adminEndpoint;
  beforeEach(function() {
    responseSpy = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
      header: sinon.stub().returnsThis()
    };
    adminEndpoint = admin();
  });

  it('should execute next if user is admin', (done) => {
    const req = {user:{admin:true}};
    const next = sinon.stub();
    
    adminEndpoint(req, responseSpy, next).then(() => {
      sinon.assert.calledOnce(next);
      done();
    }).catch(err => done.bind(this));
  });

  it('should produce error if user is not admin', (done) => {
    const req = {user:{admin:false}};
    const next = sinon.stub();
    adminEndpoint(req, responseSpy, next).then(() => {
      sinon.assert.notCalled(next);
      const jsonCallArg = responseSpy.json.getCall(0).args[0];
      if (!jsonCallArg) {
        sinon.assert.fail('json response is null');
      }
      sinon.assert.match(jsonCallArg.error.msg, 'only admin can perform this action');
      sinon.assert.match(jsonCallArg.error.cause, 'unauthorized access');
      sinon.assert.notCalled(next);
      done();
    }).catch(done.bind(this, 'exception caught in admin middleware'));
  });

  it('should produce error if user admin field is missing', (done) => {
    const req = {user:{admin:false}};
    const next = sinon.stub();
    adminEndpoint(req, responseSpy, next).then(() => {
      sinon.assert.notCalled(next);
      const jsonCallArg = responseSpy.json.getCall(0).args[0];
      if (!jsonCallArg) {
        sinon.assert.fail('json response is null');
      }
      sinon.assert.match(jsonCallArg.error.msg, 'only admin can perform this action');
      sinon.assert.match(jsonCallArg.error.cause, 'unauthorized access');
      sinon.assert.notCalled(next);
      done();
    }).catch(done.bind(this, 'exception caught in admin middleware'));
  });

});