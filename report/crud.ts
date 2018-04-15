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
      return report.division.id === currentUser.division.id ? report : null
    }
  } else {
    return report.status === 'accepted' && report.enabled ? report : null
  }
}

let filterField = crudUtil.filterOne.fields(['id','image','description',
  'reporter.id','reporter.name','reporter.username','reporter.email',
  'division.id', 'division.name', 'division.enabled',
  'reportTime',
  'request.id',
  'status', 'enabled'])

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


export function findOneReport(reportAccessor: ReportAccessor = new ReportMongoAccessor()) {
  return crudUtil.readOne({
    init: async (req, context) => {
      context.user = req.user
      return req
    },
    fetchOne: (req, context) => reportAccessor.getById(req.params.reportId),
    filterOne: (reqObject, context) => filterResultByUser(context.user, reqObject),
    filterFieldOne: filterField
  })
}

async function validatePostUserInput(userInput: any) {
  let rules = {
    image: joi.string().min(3).required(),
    description: joi.string().max(1024),
    division: joi.string().hex().length(24),
    ///reportTime: joi.number().integer().positive().required(),
    request: joi.string().hex().length(24),
    status: joi.string().allow(['pending','accepted','rejected']),
    enabled: joi.boolean().default(true),
  }
  let schema = joi.object().keys(rules)
  let validationResult = schema.validate(userInput)
  if (validationResult.error)
    throw validationResult.error.details[0].message

  let validatedValue = validationResult.value
  return validatedValue
}

export function createOneReport(reportAccessor: ReportAccessor = new ReportMongoAccessor(),
                                 divisionAccessor: DivisionAccessor = new DivisionMongoAccessor(),
                                 requestAccessor: RequestAccessor = new RequestMongoAccessor()) {
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
        requestAccessor.getById(data.request),
      ])

      if (!res[0])
        throw 'division not found'
      if (!res[1])
        throw 'request not found'

      data.division = res[0]
      data.request = res[1]
      data.reportTime = new Date()
      return data
    },
    insertOne: (object, context) => reportAccessor.insert(object),
    filterFieldOne: filterField
  })
}

async function validatePutUserInput(userInput: any) {
  let rules = {
    image: joi.string().min(3),
    description: joi.string().max(1024),
    division: joi.string().hex().length(24),
    request: joi.string().hex().length(24),
    status: joi.string().allow(['pending','accepted','rejected']),
    enabled: joi.boolean().default(true),
  }
  let schema = joi.object().keys(rules)
  let validationResult = schema.validate(userInput)
  if (validationResult.error)
    throw validationResult.error.details[0].message

  let validatedValue = validationResult.value
  return validatedValue
}

export function updateOneReport(reportAccessor: ReportAccessor = new ReportMongoAccessor(),
                                 divisionAccessor: DivisionAccessor = new DivisionMongoAccessor(),
                                 requestAccessor: RequestAccessor = new RequestMongoAccessor()) {
  return crudUtil.updateOne({
    fetchOne: (req, context) => {
      context.body = req.body
      context.user = req.user
      return reportAccessor.getById(req.params.reportId)
    },
    validateOne: async (item, context) => {
      let data = await validatePutUserInput(context.body)

      if (!context.user.admin && item.status === 'accepted')
        throw {status:403, cause:'trying to update accepted report'}

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
    fetchOne: (req, context) => reportAccessor.getById(req.params.reportId),
    deleteOne: (reqObject, context) => {
      reqObject.enabled = false
      return reportAccessor.update(reqObject)
    },
    filterFieldOne: filterField
  })
}
