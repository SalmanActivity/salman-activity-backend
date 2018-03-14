var userModel = require('./user/user')
var divisionModel = require('./division/division')
var passwordHash = require('password-hash')

let division1 = new divisionModel({
    _id: '5aa9359a2b21732a73d54068',
    name: 'division_1',
    enabled: true
})

let user1 = new userModel({
    _id: '5aa9359a2b21732a73d5406a',
    name: 'Test User 1',
    username: 'test_user_1',
    email: 'test_user_1@test.com',
    password: passwordHash.generate('test_user_1_pass'),
    division: division1,
    enabled: true,
    admin: false
})

let admin1 = new userModel({
    _id: '5aa9359a2b21732a73d54069',
    name: 'Test Admin 1',
    username: 'test_admin_1',
    email: 'test_admin_1@test.com',
    password: passwordHash.generate('test_admin_1_pass'),
    division: null,
    enabled: true,
    admin: true
})

module.exports = [
    division1, user1, admin1
]