import ReportAccessor from './reportAccessor'
import Report from './report'
import ReportMongoAccessor from './reportMongoAccessor'
import { DivisionAccessor, DivisionMongoAccessor } from '../division'
import { LocationAccessor, LocationMongoAccessor } from '../location'
import { RequestAccessor, RequestMongoAccessor } from '../request'
import * as crudUtil from '../crud'
import * as joi from 'joi'


async function fetchReportByMonth(req, reportAccessor:ReportAccessor) {
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
  return reportAccessor.getAllBetween(startFilter, endFilter)
}

async function filterResultByUser (currentUser, report: Report) {
  if (currentUser) {
    if (currentUser.admin) {
      return report
    } else {
      return report.request.division.id === currentUser.division.id ? report : null
    }
  } else {
    return null
  }
}

let filterField = crudUtil.filterOne.fields(['id', 'issuedTime',
  'request.id', 'request.name', 'request.description', 'request.personInCharge', 'request.phoneNumber',
  'request.issuer.id','request.issuer.name','request.issuer.username','request.issuer.email',
  'request.issuedTime',
  'request.division.id', 'request.division.name', 'request.division.enabled',
  'request.location.id', 'request.location.name', 'request.location.enabled',
  'request.startTime', 'request.endTime', 'request.participantNumber',
  'request.participantDescription', 'request.speaker', 'request.target', 'request.status', 'request.enabled',
  'content', 'photo'])

export function findReportInMonth(reportAccessor: ReportAccessor = new ReportMongoAccessor()) {
  return crudUtil.readMany({
    init: async (req, context) => {
      context.user = req.user
      return req
    },
    fetchMany: (req, context) => fetchReportByMonth(req, reportAccessor),
    filterOne: (reqObject, context) => filterResultByUser(context.user, reqObject),
    filterFieldOne: filterField
  })
}


export function findReportByRequest(reportAccessor: ReportAccessor = new ReportMongoAccessor()) {
  return crudUtil.readOne({
    init: async (req, context) => {
      context.user = req.user
      return req
    },
    fetchOne: (req, context) => reportAccessor.getByRequest(req.params.requestId),
    filterOne: (reqObject, context) => filterResultByUser(context.user, reqObject),
    filterFieldOne: filterField
  })
}

async function validatePostUserInput(userInput: any) {
  let rules = {
    issuedTime: joi.number().integer().positive().required(),
    content: joi.string().min(3).max(1024).required(),
    photo: joi.string().min(3).max(1024).required()
  }
  let schema = joi.object().keys(rules)
  let validationResult = schema.validate(userInput)
  if (validationResult.error)
    throw validationResult.error.details[0].message

  let validatedValue = validationResult.value
  validatedValue.issuedTime = new Date(validatedValue.issuedTime)
  return validatedValue
}

export function createOneReport(reportAccessor: ReportAccessor = new ReportMongoAccessor(),
                                 requestAccessor: RequestAccessor = new RequestMongoAccessor()) {
  return crudUtil.createOne({
    validateOne: async (req, context) => {
      let request = await requestAccessor.getById(req.params.requestId) 

      if (!request)
        throw 'request not found'

      interface LooseObject {
        [key: string]: any
      }

      let data: LooseObject = {};

      data.request = request
      
      if (req.user && !req.user.admin) {
        if (data.request.division.id !== req.user.division.id)
          throw {status:400, cause:'"division" is not allowed'}
        if (data.request.status !== 'accepted')
          throw {status:400, cause:'"status" is not allowed'}
      }

      data.issuedTime = new Date()
      data.content = req.body.content
      data.photo = req.body.photo
      let dataValidated = await validatePostUserInput(data)
      return dataValidated
    },
    insertOne: (object, context) => reportAccessor.insert(object),
    filterFieldOne: filterField
  })
}

async function validatePutUserInput(userInput: any) {
  let rules = {
    issuedTime: joi.number().integer().positive(),
    content: joi.string().min(3).max(1024),
    photo: joi.string().min(3).max(1024) 
  }
  let schema = joi.object().keys(rules)
  let validationResult = schema.validate(userInput)
  if (validationResult.error)
    throw validationResult.error.details[0].message

  let validatedValue = validationResult.value
  return validatedValue
}

export function updateOneReport(reportAccessor: ReportAccessor = new ReportMongoAccessor(),
                                 requestAccessor: RequestAccessor = new RequestMongoAccessor()) {
  return crudUtil.updateOne({
    fetchOne: (req, context) => {

      context.body = req.body
      context.user = req.user
      return reportAccessor.getByRequest(req.params.requestId)
    },
    validateOne: async (item, context) => {
      let data = await validatePutUserInput(context.body)

      if (!context.user.admin) {
        if (context.user.division.id !== item.request.division.id)
          throw {status:400, cause:'"division" is not allowed'}
      }

      if (data.request) {
        data.request = await requestAccessor.getById(data.request)
        if (!data.request)
          throw 'request not found'
      }

      context.updatingItem = item
      let result = Object.assign(item, data)

      return result
    },
    updateOne: (reqObject, context) => reportAccessor.update(reqObject),
    filterFieldOne: filterField
  })
}

export function deleteOneReport(reportAccessor: ReportAccessor = new ReportMongoAccessor()) {
  return crudUtil.deleteOne({
    fetchOne: (req, context) => reportAccessor.getByRequest(req.params.requestId),
    deleteOne: (reqObject, context) => {
      reqObject.enabled = false
      return reportAccessor.update(reqObject)
    },
    filterFieldOne: filterField
  })
}