import { displayError } from './error'
import * as crudUtil from './util'

export function createOne(option) {
  let requiredFunctions = ['init','validateOne','insertOne','convertOne','filterFieldOne']
  let {init,validateOne,insertOne,convertOne,filterFieldOne} = crudUtil.fetchOptionFunctions(option, requiredFunctions)

  return async (req, res, next) => {
    let context = {}
    
    try {
      let object:any = await init(req, context)
      try {
        object = await validateOne(object, context)
      } catch (err) {
        throw {status:400, cause:err}
      }
      object = await insertOne(object, context)
      object = await convertOne(object, context)
      object = await filterFieldOne(object, context)
      res.status(200).json(object)
    } catch (err) {
      displayError(res, 'cannot insert object')(err)
    }
  }
}