var bluebird = require('bluebird')
var joi = require('joi')
var passwordHash = require('password-hash')
var async = require('async')
var crudUtil = require('../crud/index')
var user = bluebird.promisifyAll(require('./user'))
var division = bluebird.promisifyAll(require('../division/division'))
var ObjectId = require('mongoose').Types.ObjectId
var schemaUtil = require('../util/schemaUtil')

function filterUserByRole(user, context, callback) {
    let curUser = context.user
    if (curUser.id != user.id && !curUser.admin)
        try {
            currDivId = curUser.division.id
            userDivId = user.division.id
            if (currDivId == userDivId)
                callback(null, user)
            else
                throw 'different division'
        } catch (e) {
            callback(null, null)
        }
    else
        callback(null, user)
}

function getUserObjectId(userId) {
    try {
        return new ObjectId(userId)
    } catch(e) {
        return new ObjectId('000000000000000000000000')
    }
}

let findAllUsers = crudUtil.readMany({
    init: (req, context, callback) => {
        context.user = req.user
        callback(null, req)
    },
    fetchMany: (req, context, callback) => user.find({}, callback),
    convertOne: (obj, context, callback) => callback(null, obj.toJSON()),
    filterOne: filterUserByRole,
    filterFieldOne: crudUtil.filterOne.fields(['id', 'name', 'username', 'division', 'enabled', 'admin'])
})

let findOneUser = crudUtil.readOne({
    init: (req, context, callback) => {
        context.user = req.user
        callback(null, req)
    },
    fetchOne: (req, context, callback) => user.findOne({_id:getUserObjectId(req.params.userId)}, callback),
    convertOne: (obj, context, callback) => callback(null, obj.toJSON()),
    filterOne: filterUserByRole,
    filterFieldOne: crudUtil.filterOne.fields(['id', 'name', 'username', 'division', 'enabled', 'admin'])
})

let deleteSpecificUser = crudUtil.deleteFindDelete(
    (req, callback) => user.findOne({_id:getUserObjectId(req.params.userId)}, callback),
    (req, user, callback) => {
        user.enabled = false
        user.save(callback)
    }
)

joi = joi.extend({
    name: 'string',
    base: joi.string(),
    rules:[
        {
            name: 'passwordHash',
            validate: (param, value, state, option) => value ? passwordHash.generate(value) : value
        }
    ]
})

let createNewUser = crudUtil.postValidateFindInsertConvert(
    (req, context, callback) => {
        let schema = joi.object().keys({
            name: joi.string().min(3).max(255).required(),
            username: joi.string().min(3).max(64).required(),
            email: joi.string().email().min(3).max(255).required(),
            password: joi.string().min(3).max(100).passwordHash().required(),
            division: joi.string().alphanum().length(24),
            enabled: joi.boolean(),
            admin: joi.boolean()
        })
        let validationResult = schema.validate(req.body)
        if (validationResult.error)
            return callback(validationResult.error.details[0].message, null)
        
        let validatedValue = validationResult.value
        async.parallel([
            callback => validatedValue.division ? division.findOne({_id:validatedValue.division}, callback) : callback(),
            callback => user.findOne({username:validatedValue.username}, callback),
            callback => user.findOne({email:validatedValue.email}, callback)
        ], (err, res) => {
            if (err)
                return callback(err, null)
            
            if (validatedValue.division && !res[0])
                return callback('division not found', null)
            else if (validatedValue.division)
                validatedValue.division = res[0]

            if (res[1])
                return callback('username already taken', null)
            else if (res[2])
                return callback('email already taken', null)
            
            callback(null, validatedValue)
        })
    },
    (validatedData, context, callback) => new user(validatedData, callback).save(callback),
    (insertedData, context, callback) => callback(null, insertedData.toJSON()),
    (convertedData, context, callback) => callback(null, convertedData)
)

function updateUser(req, res, next) {
    return user.findOneAsync({_id:req.params.userId})
    .then(user => {
        if (user) return user
        return Promise.reject({status: 404, cause: 'user not found'})
    })
    .then(user => {
        let schema = joi.object().keys({
            name: joi.string().min(3).max(255),
            username: joi.string().min(3).max(64),
            email: joi.string().email().min(3).max(255),
            password: joi.string().min(3).max(100),
            enabled: joi.boolean(),
            admin: joi.boolean()
        })
        let validationResult = schema.validate(req.body)
        if (validationResult.error)
            return Promise.reject({status:500, cause: validationResult.error.details[0].message})
        if (validationResult.value.password)
            validationResult.value.password = passwordHash.generate(validationResult.value.password)
        
        return {user, update: validationResult.value}
    })
    .then(val => {
        return bluebird.promisify(async.parallel)([
            cb => cb(null, val),
            cb => val.update.username ? division.findOne({username:val.update.username}, cb) : cb(null, null),
            cb => val.update.email ? division.findOne({email:val.update.email}, cb) : cb(null, null)
        ])
    })
    .then(res => { 
        if (res[1])
            return Promise.reject({status:500, cause:'username already taken'})
        else if (res[2])
            return Promise.reject({status:500, cause:'email already taken'})
        else
            return Promise.resolve(res[0])
    })
    .then(val => {
        let user = val.user
        for (let key of ['name','username','email','password','enable','admin'])
            if (val.update[key])
                user[key] = val.update[key]
        return user.save()
    })
    .then(val => {
        if (val)
            return res.status(201).json(val.toJSON())
        else
            return Promise.reject({status:500, cause:'internal server error'})
    })
    .catch(err => {
        console.log(err)
        if (!err.status)
            err = {status: 500, cause: 'internal server error'}
        res.status(err.status).json({
            error: {
                msg: 'cannot update the specific user',
                cause: err.cause
            }
        })
    })
}

module.exports = { findAllUsers, findOneUser, deleteSpecificUser, createNewUser, updateUser }