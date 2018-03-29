var error = require('./error')
var crudUtil = require('./util')

function updateOne(option) {
  let requiredFunctions = ['init','fetchOne','validateOne','updateOne','convertOne','filterFieldOne']
  let {init,fetchOne,validateOne,updateOne,convertOne,filterFieldOne} = crudUtil.fetchOptionFunctions(option, requiredFunctions)

  return (req, res, next) => {
    let context = {}

    return init(req, context)
    .then(valInit => fetchOne(valInit, context))
    .then(object => {
      if (!object)
        return Promise.reject({status: 404, cause: 'object not found'})
      return validateOne(object, context)
      .catch(err => Promise.reject({status: 400, cause: err.message}))
    })
    .then(object => updateOne(object, context))
    .then(object => convertOne(object, context))
    .then(object => filterFieldOne(object, context))
    .then(object => res.status(200).json(object))
    .catch(error.displayError(res, 'cannot insert object'))
  }
}

module.exports = { updateOne }
