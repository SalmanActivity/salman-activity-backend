var error = require('./error')
var crudUtil = require('./util')

function deleteOne(option) {
  let requiredFunctions = ['init', 'deleteOne', 'fetchOne', 'filterFieldOne']
  let { init, deleteOne, fetchOne, filterFieldOne } = crudUtil.fetchOptionFunctions(option, requiredFunctions)
  
  return (req, res, next) => {
    let context = {}
    let fetchedObject = {}

    return init(req, context)
      .then(object => fetchOne(object, context))
      .then(object => {
        if (object) {
          fetchedObject = object
            return object
        }
        return Promise.reject({status:404, cause: 'object not found'})
      })
      .then(object => deleteOne(object, context))
      .then(object => filterFieldOne ? filterFieldOne(fetchedObject, context) : fetchedObject)
      .then(object => res.status(202).json(object))
      .catch(error.displayError(res, 'cannot delete object'))
  }
}

module.exports = { deleteOne }
