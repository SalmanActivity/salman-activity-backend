import ReportAccessor from './reportAccessor'
import Report from './report'
import ReportMongoAccessor from './reportMongoAccessor'
import { DivisionAccessor, DivisionMongoAccessor } from '../division'
import { LocationAccessor, LocationMongoAccessor } from '../location'
import { RequestAccessor, RequestMongoAccessor } from '../request'
import * as crudUtil from '../crud'
import * as joi from 'joi'
import { loadPhotoFromBase64 } from '../photo';

async function fetchReportByMonth(req, reportAccessor: ReportAccessor) {
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
  'content',
  'photo'])

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
    fetchOne: async (req, context) => {
      let report = await reportAccessor.getByRequestId(req.params.requestId)
      if (!context.user.admin && context.user.division.id !== report.request.division.id)
        throw {status:403, cause: 'unauthorized division'}
      return report
    },
    filterOne: (reqObject, context) => filterResultByUser(context.user, reqObject),
    filterFieldOne: filterField
  })
}

export function findReportImageByRequest(reportAccessor: ReportAccessor = new ReportMongoAccessor()) {
  return async (req, res) => {
    try {
      let report = await reportAccessor.getByRequestId(req.params.requestId)

      if (!report)
        throw {status: 404, cause: 'no report found'}
      
      if (!req.user)
        throw {status:403, cause: 'unauthorized access'}

      if (!req.user.admin && req.user.division.id !== report.request.division.id)
        throw {status:403, cause: 'unauthorized division'}
      
      res.set('Content-Type', report.photo.mime)
      report.photo.readableStream.pipe(res)
    } catch (err) {
      if (err.status)
        return res.status(err.status).json({
          error: {
            msg: 'fetch image error',
            cause: err.cause
          }
        })
      return res.status(500).json({
        error: {
          msg: 'internal server error',
          cause: err
        }
      })
    }
  }
}

async function validatePostUserInput(userInput: any) {
  let rules = {
    content: joi.string().min(3).max(1024).required(),
    photo: joi.string()
  }
  let schema = joi.object().keys(rules)
  let validationResult = schema.validate(userInput)
  if (validationResult.error)
    throw validationResult.error.details[0].message

  let validatedValue = validationResult.value
  validatedValue.issuedTime = new Date()
  return validatedValue
}

export function createOneReport(reportAccessor: ReportAccessor = new ReportMongoAccessor(),
                                requestAccessor: RequestAccessor = new RequestMongoAccessor()) {
  return crudUtil.createOne({
    validateOne: async (req, context) => {
      let request = await requestAccessor.getById(req.params.requestId) 
      if (!request)
        throw {status: 404, cause: 'request not found'}
      
      if (req.user && !req.user.admin) {
        if (request.division.id !== req.user.division.id)
          throw {status: 403, cause: 'unauthorized division'}
        if (request.status !== 'accepted')
          throw {status: 400, cause: 'request not yet accepted'}
      }

      let report = await reportAccessor.getByRequestId(req.params.requestId)
      if (report)
        throw {status: 400, cause: 'report already created'}

      let data = await validatePostUserInput({
        content: req.body.content,
        photo: req.body.photo
      })

      if (data.photo) {
        let photo = await loadPhotoFromBase64(data.photo)
        data.photo.name = report.id
        data.photo.uploadTime = new Date()
        data.photo.readableStream = photo.readableStream
        data.photo.mime = photo.mime
      }

      return data
    },
    insertOne: (object, context) => reportAccessor.insert(object),
    filterFieldOne: filterField
  })
}

async function validatePutUserInput(userInput: any) {
  let rules = {
    content: joi.string().min(3).max(1024),
    photo: joi.string()
  }
  let schema = joi.object().keys(rules)
  let validationResult = schema.validate(userInput)
  if (validationResult.error)
    throw validationResult.error.details[0].message

  return validationResult.value
}

export function updateOneReport(reportAccessor: ReportAccessor = new ReportMongoAccessor(),
                                 requestAccessor: RequestAccessor = new RequestMongoAccessor()) {
  return crudUtil.updateOne({
    fetchOne: (req, context) => {
      context.body = req.body
      context.user = req.user
      return reportAccessor.getByRequestId(req.params.requestId)
    },
    validateOne: async (item, context) => {
      if (context.user && !context.user.admin) {
        if (item.request.division.id !== context.user.division.id)
          throw {status: 403, cause: 'unauthorized division'}
        if (item.request.status !== 'accepted')
          throw {status: 400, cause: 'request not yet accepted'}
      }

      let data = await validatePutUserInput(context.body)
      if (data.photo) {
        let photo = await loadPhotoFromBase64(data.photo)
        item.photo.uploadTime = new Date()
        item.photo.readableStream = photo.readableStream
        item.photo.mime = photo.mime
      }

      if (data.content)
        item.content = data.content

      return item
    },
    updateOne: (reqObject, context) => reportAccessor.update(reqObject),
    filterFieldOne: filterField
  })
}

export function deleteOneReport(reportAccessor: ReportAccessor = new ReportMongoAccessor(),
                                requestAccessor: RequestAccessor = new RequestMongoAccessor()) {
  return crudUtil.deleteOne({
    fetchOne: async (req, context) => {
      let request = await requestAccessor.getById(req.params.requestId) 
      if (!request)
        throw {status: 404, cause: 'request not found'}
      
      let report = await reportAccessor.getByRequestId(req.params.requestId)
      if (!req.user.admin) {
        if (req.user.division.id !== report.request.division.id)
          throw {status:403, cause:'unauthorized division'}
      }
      return report
    },
    deleteOne: (reqObject, context) => reportAccessor.delete(reqObject),
    filterFieldOne: filterField
  })
}
