var userModel = require('./user/user')
var divisionModel = require('./division/division')
var locationModel = require('./location/location')
var requestModel = require('./request/request')
var passwordHash = require('password-hash')

let division1 = new divisionModel({
    _id: '5aa9359a2b21732a73d54068',
    name: 'Divisi 1',
    enabled: true
})

let division2 = new divisionModel({
    _id: '5aaa860001e1901b03651171',
    name: 'Divisi 2',
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

let location1 = new locationModel({
    _id: '5aaa89e2a892471e3cdc84d8',
    name: 'Location 1',
    enabled: true
})

let location2 = new locationModel({
    _id: '5aaa89e2a892471e3cdc84d9',
    name: 'Location 2',
    enabled: true
})

let request1 = new requestModel({
    _id: '5aaa89e2a892471e3cdc84da',
    name: 'request 1',
    description: 'description of request 1',
    issuer: user1,
    division: division1,
    location: location1,
    startTime: new Date(2018,2, 15, 9),
    endTime: new Date(2018, 2, 15, 12),
    participantNumber: 3,
    participantDescription: 'participant description',
    speaker: 'speaker',
    status: 'pending',
    enabled: true
})

module.exports = [
    division1, division2, user1, admin1, location1, location2, request1
]