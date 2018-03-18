var bluebird = require('bluebird')
var joi = require('joi')
var async = require('async')
var crudUtil = require('../crud/index')
var division = require('./division')
var ObjectId = require('mongoose').Types.ObjectId

function getObjectId(userId) {
    try {
        return new ObjectId(userId)
    } catch(e) {
        return new ObjectId('000000000000000000000000')
    }
}

let findAllDivisions = crudUtil.readMany({
    fetchMany: (req, context, callback) => division.find({}, callback),
    convertOne: (obj, context, callback) => callback(null, obj.toJSON ? obj.toJSON() : obj),
    filterOne: (obj, context, callback) => callback(null, obj),
    filterFieldOne: crudUtil.filterOne.fields(['id', 'name', 'enabled'])
})

let findOneDivision = crudUtil.readOne({
    fetchOne: (req, context, callback) => division.findOne({_id:getObjectId(req.params.divisionId)}, callback),
    convertOne: (obj, context, callback) => callback(null, obj.toJSON ? obj.toJSON() : obj),
    filterOne: (obj, context, callback) => callback(null, obj),
    filterFieldOne: crudUtil.filterOne.fields(['id', 'name', 'enabled'])
})

let deleteOneDivision = crudUtil.deleteOne({
    fetchOne: (req, context, callback) => division.findOne({_id:getObjectId(req.params.divisionId)}, callback),
    deleteOne: (division, context, callback) => {
        division.enabled = false
        division.save(callback)
    }
})

let validate = (updating, userInput, callback) => {
    let schema = joi.object().keys({
        name: joi.string().min(3).max(255),
    })
    if (!updating)
        schema = schema.requiredKeys('name')
    let validationResult = schema.validate(userInput)
    if (validationResult.error)
        return callback(validationResult.error.details[0].message, null)
    return callback(null, validationResult.value)
}

let createOneDivision = crudUtil.createOne({
    validateOne: (req, context, callback) => validate(null, req.body, callback),
    insertOne: (validatedData, context, callback) => new division(validatedData, callback).save(callback),
    convertOne: (insertedData, context, callback) => callback(null, insertedData.toJSON ? insertedData.toJSON() : insertedData),
    filterFieldOne: crudUtil.filterOne.fields(['id', 'name', 'enabled'])
})

let updateOneDivision = crudUtil.updateOne({
    init: (req, context, callback) => {
        context.request = req
        callback(null, req)
    },
    fetchOne: (req, context, callback) => {
        division.findOne({_id:getObjectId(req.params.divisionId)}, (err, val) => {
            if (err) callback(err, null)
            else {
                context.updating = val
                callback(null, val)
            }
        })
    },
    validateOne: (divisionDb, context, callback) => validate(null, context.request.body, callback),
    updateOne: (validatedData, context, callback) => {
        context.updating.set(validatedData)
        context.updating.save(callback)
    },
    convertOne: (updatedData, context, callback) => callback(null, updatedData.toJSON ? updatedData.toJSON() : updatedData),
    filterFieldOne: crudUtil.filterOne.fields(['id', 'name', 'enabled'])
})

module.exports = { findAllDivisions, findOneDivision, deleteOneDivision, createOneDivision, updateOneDivision }
