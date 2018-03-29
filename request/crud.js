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
  deleteOneRequest
}