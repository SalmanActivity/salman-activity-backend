var bluebird = require('bluebird')
var joi = require('joi')
var passwordHash = require('password-hash')
var async = require('async')
var crudUtil = require('../crud/index')
var user = require('./user')
var division = require('../division/division')
var ObjectId = require('mongoose').Types.ObjectId

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

let findCurrentUser = crudUtil.readOne({
    fetchOne: (req, context, callback) => callback(null, req.user),
    convertOne: (obj, context, callback) => callback(null, obj),
    filterOne: (obj, context, callback) => callback(null, obj),
    filterFieldOne: crudUtil.filterOne.fields(['id', 'name', 'username', 'division', 'enabled', 'admin'])
})

let deleteOneUser = crudUtil.deleteOne({
    fetchOne: (req, context, callback) => user.findOne({_id:getUserObjectId(req.params.userId)}, callback), 
    deleteOne: (user, context, callback) => {
        user.enabled = false
        user.save(callback)
    }
})

let validateUserInput = (updatingUser, userInput, callback) => {
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

    let schema = joi.object().keys({
        name: joi.string().min(3).max(255),
        username: joi.string().min(3).max(64),
        email: joi.string().email().min(3).max(255),
        password: joi.string().min(3).max(100).passwordHash(),
        division: joi.string().hex().length(24),
        enabled: joi.boolean(),
        admin: joi.boolean()
    })
    if (!updatingUser)
        schema = schema.requiredKeys('name', 'username', 'email', 'password')
    let validationResult = schema.validate(userInput)
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

        let updatingUsername = updatingUser ? updatingUser.username : null
        let updatingEmail = updatingUser ? updatingUser.email : null

        if (res[1] && res[1] != updatingUsername)
            return callback('username already taken', null)
        else if (res[2] && res[2] != updatingEmail)
            return callback('email already taken', null)
        
        callback(null, validatedValue)
    })
}

let createOneUser = crudUtil.createOne({
    validateOne: (req, context, callback) => validateUserInput(null, req.body, callback),
    insertOne: (validatedData, context, callback) => new user(validatedData, callback).save(callback),
    convertOne: (insertedData, context, callback) => callback(null, insertedData.toJSON()),
    filterFieldOne: crudUtil.filterOne.fields(['id', 'name', 'username', 'division', 'enabled', 'admin'])
})

let updateOneUser = crudUtil.updateOne({
    init: (req, context, callback) => {
        context.request = req
        callback(null, req)
    },
    fetchOne: (req, context, callback) => {
        user.findOne({_id:getUserObjectId(req.params.userId)}, (err, val) => {
            if (err) callback(err, null)
            else {
                context.updatingUser = val
                callback(null, val)
            }
        })
    },
    validateOne: (updatingUser, context, callback) => validateUserInput(updatingUser, context.request.body, callback),
    updateOne: (validatedData, context, callback) => {
        context.updatingUser.set(validatedData)
        context.updatingUser.save(callback)
    },
    convertOne: (updatedData, context, callback) => callback(null, updatedData.toJSON()),
    filterFieldOne: crudUtil.filterOne.fields(['id', 'name', 'username', 'division', 'enabled', 'admin'])
})

module.exports = { findAllUsers, findOneUser, findCurrentUser, deleteOneUser, createOneUser, updateOneUser }