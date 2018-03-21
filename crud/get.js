var bluebird = require('bluebird')
var async = require('async')
var error = require('./error')
var crudUtil = require('./util')

function readMany(option) {
    if (option.filterOne && !option.filterMany)
        option.filterMany = crudUtil.oneToManyFunction(option.filterOne)

    if (option.convertOne && !option.convertMany)
        option.convertMany = crudUtil.oneToManyFunction(option.convertOne)

    if (option.filterFieldOne && !option.filterFieldMany)
        option.filterFieldMany = crudUtil.oneToManyFunction(option.filterFieldOne)

    if (!option.init)
        option.init = (req, context, callback) => callback(null,req)

    return (req, res, next) => {
        let context = {}
        return bluebird.promisify(option.init)(req, context)
        .then(valInit => bluebird.promisify(option.fetchMany)(valInit, context))
        .then(valArr => bluebird.promisify(option.convertMany)(valArr, context))
        .then(valArr => bluebird.promisify(option.filterMany)(valArr, context))
        .then(valArr => bluebird.promisify(option.filterFieldMany)(valArr, context))
        .then(valArr => res.status(200).json(valArr))
        .catch(error.displayError(res, 'cannot fetch specific object'))
    }
}

function readOne(option) {
    if (!option.convertOne && option.convertMany)
        option.convertOne = crudUtil.manyToOneFunction(option.convertMany)

    if (!option.filterOne && option.filterMany)
        option.filterOne = crudUtil.manyToOneFunction(option.filterMany)

    if (!option.filterFieldOne && option.filterFieldMany)
        option.filterFieldOne = crudUtil.manyToOneFunction(option.filterFieldMany)

    if (!option.init)
        option.init = (req, context, callback) => callback(null,req)

    return (req, res, next) => {
        let context = {}
        return bluebird.promisify(option.init)(req, context)
        .then(valInit => bluebird.promisify(option.fetchOne)(valInit, context))
        .then(result => {
            if (result)
                return bluebird.promisify(option.convertOne)(result, context)
            return Promise.reject({status:404, cause: 'object not found'})
        })
        .then(result => {
            if (result)
                return bluebird.promisify(option.filterOne)(result, context)
                .then(filtered => filtered ? filtered : Promise.reject({status:404, cause: 'object not found'}))
            return Promise.reject({status:404, cause: 'object not found'})
        })
        .then(result => {
            if (result)
                return bluebird.promisify(option.filterFieldOne)(result, context)
            return Promise.reject({status:404, cause: 'object not found'})
        })
        .then(result => res.status(200).json(result))
        .catch(error.displayError(res, 'cannot fetch specific object'))
    }
}

module.exports = { readMany, readOne }
