var async = require('async')

function oneToManyFunction(oneFunction) {
    return (valArr, context, callback) => {
        let parallelArr = valArr.map(val => oneFunction.bind(this, val, context))
        async.parallel(parallelArr, (err, result) => {
            if (err)
                return callback(err, null)
            
            let resultArr = []
            for (let i = 0; i < valArr.length; i++)
                if (result[i])
                    resultArr.push(valArr[i])
            return callback(null, resultArr)
        })
    }
}

function manyToOneFunction(manyFunction) {
    return (result, context, callback) => {
        manyFunction([result], context, (err, result) => {
            if (err)
                callback(err, null)
            else
                callback(null, result && result.length > 0 ? result[0] : null)
        })
    }
}

function simpleFilterFieldOne(fieldArr) {
    return (obj, context, callback) => {
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

module.exports = { oneToManyFunction, manyToOneFunction, simpleFilterFieldOne }