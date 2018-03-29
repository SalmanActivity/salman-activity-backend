var requestModel = require('./request')
var crudUtil = require('../crud/index')

let filterRequestMonthYear = (req, callback) => {
  let monthFilter = new Date().getMonth()
  let yearFilter = new Date().getFullYear()

  if (req.params.month)
    monthFilter = Number(req.params.month) - 1
  if (req.params.year)
    yearFilter = Number(req.params.year) - 1

  let startFilter = new Date(yearFilter, monthFilter, 1)
  let endFilter = new Date(yearFilter, monthFilter + 1, 1)

  let condition = {
    'startTime': {
      '$gte': startFilter,
      '$lt': endFilter
    }
  }

  return requestModel.find(condition, callback)
    .populate('issuer').populate('division').populate('location')
}

let filterRequestByUser = (currentUser, request, callback) => {
  if (request && request.status === 'accepted')
    return callback(null, request)
  if (currentUser && currentUser.admin)
    return callback(null, request)
  if (currentUser && currentUser.division && currentUser.division.id == request.division.id)
    return callback(null, request)
  return callback(null, null)
}

let findRequestInMonth = crudUtil.readMany({
  init: (req, context, callback) => {
    context.user = req.user
    return callback(null, req)
  },
  fetchMany: (req, context, callback) => filterRequestMonthYear(req,callback),
  convertOne: (obj, context, callback) => callback(null, obj.toJSON ? obj.toJSON() : obj),
  filterOne: (obj, context, callback) => filterRequestByUser(context.user, obj, callback),
})

module.exports = {
  findAllRequests: findRequestInMonth
}