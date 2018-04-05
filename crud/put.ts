import { displayError } from './error'
import * as crudUtil from './util'

export function updateOne(option) {
  let requiredFunctions = ['init','fetchOne','validateOne','updateOne','convertOne','filterFieldOne']
  let {init,fetchOne,validateOne,updateOne,convertOne,filterFieldOne} = crudUtil.fetchOptionFunctions(option, requiredFunctions)

  return async (req, res, next) => {
    let context = {}

    try {
      let object:any = init(req, context)
      object = await fetchOne(object, context)
      if (!object)
        throw {status:404, cause: 'object not found'}
      try {
        object = await validateOne(object, context)
      } catch (err) {
        if (err.status)
          throw err
        else
          throw {status:400, cause: err}
      }
      object = await updateOne(object, context)
      object = await convertOne(object, context)
      object = await filterFieldOne(object, context)
      res.status(200).json(object)
    } catch (err) {
      displayError(res, 'cannot update object')(err)
    }
  }
}
