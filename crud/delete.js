var bluebird = require('bluebird')
var error = require('./error')

function deleteFindDelete(findFunction, deleteFunction) {
    return (req, res, next) => {
        let objectFound
        bluebird.promisify(findFunction)(req)
        .then(object => {
            if (object) {
                objectFound = object
                return object
            }
            return Promise.reject({status:404, cause: 'object not found'})
        })
        .then(object => bluebird.promisify(deleteFunction)(req, object))
        .then(object => res.status(202).json(objectFound))
        .catch(error.displayError(res, 'cannot delete object'))
    }
}

module.exports = { deleteFindDelete }