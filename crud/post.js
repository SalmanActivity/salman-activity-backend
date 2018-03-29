var error = require('./error')
var crudUtil = require('./util')

function createOne(option) {
  let requiredFunctions = ['init','validateOne','insertOne','convertOne','filterFieldOne']
  let {init,validateOne,insertOne,convertOne,filterFieldOne} = crudUtil.fetchOptionFunctions(option, requiredFunctions)

  return (req, res, next) => {
    let context = {}

    return init(req, context)
    .then(valInit => validateOne(valInit, context))
    .catch(err => Promise.reject({status: 400, cause: err}))
    .then(object => insertOne(object, context))
    .then(object => convertOne(object, context))
    .then(object => filterFieldOne(object, context))
    .then(object => res.status(200).json(object))
    .catch(error.displayError(res, 'cannot insert object'))
  }
}

module.exports = { createOne }