var error = require('./error')
var crudUtil = require('./util')

function readMany(option) {
  let requiredFunctions = ['init','fetchMany','convertMany','filterMany','filterFieldMany']
  let {init,fetchMany,convertMany,filterMany,filterFieldMany} = crudUtil.fetchOptionFunctions(option, requiredFunctions)

  return (req, res, next) => {
    let context = {}
    return init(req, context)
    .then(valInit => fetchMany(valInit, context))
    .then(valArr => convertMany(valArr, context))
    .then(valArr => filterMany(valArr, context))
    .then(valArr => filterFieldMany(valArr, context))
    .then(valArr => res.status(200).json(valArr))
    .catch(error.displayError(res, 'cannot fetch specific object'))
  }
}

function readOne(option) {
  let requiredFunctions = ['init','fetchOne','convertOne','filterOne','filterFieldOne']
  let {init,fetchOne,convertOne,filterOne,filterFieldOne} = crudUtil.fetchOptionFunctions(option, requiredFunctions)

  return (req, res, next) => {
    let context = {}
    return init(req, context)
    .then(valInit => fetchOne(valInit, context))
    .then(result => {
      if (result)
        return convertOne(result, context)
      return Promise.reject({status:404, cause: 'object not found'})
    })
    .then(result => {
      if (result)
        return filterOne(result, context)
        .then(filtered => filtered ? filtered : Promise.reject({status:404, cause: 'object not found'}))
      return Promise.reject({status:404, cause: 'object not found'})
    })
    .then(result => {
      if (result)
        return filterFieldOne(result, context)
      return Promise.reject({status:404, cause: 'object not found'})
    })
    .then(result => res.status(200).json(result))
    .catch(error.displayError(res, 'cannot fetch specific object'))
  }
}

module.exports = { readMany, readOne }
