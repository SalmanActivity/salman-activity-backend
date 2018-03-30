var joi = require('joi')
var divisionModel = require('../division/division')
var locationModel = require('../location/location')
var requestModel = require('./request')
var crudUtil = require('../crud/index')
var ObjectId = require('mongoose').Types.ObjectId

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
  try {
    var id = new ObjectId(req.params.requestId)
  } catch(e) {
    var id =  new ObjectId('000000000000000000000000')
  }

  return requestModel.findOne({_id:id}).populate('issuer')
    .populate('division').populate('location')
}

let filterMongoByUser = (currentUser, mongoRequest, callback) => {
  if (currentUser && !currentUser.admin)
    return mongoRequest.where('division', currentUser.division).exec(callback)
  if (!currentUser)
    return mongoRequest.where('status', 'accepted').where('enabled',true).exec(callback)
  return mongoRequest.exec(callback)
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
    issuer: joi.string().hex().length(24).required(),
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
  validateOne: (req, context, callback) =>
    validateUserInput(req.user, Object.assign({issuer: req.user.id}, req.body), callback),
  insertOne: (validatedData, context, callback) => new requestModel(validatedData).save(callback),
  convertOne: (insertedData, context, callback) => 
    insertedData.populate('issuer').populate('division').populate('location').execPopulate()
    .then(insertedData => callback(null, insertedData.toJSON ? insertedData.toJSON() : insertedData)),
})

let updateOneRequest = crudUtil.updateOne({
  fetchOne: (req, context, callback) => {
    context.request = req
    filterMongoByUser(req.user, filterRequestId(req), callback)
  },
  validateOne: (item, context, callback) => {
    context.updatingItem = item
    let inputData = Object.assign({
      name: item.name,
      issuer: item.issuer.id,
      division: item.division.id,
      location: item.location.id,
      startTime: item.startTime.getTime(),
      endTime: item.endTime.getTime()
    }, context.request.body)
    validateUserInput(context.request.user, inputData, callback)
  },
  updateOne: (validatedData, context, callback) => {
    context.updatingItem.set(validatedData)
    context.updatingItem.save(callback)
  },
  convertOne: (updatedData, context, callback) =>
    updatedData.populate('issuer').populate('division').populate('location').execPopulate()
    .then(updatedData => callback(null, updatedData.toJSON ? updatedData.toJSON() : updatedData)),
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
  updateOneRequest,
  deleteOneRequest
}