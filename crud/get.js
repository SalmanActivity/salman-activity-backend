var bluebird = require('bluebird')
var async = require('async')
var error = require('./error')

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
        .catch(error.displayError(res, 'cannot fetch specific object'))
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
        .catch(error.displayError(res, 'cannot fetch specific object'))
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