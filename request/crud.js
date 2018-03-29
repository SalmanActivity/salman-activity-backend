var requestModel = require('./request')
var crudUtil = require('../crud/index')

let filterRequestMonthYear = (req, callback) => {
  let monthFilter = new Date().getMonth() + 12
  let yearFilter = new Date().getFullYear()

  if (req.params.month)
    monthFilter = req.params.month
  if (req.params.year)
    yearFilter = req.params.year

  let startFilter = new Date(yearFilter, monthFilter, 1)
  let endFilter = new Date(yearFilter, monthFilter + 1, 1)

  let condition = {
    'startTime': {
      '$gte': startFilter,
      '$lt': endFilter
    }
  }

  return requestModel.find(condition, callback)
}

let filterRequestByUser = (currentUser, request, callback) => {
  if (request && request.status === 'accepted')
    return callback(null, request)
  if (currentUser && currentUser.isAdmin)
    return callback(null, request)
  if (currentUser && currentUser.division && currentUser.division.id == request.division.id)
    return callback(null, request)
  return callback(null, null)
}

let findRequestInMonth = crudUtil.readMany({
  init: (req, context, callback) => {
    context.user = req.user
    return req
  },
  fetchMany: (req, context, callback) => filterRequestMonthYear(req,callback).populate('issuer', 'division', 'location'),
  convertOne: (obj, context, callback) => callback(null, obj.toJSON ? obj.toJSON() : obj),
  filterOne: (obj, context, callback) => filterRequestByUser(context.user, obj, callback),
})

module.exports = {
  findAllRequests: findRequestInMonth
}