var bluebird = require('bluebird')
var async = require('async')
var debug = require('debug')('crud-debug')

function getFetchConvertFilter(fetchFunction, convertFunction, filterFunction, filterField) {
    return (req, res, next) => {
        // fetch
        bluebird.promisify(fetchFunction)(req)
        .then(valArr => {
            // convert
            let parallelArr = valArr.map(val => convertFunction.bind(this, req, val))
            return bluebird.promisify(async.parallel)(parallelArr)
        })
        .then(valArr => {
            // filter
            let parallelArr = valArr.map(val => filterFunction.bind(this, req, val))
            return bluebird.promisify(async.parallel)(parallelArr)
            .then(filteredArr => {
                let resultArr = []
                for (let i = 0; i < valArr.length; i++)
                    if (filteredArr[i])
                        resultArr.push(valArr[i])
                return resultArr
            })
        })
        .then(valArr => {
            // filter field
            let parallelArr = valArr.map(val => filterField.bind(this, req, val))
            return bluebird.promisify(async.parallel)(parallelArr)
        })
        .then(valArr => {
            // display result
            res.status(200).json(valArr)
        })
        .catch(err => {
            debug(err)
            if (!err.status)
                err = {status: 500, cause: 'internal server error'}
            
            res.status(err.status).json({
                error: {
                    msg: 'cannot fetch objects',
                    cause: err.cause
                }
            })
        })
    }
}

function getOneFetchConvertFilter(fetchFunction, convertFunction, filterFunction, filterField) {
    return (req, res, next) => {
        // fetch
        bluebird.promisify(fetchFunction)(req)
        .then(result => {
            // convert
            if (result)
                return bluebird.promisify(convertFunction)(req, result)
            return Promise.reject({status:404, cause: 'object not found'})
        })
        .then(result => {
            // filter
            if (result)
                return bluebird.promisify(filterFunction)(req, result)
                .then(filtered => filtered ? filtered : Promise.reject({status:404, cause: 'object not found'}))
            return Promise.reject({status:404, cause: 'object not found'})
        })
        .then(result => {
            // filter field
            return bluebird.promisify(filterField)(req, result)
        })
        .then(result => {
            // display result
            res.status(200).json(result)
        })
        .catch(err => {
            debug(err)
            if (!err.status)
                err = {status: 500, cause: 'internal server error'}
            
            res.status(err.status).json({
                error: {
                    msg: 'cannot fetch specific object',
                    cause: err.cause
                }
            })
        })
    }
}

function fields(fieldArr) {
    return (req, obj, callback) => {
        obj = JSON.parse(JSON.stringify(obj))

        let deletedKeys = []
        if (obj && typeof obj === 'object')
            for (let key in obj)
                if (!fieldArr.includes(key))
                    deletedKeys.push(key)

        for (let key of deletedKeys)
            delete obj[key]

        callback(null, obj)
    }
}

module.exports = { getFetchConvertFilter, getOneFetchConvertFilter, fields }