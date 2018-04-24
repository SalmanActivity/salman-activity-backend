import 'mocha';
import * as sinon from 'sinon';
import * as jwt from 'jsonwebtoken';
import { InMemoryAccessor } from '../accessor';
import { User, UserAccessor } from '../user';
import { auth } from './auth';
import { Config } from '../config';

/**
 * Kelas ini berperan sebagai mock object untuk accessor pada user.
 */
class FakeUserAccessor extends InMemoryAccessor<User> implements UserAccessor {
  async getByEmail(email: string): Promise<User> {
    for (const item of this.documents) {
      if (item.email === email) {
        return item;
      }
    }
    return null;
  }
  async getByUsername(username: string): Promise<User> {
    for (const item of this.documents) {
      if (item.username === username) {
        return item;
      }
    }
    return null;
  }
  constructor(documents: User[]) {
    super(documents);
  }
}

describe('auth middleware test', function() {

  let responseSpy;
  let config: Config;
  let authEndpoint;

  beforeEach(() => {
    const userDocuments = [
      {
        id: '5aa9359a2b21732a73d5406a',
        name: 'test user 1',
        username: 'some_user_with_username_1',
        email: 'testuser1@test.com',
        password: 'password-hashed',
        division: null,
        enabled: true,
        admin: true
      }
    ];
    config = {'secretKey': 'test_secret', 'mongoConnection':'', 'photoStorage': null};
    authEndpoint = auth(new FakeUserAccessor(userDocuments), config);
    
    responseSpy = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
      header: sinon.stub().returnsThis()
    };
  });

  /**
   * Fungsi ini digunakan untuk melakukan pengecekan apakah informasi user yang diberikan oleh middleware auth
   * benar (sesuai dengan user yang sedang login).
   * @param done callback dari mocha yang dipanggil ketika test selesai dilakukan.
   * @param user user asli yang ingin di-cek apakah nilainya sama dengan `req.user`
   * @param requestMocked object request yang akan dikirimkan ke endpoint
   * @param responseSpy object response yang akan digunakan untuk memberikan response dari endpoint.
   */
  const successCheck = (done, user, responseSpy, requestMocked) => {
    const next = sinon.spy();
    responseSpy.status.callsFake(function(statusCode) {
      if (statusCode === 403) {
        done('failed auth');
      }
      return this;
    });

    authEndpoint(requestMocked, responseSpy, () => {
      sinon.assert.match(requestMocked.user, user);
      done();
    }).catch(done);
  };

  it('should process next middleware when token in header and valid', (done) => {
    const user = { id:'5aa9359a2b21732a73d5406a', name: 'test user 1', username: 'some_user_with_username_1' };
    const token = jwt.sign(user, config.secretKey);
    const requestMocked = {
      body: {},
      header: sinon.stub().withArgs('Authorization').returns('JWT ' + token)
    };
    successCheck(done, user, responseSpy, requestMocked);
  });

  it('should process next middleware when token in body and valid', (done) => {
    const user = { id:'5aa9359a2b21732a73d5406a', name: 'test user 1', username: 'some_user_with_username_1' };
    const token = jwt.sign(user, config.secretKey);
    const requestMocked = {header(){}, body: { token }};
    successCheck(done, user, responseSpy, requestMocked);
  });

  /**
   * Fungsi ini digunakan untuk melakukan pengecekan apakah response yang diberikan endpoint merupakan
   * 403 dan error-nya unauthorized access.
   * @param done callback dari mocha yang dipanggil ketika test selesai dilakukan.
   * @param requestMocked object request yang akan dikirimkan ke endpoint
   * @param responseSpy object response yang akan digunakan untuk memberikan response dari endpoint.
   * @param next middleware yang akan dieksekusi berikutnya.
   */
  const unauthorizedCheck = (done, requestMocked, responseSpy, next) => {
    authEndpoint(requestMocked, responseSpy, next).then(() => {
      responseSpy.status.calledWith(403);
      sinon.assert.calledWith(responseSpy.status, 403);
      const jsonCallArg = responseSpy.json.getCall(0).args[0];
      if (!jsonCallArg) {
        sinon.assert.fail('json response is null');
      }
      sinon.assert.match(jsonCallArg.error.msg, 'cannot perform action');
      sinon.assert.match(jsonCallArg.error.cause, 'unauthorized access');
      sinon.assert.notCalled(next);
      done();
    }).catch(done.bind(this));
  };

  it('should return error when token in header and invalid', (done) => {
    const config = require('../config');
    const user = { id:'5aa9359a2b21732a73d5406a', name: 'test user 1', username: 'some_user_with_username_1' };
    const token = jwt.sign(user, 'not_the_secret_key');
    const requestMocked = {
      body: {},
      header: sinon.stub().withArgs('Authorization').returns('JWT ' + token)
    };
    const next = sinon.spy();

    unauthorizedCheck(done, requestMocked, responseSpy, next);
  });

  it('should return error when token in body and invalid', (done) => {
    const config = require('../config');
    const user = { id:'5aa9359a2b21732a73d5406a', name: 'test user 1', username: 'some_user_with_username_1' };
    const token = jwt.sign(user, 'not_the_secret_key');
    const requestMocked = {
      body: {token},
      header: sinon.stub()
    };
    const next = sinon.spy();

    unauthorizedCheck(done, requestMocked, responseSpy, next);
  });

  it('should return error when no token is provided', (done) => {
    const config = require('../config');
    const requestMocked = {body: {}, header: sinon.stub()};
    const next = sinon.spy();

    unauthorizedCheck(done, requestMocked, responseSpy, next);
  });

});