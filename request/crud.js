var joi = require('joi')
var divisionModel = require('../division/division')
var locationModel = require('../location/location')
var requestModel = require('./request')
var crudUtil = require('../crud/index')

let filterRequestMonthYear = (req) => {
  let monthFilter = new Date().getMonth()
  let yearFilter = new Date().getFullYear()

  if (req.query.month)
    monthFilter = Number(req.query.month) - 1
  if (req.query.year)
    yearFilter = Number(req.query.year)

  if (isNaN(monthFilter) || isNaN(yearFilter) || monthFilter < 0 || monthFilter >= 12) {
    monthFilter = 0
    yearFilter = 9999
  }

  let startFilter = new Date(yearFilter, monthFilter, 1)
  let endFilter = new Date(yearFilter, monthFilter + 1, 1)

  let condition = {
    'startTime': {
      '$gte': startFilter,
      '$lt': endFilter
    }
  }

  return requestModel.find(condition).populate('issuer')
    .populate('division').populate('location')
}

let filterRequestId = (req) => {
  return requestModel.findOne({_id:req.params.requestId}).populate('issuer')
    .populate('division').populate('location')
}

let filterMongoByUser = (currentUser, mongoRequest, callback) => {
  if (currentUser && !currentUser)
    mongoRequest.where('division._id', currentUser.division.id)
  if (!currentUser)
    mongoRequest.where('status', 'accepted')
  mongoRequest.exec(callback)
}

let findRequestInMonth = crudUtil.readMany({
  fetchMany: (req, context, callback) =>
    filterMongoByUser(req.user, filterRequestMonthYear(req), callback),
  convertOne: (obj, context, callback) => callback(null, obj.toJSON ? obj.toJSON() : obj)
})

let findOneRequest = crudUtil.readOne({
  fetchOne: (req, context, callback) =>
    filterMongoByUser(req.user, filterRequestId(req), callback),
  convertOne: (obj, context, callback) => callback(null, obj.toJSON ? obj.toJSON() : obj)
})

let validateUserInput = (currentUser, userInput, callback) => {
  let rules = {
    name: joi.string().min(3).max(255).required(),
    description: joi.string().max(1024),
    division: joi.string().hex().length(24).required(),
    location: joi.string().hex().length(24).required(),
    startTime: joi.number().integer().positive().required(),
    endTime: joi.number().integer().positive().required(),
    participantNumber: joi.number().integer().positive(),
    participantDescription: joi.string().max(1024),
    speaker: joi.string().max(512),
    enabled: joi.boolean().default(true),
  }
  if (!currentUser.admin)
    delete rules['division']
  let schema = joi.object().keys(rules)
  let validationResult = schema.validate(userInput)
  if (validationResult.error)
    return callback(validationResult.error.details[0].message, null)
  
  let validatedValue = validationResult.value
  validatedValue.issuer = currentUser.id
  validatedValue.startTime = new Date(validatedValue.startTime)
  validatedValue.endTime = new Date(validatedValue.endTime)
  if (!currentUser.admin)
    validatedValue.division = currentUser.division

  Promise.all([
    divisionModel.findOne({_id:validatedValue.division}).exec(),
    locationModel.findOne({_id:validatedValue.location}).exec(),
  ])
  .then(res => {
    if (!res[0])
      return callback('division not found', null)
    if (!res[1])
      return callback('location not found', null)

    validatedValue.division = res[0]
    validatedValue.location = res[1]

    callback(null, validatedValue)
  })
  .catch(err => callback(err, null))
}

let createOneRequest = crudUtil.createOne({
  validateOne: (req, context, callback) => validateUserInput(req.user, req.body, callback),
  insertOne: (validatedData, context, callback) => new requestModel(validatedData).save(callback),
  convertOne: (insertedData, context, callback) => 
    insertedData.populate('issuer').populate('division').populate('location').execPopulate()
    .then(insertedData => callback(null, insertedData.toJSON ? insertedData.toJSON() : insertedData)),
})

let deleteOneRequest = crudUtil.deleteOne({
  fetchOne: (req, context, callback) => 
    filterMongoByUser(req.user, filterRequestId(req), callback),
  deleteOne: (request, context, callback) => {
    request.enabled = false
    request.save(callback)
  },
})

module.exports = {
  findAllRequests: findRequestInMonth,
  findOneRequest,
  createOneRequest,
  deleteOneRequest
}