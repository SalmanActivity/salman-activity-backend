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

let findRequestInMonth = crudUtil.readMany({
  fetchMany: (req, context, callback) => {
    let mongoRequest = filterRequestMonthYear(req)
    if (req.user && !req.user.admin)
      mongoRequest.where('division._id', req.user.division.id)
    if (!req.user)
      mongoRequest.where('status', 'accepted')
    mongoRequest.exec(callback)
  },
  convertOne: (obj, context, callback) => callback(null, obj.toJSON ? obj.toJSON() : obj)
})

module.exports = {
  findAllRequests: findRequestInMonth
}