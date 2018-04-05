import { displayError } from './error'
import * as crudUtil from './util'

export function deleteOne(option) {
  let requiredFunctions = ['init', 'deleteOne', 'fetchOne', 'filterFieldOne']
  let { init, deleteOne, fetchOne, filterFieldOne } = crudUtil.fetchOptionFunctions(option, requiredFunctions)
  
  return async (req, res, next) => {
    let context = {}
    let fetchedObject = {}

    try {
      let object:any = await init(req, context)
      object = await fetchOne(object, context)
      if (object)
        fetchedObject = object
      else
        throw {status:404, cause: 'object not found'}
      object = await deleteOne(object, context)
      object = await filterFieldOne(fetchedObject, context)
      res.status(202).json(object)
    } catch(err) {
      displayError(res, 'cannot delete object')(err)
    }
  }
}
