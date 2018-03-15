var bluebird = require('bluebird')
var error = require('./error')

function postValidateFindInsertConvert(validateFunction, insertFunction, convertFunction, filterField) {
    return (req, res, next) => {
        let context = {}

        return bluebird.promisify(validateFunction)(req, context)
        .catch(err => Promise.reject({status: 400, cause: err.message}))
        .then(validatedData => bluebird.promisify(insertFunction)(validatedData, context))
        .then(insertedData => bluebird.promisify(convertFunction)(insertedData, context))
        .then(convertedData => bluebird.promisify(filterField)(convertedData, context))
        .then(filteredFieldsData => res.status(200).json(filteredFieldsData))
        .catch(error.displayError(res, 'cannot insert object'))
    }
}

module.exports = { postValidateFindInsertConvert }