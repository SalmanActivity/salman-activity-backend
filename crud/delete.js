var bluebird = require('bluebird')
var error = require('./error')
var crudUtil = require('./util')

function deleteOne(option) {
    return (req, res, next) => {
        if (!option.init)
            option.init = (req, context, callback) => callback(null, req)

        if (!option.deleteOne && option.deleteMany)
            option.deleteMany = crudUtil.manyToOneFunction(option.deleteMany)
        
        let context = {}
        let fetchedObject = {}

        return bluebird.promisify(option.init)(req, context)
        .then(object => bluebird.promisify(option.fetchOne)(object, context))
        .then(object => {
            if (object) {
                fetchedObject = object
                return object
            }
            return Promise.reject({status:404, cause: 'object not found'})
        })
        .then(object => bluebird.promisify(option.deleteOne)(object, context))
        .then(object => res.status(202).json(fetchedObject))
        .catch(error.displayError(res, 'cannot delete object'))
    }
}

module.exports = { deleteOne }