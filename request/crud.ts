import RequestAccessor from './requestAccessor'
import Request from './request'
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
      return request.division.id === currentUser.division.id ? request : null
    }
  } else {
    return request.status === 'accepted' && request.enabled ? request : null
  }
}

let filterField = crudUtil.filterOne.fields(['id','name','description',
  'personInCharge', 'phoneNumber',
  'issuer.id','issuer.name','issuer.username','issuer.email',
  'issuedTime',
  'division.id', 'division.name', 'division.enabled',
  'location.id', 'location.name', 'location.enabled',
  'startTime', 'endTime', 'participantNumber',
  'participantDescription', 'speaker', 'target', 'status', 'enabled'])

export function findRequestInMonth(requestAccessor: RequestAccessor = new RequestMongoAccessor()) {
  return crudUtil.readMany({
    init: async (req, context) => {
      context.user = req.user
      return req
    },
    fetchMany: (req, context) => fetchRequestByMonth(req, requestAccessor),
    filterOne: (reqObject, context) => filterResultByUser(context.user, reqObject),
    filterFieldOne: filterField
  })
}

export function findOneRequest(requestAccessor: RequestAccessor = new RequestMongoAccessor()) {
  return crudUtil.readOne({
    init: async (req, context) => {
      context.user = req.user
      return req
    },
    fetchOne: (req, context) => requestAccessor.getById(req.params.requestId),
    filterOne: (reqObject, context) => filterResultByUser(context.user, reqObject),
    filterFieldOne: filterField
  })
}

async function validatePostUserInput(userInput: any) {
  let rules = {
    name: joi.string().min(3).max(255).required(),
    description: joi.string().max(1024),
    personInCharge: joi.string().min(3).max(255).required(),
    phoneNumber: joi.string().min(3).max(50).required(),
    division: joi.string().hex().length(24),
    location: joi.string().hex().length(24).required(),
    startTime: joi.number().integer().positive().required(),
    endTime: joi.number().integer().positive().required(),
    participantNumber: joi.number().integer().positive(),
    participantDescription: joi.string().max(1024),
    speaker: joi.string().max(512),
    target: joi.string().max(1024),
    status: joi.string().allow(['pending','accepted','rejected']),
    enabled: joi.boolean().default(true),
  }
  let schema = joi.object().keys(rules)
  let validationResult = schema.validate(userInput)
  if (validationResult.error)
    throw validationResult.error.details[0].message

  let validatedValue = validationResult.value
  validatedValue.startTime = new Date(validatedValue.startTime)
  validatedValue.endTime = new Date(validatedValue.endTime)
  return validatedValue
}

export function createOneRequest(requestAccessor: RequestAccessor = new RequestMongoAccessor(),
                                 divisionAccessor: DivisionAccessor = new DivisionMongoAccessor(),
                                 locationAccessor: LocationAccessor = new LocationMongoAccessor()) {
  return crudUtil.createOne({
    validateOne: async (req, context) => {
      let data = await validatePostUserInput(req.body)

      if (req.user && !req.user.admin) {
        if (req.body.division)
          throw {status:400, cause:'"division" is not allowed'}
        if (req.body.status)
          throw {status:400, cause:'"status" is not allowed'}
        if (req.body.enabled)
          throw {status:400, cause:'"enabled" is not allowed'}
        data.division = req.user.division.id
        data.status = 'pending'
      }
      data.issuer = req.user

      let res = await Promise.all([
        divisionAccessor.getById(data.division),
        locationAccessor.getById(data.location),
      ])

      if (!res[0])
        throw 'division not found'
      if (!res[1])
        throw 'location not found'

      data.division = res[0]
      data.location = res[1]
      data.issuedTime = new Date()
      return data
    },
    insertOne: (object, context) => requestAccessor.insert(object),
    filterFieldOne: filterField
  })
}

async function validatePutUserInput(userInput: any) {
  let rules = {
    name: joi.string().min(3).max(255),
    description: joi.string().max(1024),
    personInCharge: joi.string().min(3).max(255),
    phoneNumber: joi.string().min(3).max(50),
    division: joi.string().hex().length(24),
    location: joi.string().hex().length(24),
    startTime: joi.number().integer().positive(),
    endTime: joi.number().integer().positive(),
    participantNumber: joi.number().integer().positive(),
    participantDescription: joi.string().max(1024),
    speaker: joi.string().max(512),
    target: joi.string().max(1024),
    status: joi.string().allow(['pending','accepted','rejected']),
    enabled: joi.boolean().default(true),
  }
  let schema = joi.object().keys(rules)
  let validationResult = schema.validate(userInput)
  if (validationResult.error)
    throw validationResult.error.details[0].message

  let validatedValue = validationResult.value
  if ('startTime' in validatedValue)
    validatedValue.startTime = new Date(validatedValue.startTime)
  if ('endTime' in validatedValue)
    validatedValue.endTime = new Date(validatedValue.endTime)

  if (validatedValue.startTime && validatedValue.endTime && validatedValue.startTime >= validatedValue.endTime)
    throw '"endTime" should greater than "startTime"'

  return validatedValue
}

export function updateOneRequest(requestAccessor: RequestAccessor = new RequestMongoAccessor(),
                                 divisionAccessor: DivisionAccessor = new DivisionMongoAccessor(),
                                 locationAccessor: LocationAccessor = new LocationMongoAccessor()) {
  return crudUtil.updateOne({
    fetchOne: (req, context) => {
      context.body = req.body
      context.user = req.user
      return requestAccessor.getById(req.params.requestId)
    },
    validateOne: async (item, context) => {
      let data = await validatePutUserInput(context.body)

      if (!context.user.admin && item.status === 'accepted')
        throw {status:403, cause:'trying to update accepted request'}

      if (!context.user.admin) {
        if ('division' in context.body)
          throw {status:400, cause:'"division" is not allowed'}
        if ('status' in context.body)
          throw {status:400, cause:'"status" is not allowed'}
        if ('enabled' in context.body)
          throw {status:400, cause:'"enabled" is not allowed'}
      }

      if (data.division) {
        data.division = await divisionAccessor.getById(data.division)
        if (!data.division)
          throw 'division not found'
      }

      if (data.location) {
        data.location = await locationAccessor.getById(data.location)
        if (!data.location)
          throw 'location not found'
      }

      context.updatingItem = item
      let result = Object.assign(item, data)

      if (result.startTime && result.endTime && result.startTime >= result.endTime)
        throw '"endTime" should greater than "startTime"'

      return result
    },
    updateOne: (reqObject, context) => requestAccessor.update(reqObject),
    filterFieldOne: filterField
  })
}

export function deleteOneRequest(requestAccessor: RequestAccessor = new RequestMongoAccessor()) {
  return crudUtil.deleteOne({
    fetchOne: (req, context) => requestAccessor.getById(req.params.requestId),
    deleteOne: (reqObject, context) => {
      reqObject.enabled = false
      return requestAccessor.update(reqObject)
    },
    filterFieldOne: filterField
  })
}
