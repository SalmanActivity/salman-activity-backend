import * as async from 'async'
import * as util from 'util'

export function oneToManyFunction(oneFunction) {
  return async function(valArr, context):Promise<any[]> {
    let parallelArr = valArr.map(val => oneFunction(val, context))
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

    for (let key of fieldArr) {
      let paths = key.split('.')
      let newObjRecurse = newObj
      let objRecurse = obj
      let exists = true
      for (let idx of paths.slice(0,-1)) {
        if (!objRecurse || !(idx in objRecurse)) {
          exists = false
          break
        }
        objRecurse = objRecurse[idx]

        if (!(idx in newObjRecurse))
          newObjRecurse[idx] = {}
        newObjRecurse = newObjRecurse[idx]
      }
      if (!exists)
        continue
      let localKey = paths[paths.length - 1]
      if (objRecurse && localKey in objRecurse)
        newObjRecurse[localKey] = objRecurse[localKey]
    }

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

  let deleteMany = oneToManyFunction(deleteOne) 

  let fetchMany = oneToManyFunction(fetchOne)

  let filterMany = oneToManyFunction(filterOne)

  let convertMany = oneToManyFunction(convertOne)

  let filterFieldMany = oneToManyFunction(filterFieldOne)

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
