import * as async from 'async'
import * as util from 'util'

export function oneToManyFunction(oneFunction) {
  return async function(valArr, context):Promise<any[]> {
    let parallelArr = valArr.map(val => oneFunction.bind(this, val, context))
    let results = await Promise.all(parallelArr)
    let resultArr = []
    for (let i = 0; i < valArr.length; i++)
      if (results[i])
        resultArr.push(results[i])
    return resultArr;
  }
}

export function manyToOneFunction(manyFunction) {
  return async function(result, context):Promise<any> {
    let res = await manyFunction([result], context)
    return result && result.length > 0 ? result[0] : null
  }
}

export function simpleFilterFieldOne(fieldArr) {
  return async function(obj, context):Promise<any> {
    let newObj = {}
    for (let key in obj)
      if (fieldArr.includes(key))
        newObj[key] = obj[key]
    return newObj
  }
}

export function defaultFunction(func) {
  let init = async (req, context) => req

  let deleteOne = async (item, context) => item

  let fetchOne = async (item, context) => item

  let filterOne = async (item, context) => item

  let convertOne = async (item, context) => item

  let filterFieldOne = async (item, context) => item

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

export function fetchOptionFunctions(option:any[], functionNeeded:string[]):any {
  let result = {}
  for (let func of functionNeeded) {
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

  return result
}
