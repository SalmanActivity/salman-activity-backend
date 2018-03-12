var sinon = require('sinon')
var passwordHash = require('password-hash')
var auth = require('./auth')

describe('testing login function', function() {
    
    it('should return access token when username and password matched and user is enabled', (done) => {
        let username = 'c191-9idm1-02d-d90i1'
        let password = '01-2kd=d1=d-20d'

        var userModelMocked = sinon.stub(require('./user'), 'findOne').withArgs({username}).returns({
            exec: () => Promise.resolve({
                username,
                password: passwordHash.generate(password),
                enabled: true
            })
        })

        let reqMocked = {
            body: { username, password }
        }

        let responseSpy = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub().returnsThis(),
            header: sinon.stub().returnsThis()
        }

        auth.login(reqMocked, responseSpy, null).then(() => {
            sinon.assert.calledWith(responseSpy.status, 200)
            sinon.assert.match(responseSpy.json.getCall(0).args[0].token ? 1 : 0, 1)
            done()
        }).catch((err) => {
            done('login failed, return rejected promise' + err)
        })
    })

})