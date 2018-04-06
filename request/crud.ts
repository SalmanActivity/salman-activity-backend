import { Request, RequestAccessor } from '.'
import RequestMongoAccessor from './requestMongoAccessor'
import { DivisionAccessor, DivisionMongoAccessor } from '../division'
import { LocationAccessor, LocationMongoAccessor } from '../location'
import * as crudUtil from '../crud'
import * as joi from 'joi'

async function fetchRequestByMonth(req, requestAccessor:RequestAccessor) {
  let monthFilter = new Date().getMonth()
  let yearFilter = new Date().getFullYear()

  if (req.query.month)
    // js month is zero based
    monthFilter = Number(req.query.month) - 1
  if (req.query.year)
    yearFilter = Number(req.query.year)

  if (isNaN(monthFilter) || isNaN(yearFilter) || monthFilter < 0 || monthFilter >= 12) {
    monthFilter = 0
    yearFilter = 9999
  }

  let startFilter = new Date(yearFilter, monthFilter, 1)
  let endFilter = new Date(yearFilter, monthFilter + 1, 1)
  return requestAccessor.getAllBetween(startFilter, endFilter)
}

async function filterResultByUser (currentUser, request: Request) {
  if (currentUser) {
    if (currentUser.admin) {
      return request
    } else {
      return request.division == currentUser.division.id ? request : null
    }
  } else {
    return request.status === 'accepted' ? request : null
  }
}

export function findRequestInMonth(requestAccessor: RequestAccessor = new RequestMongoAccessor()) {
  return crudUtil.readMany({
    init: async (req, context) => { 
      context.user = req.user
      return req
    },
    fetchMany: (req, context) => fetchRequestByMonth(req, requestAccessor),
    filterOne: (reqObject, context) => filterResultByUser(context.user, reqObject)
  })
}

export function findOneRequest(requestAccessor: RequestAccessor = new RequestMongoAccessor()) {
  return crudUtil.readOne({
    init: async (req, context) => { 
      context.user = req.user
      return req
    },
    fetchOne: (req, context) => requestAccessor.getById(req.params.requestId),
    filterOne: (reqObject, context) => filterResultByUser(context.user, reqObject)
  })
}

async function validateUserInput (userInput: any,
                                  divisionAccessor: DivisionAccessor,
                                  locationAccessor: LocationAccessor) {
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
    status: joi.string().allow(['pending','accepted','rejected']).required(),
    enabled: joi.boolean().default(true),
  }
  let schema = joi.object().keys(rules)
  let validationResult = schema.validate(userInput)
  if (validationResult.error)
    throw validationResult.error.details[0].message
  
  let validatedValue = validationResult.value
  validatedValue.startTime = new Date(validatedValue.startTime)
  validatedValue.endTime = new Date(validatedValue.endTime)
  
  let res = await Promise.all([
    divisionAccessor.getById(validatedValue.division),
    locationAccessor.getById(validatedValue.location),
  ])
  
  if (!res[0])
    throw 'division not found'
  if (!res[1])
    throw 'location not found'

  validatedValue.division = res[0]
  validatedValue.location = res[1]

  return validatedValue
}

export function createOneRequest(requestAccessor: RequestAccessor = new RequestMongoAccessor(),
                                 divisionAccessor: DivisionAccessor = new DivisionMongoAccessor(),
                                 locationAccessor: LocationAccessor = new LocationMongoAccessor()) {
  return crudUtil.createOne({
    validateOne: async (req, context) => {
      if ('issuer' in req.body)
        throw {status:400, cause:'"issuer" is not allowed'}
      if (req.user && !req.user.admin) {
        if (req.body.division)
          throw {status:400, cause:'"division" is not allowed'}
        if (req.body.status)
          throw {status:400, cause:'"status" is not allowed'}
        if (req.body.enabled)
          throw {status:400, cause:'"enabled" is not allowed'}
      }
      let inputData = Object.assign({issuer: req.user.id, status:'pending'}, req.body)
      if (req.user && !req.user.admin)
        inputData.division = req.user.division.id
      return validateUserInput(inputData, divisionAccessor, locationAccessor)
    },
    insertOne: (object, context) => {
      object.issuedTime = new Date()
      requestAccessor.insert(object)
    }
  })
}

export function updateOneRequest(requestAccessor: RequestAccessor = new RequestMongoAccessor(),
                                 divisionAccessor: DivisionAccessor = new DivisionMongoAccessor(),
                                 locationAccessor: LocationAccessor = new LocationMongoAccessor()) {
  return crudUtil.updateOne({
    fetchOne: (req, context) => {
      context.request = req
      return requestAccessor.getById(req.params.requestId)
    },
    validateOne: async (item, context) => {
      if (item.status === 'accepted')
        throw {status:403, cause:'trying to update accepted request'}
      if ('issuer' in context.request.body)
        throw {status:400, cause:'"issuer" is not allowed'}
      if (context.request.user && !context.request.user.admin) {
        if ('division' in context.request.body)
          throw {status:400, cause:'"division" is not allowed'}
        if ('status' in context.request.body)
          throw {status:400, cause:'"status" is not allowed'}
        if ('enabled' in context.request.body)
          throw {status:400, cause:'"enabled" is not allowed'}
      }

      context.updatingItem = item
      let inputData = Object.assign({
        name: item.name,
        issuer: item.issuer.id,
        division: item.division.id,
        location: item.location.id,
        startTime: item.startTime.getTime(),
        endTime: item.endTime.getTime(),
        status: item.status
      }, context.request.body)
      let res = await validateUserInput(inputData, divisionAccessor, locationAccessor)
      if (res.endTime <= res.startTime) 
        throw {status:400, cause:'"endTime" must greater than "startTime"'}
      return res
    },
    updateOne: (reqObject, context) =>
      requestAccessor.update(Object.assign(context.updatingItem, reqObject))
  })
}

export function deleteOneRequest(requestAccessor: RequestAccessor = new RequestMongoAccessor()) {
  return crudUtil.deleteOne({
    fetchOne: (req, context) => requestAccessor.getById(req.params.requestId),
    deleteOne: (reqObject, context) => {
      reqObject.enabled = false
      return requestAccessor.update(reqObject)
    }
  })
}