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
    issuedTime: new Date(2018, 1, 1, 10),
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

let request2 = new requestModel({
    _id: '5aaa89e2a892471e3cdc84db',
    name: 'request 2',
    description: 'description of request 2',
    issuer: admin1,
    issuedTime: new Date(2018, 1, 1, 10),
    division: division2,
    location: location1,
    startTime: new Date(2018, 2, 2, 13),
    endTime: new Date(2018, 2, 2, 17),
    status: 'accepted',
    enabled: true
})

let request3 = new requestModel({
    _id: '5aaa89e2a892471e3cdc84dc',
    name: 'request 3',
    description: 'description of request 3',
    issuer: admin1,
    issuedTime: new Date(2018, 1, 1, 10),
    division: division2,
    location: location2,
    startTime: new Date(2018, 2, 19, 13),
    endTime: new Date(2018, 2, 10, 17),
    status: 'rejected',
    enabled: true
})

let request4 = new requestModel({
    _id: '5aaa89e2a892471e3cdc84dd',
    name: 'request 4',
    description: 'description of request 4',
    issuer: admin1,
    issuedTime: new Date(2018, 1, 1, 10),
    division: division1,
    location: location2,
    startTime: new Date(2018, 1, 1, 13),
    endTime: new Date(2018, 1, 1, 17),
    status: 'pending',
    enabled: true
})

let request5 = new requestModel({
    _id: '5aaa89e2a892471e3cdc84de',
    name: 'request 5',
    description: 'description of request 5',
    issuer: admin1,
    issuedTime: new Date(2018, 1, 1, 10),
    division: division1,
    location: location2,
    startTime: new Date(2018, 1, 1, 13),
    endTime: new Date(2018, 1, 1, 17),
    status: 'accepted',
    enabled: true
})

let request6 = new requestModel({
    _id: '5aaa89e2a892471e3cdc84df',
    name: 'request 6',
    description: 'description of request 6',
    issuer: admin1,
    issuedTime: new Date(2018, 1, 1, 10),
    division: division1,
    location: location2,
    startTime: new Date(2018, 1, 1, 13),
    endTime: new Date(2018, 1, 1, 17),
    status: 'rejected',
    enabled: false
})

let request7 = new requestModel({
    _id: '5aaa89e2a892471e3cdc84e0',
    name: 'request 7',
    description: 'description of request 7',
    issuer: admin1,
    issuedTime: new Date(2018, 1, 1, 10),
    division: division2,
    location: location2,
    startTime: new Date(2018, 1, 23, 13),
    endTime: new Date(2018, 1, 23, 17),
    status: 'pending',
    enabled: true
})

let request8 = new requestModel({
    _id: '5aaa89e2a892471e3cdc84e1',
    name: 'request 8',
    description: 'description of request 8',
    issuer: admin1,
    issuedTime: new Date(2018, 1, 1, 10),
    division: division1,
    location: location2,
    startTime: new Date(2018, 1, 23, 13),
    endTime: new Date(2018, 1, 23, 17),
    status: 'accepted',
    enabled: true
})

let request9 = new requestModel({
    _id: '5aaa89e2a892471e3cdc84e2',
    name: 'request 9',
    description: 'description of request 9',
    issuer: admin1,
    issuedTime: new Date(2018, 1, 1, 10),
    division: division2,
    location: location2,
    startTime: new Date(2018, 1, 23, 13),
    endTime: new Date(2018, 1, 23, 17),
    status: 'rejected',
    enabled: true
})

let request10 = new requestModel({
    _id: '5aaa89e2a892471e3cdc84e3',
    name: 'request 10',
    description: 'description of request 10',
    issuer: admin1,
    issuedTime: new Date(2018, 1, 1, 10),
    division: division1,
    location: location2,
    startTime: new Date(2018, 1, 28, 13),
    endTime: new Date(2018, 1, 28, 17),
    status: 'pending',
    enabled: true
})

let request11 = new requestModel({
    _id: '5aaa89e2a892471e3cdc84e4',
    name: 'request 11',
    description: 'description of request 11',
    issuer: admin1,
    issuedTime: new Date(2018, 1, 1, 10),
    division: division2,
    location: location2,
    startTime: new Date(2018, 1, 28, 13),
    endTime: new Date(2018, 1, 28, 17),
    status: 'accepted',
    enabled: false
})

let request12 = new requestModel({
    _id: '5aaa89e2a892471e3cdc84e5',
    name: 'request 12',
    description: 'description of request 12',
    issuer: admin1,
    issuedTime: new Date(2018, 1, 1, 10),
    division: division1,
    location: location2,
    startTime: new Date(2018, 1, 28, 13),
    endTime: new Date(2018, 1, 28, 17),
    status: 'rejected',
    enabled: true
})

module.exports = [
    division1, division2, user1, admin1, location1, location2, request1, request2, request3, request4,
    request5, request6, request7, request8, request9, request10, request11, request12
]