var bluebird = require('bluebird')
var joi = require('joi')
var async = require('async')
var crudUtil = require('../crud/index')
var location = require('./location')

let findAllLocations = crudUtil.readMany({
  fetchMany: (req, context, callback) => location.find({}, callback),
  convertOne: (obj, context, callback) => callback(null, obj.toJSON ? obj.toJSON() : obj),
  filterOne: (obj, context, callback) => callback(null, obj),
  filterFieldOne: crudUtil.filterOne.fields(['id', 'name', 'enabled'])
})

let findOneLocation = crudUtil.readOne({
  fetchOne: (req, context, callback) => location.findOne({_id:req.params.locationId}, callback),
  convertOne: (obj, context, callback) => callback(null, obj.toJSON ? obj.toJSON() : obj),
  filterOne: (obj, context, callback) => callback(null, obj),
  filterFieldOne: crudUtil.filterOne.fields(['id', 'name', 'enabled'])
})

let deleteOneLocation = crudUtil.deleteOne({
  fetchOne: (req, context, callback) => location.findOne({_id:req.params.locationId}, callback),
  deleteOne: (location, context, callback) => {
    location.enabled = false
    location.save(callback)
  },
  filterFieldOne: crudUtil.filterOne.fields(['id', 'name', 'enabled'])
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

let createOneLocation = crudUtil.createOne({
  validateOne: (req, context, callback) => validate(null, req.body, callback),
  insertOne: (validatedData, context, callback) => new location(validatedData, callback).save(callback),
  convertOne: (insertedData, context, callback) => callback(null, insertedData.toJSON ? insertedData.toJSON() : insertedData),
  filterFieldOne: crudUtil.filterOne.fields(['id', 'name', 'enabled'])
})

let updateOneLocation = crudUtil.updateOne({
  init: (req, context, callback) => {
    context.request = req
    callback(null, req)
  },
  fetchOne: (req, context, callback) => {
    location.findOne({_id:req.params.locationId}, (err, val) => {
      if (err) callback(err, null)
      else {
        context.updating = val
        callback(null, val)
      }
    })
  },
  validateOne: (locationDb, context, callback) => validate(null, context.request.body, callback),
  updateOne: (validatedData, context, callback) => {
    context.updating.set(validatedData)
    context.updating.save(callback)
  },
  convertOne: (updatedData, context, callback) => callback(null, updatedData.toJSON ? updatedData.toJSON() : updatedData),
  filterFieldOne: crudUtil.filterOne.fields(['id', 'name', 'enabled'])
})

module.exports = { findAllLocations, findOneLocation, deleteOneLocation, createOneLocation, updateOneLocation }