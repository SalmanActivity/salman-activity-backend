var bluebird = require('bluebird')
var error = require('./error')
var crudUtil = require('./util')

function updateOne(option) {
  if (option.validateMany && !option.validateOne)
    option.validateOne = crudUtil.manyToOneFunction(option.validateMany)

  if (option.insertMany && !option.insertOne)
    option.insertOne = crudUtil.manyToOneFunction(option.insertMany)

  if (option.convertMany && !option.convertOne)
    option.convertOne = crudUtil.manyToOneFunction(option.convertMany)

  if (option.filterFieldMany && !option.filterFieldOne)
    option.filterFieldOne = crudUtil.manyToOneFunction(option.filterFieldMany)

  if (!option.init)
    option.init = (req, context, callback) => callback(null,req)

  return (req, res, next) => {
    let context = {}

    return bluebird.promisify(option.init)(req, context)
    .then(valInit => bluebird.promisify(option.fetchOne)(valInit, context))
    .then(object => {
      if (!object)
        return Promise.reject({status: 404, cause: 'object not found'})
      return bluebird.promisify(option.validateOne)(object, context)
      .catch(err => Promise.reject({status: 400, cause: err.message}))
    })
    .then(object => bluebird.promisify(option.updateOne)(object, context))
    .then(object => bluebird.promisify(option.convertOne)(object, context))
    .then(object => bluebird.promisify(option.filterFieldOne)(object, context))
    .then(object => res.status(200).json(object))
    .catch(error.displayError(res, 'cannot insert object'))
  }
}

module.exports = { updateOne }
