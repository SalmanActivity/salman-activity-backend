var async = require('async')
var util = require('util')

function oneToManyFunction(oneFunction) {
  return (valArr, context, callback) => {
    let parallelArr = valArr.map(val => oneFunction.bind(this, val, context))
    async.parallel(parallelArr, (err, result) => {
      if (err)
        return callback(err, null)

      let resultArr = []
      for (let i = 0; i < valArr.length; i++)
        if (result[i])
          resultArr.push(result[i])
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
    let newObj = {}
    for (let key in obj)
      if (fieldArr.includes(key))
        newObj[key] = obj[key]
    callback(null, newObj)
  }
}

function defaultFunction(func) {
  let init = (req, context, callback) => callback(null, req)

  let deleteOne = (item, context, callback) => callback(null, item)

  let fetchOne = (item, context, callback) => callback(null, item)

  let filterOne = (item, context, callback) => callback(null, item)

  let convertOne = (item, context, callback) => callback(null, item)

  let filterFieldOne = (item, context, callback) => callback(null, item)

  let deleteMany = manyToOneFunction(deleteOne) 

  let fetchMany = manyToOneFunction(fetchOne)

  let filterMany = manyToOneFunction(filterOne)

  let convertMany = manyToOneFunction(convertOne)

  let filterFieldMany = manyToOneFunction(filterFieldOne)

  let defaultFunctions = {
    init, deleteOne, fetchOne, filterOne, convertOne, filterFieldOne,
    deleteMany, fetchMany, filterMany, convertMany, filterFieldMany
  }

  return defaultFunctions[func]
}

function fetchOptionFunctions(option, functionNeeded, promisify = true) {
  let result = {}
  for (func of functionNeeded) {
    if (option[func])
      result[func] = option[func]
    else if (func.substr(-3) == 'One') {
      let functionMany = func.substr(0, func.length - 3) + 'Many'
      if (option[functionMany])
        result[func] = manyToOneFunction(option[functionMany])
      else
        result[func] = defaultFunction(func)
    } else if (func.substr(-4) == 'Many') {
      let functionOne = func.substr(0, func.length - 4) + 'One'
      if (option[functionOne])
        result[func] = oneToManyFunction(option[functionOne])
      else
        result[func] = defaultFunction(func)
    } else
      result[func] = defaultFunction(func)
  }

  if (promisify)
    for (let func in result)
      if (result[func] instanceof Function)
        result[func] = util.promisify(result[func])

  return result
}

module.exports = { oneToManyFunction, manyToOneFunction, simpleFilterFieldOne, fetchOptionFunctions }
